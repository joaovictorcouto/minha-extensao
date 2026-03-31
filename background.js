// ============================================================
// BACKGROUND.JS — Orquestrador de Agendamentos
// Gerencia alarmes, cria abas ocultas e controla o ciclo
// completo de envio sem interferir na aba ativa do usuário
// ============================================================

const LOG = '[WA Plus BG]';

// Mapa de abas de envio em andamento: tabId → msgId
const pendingSenderTabs = new Map();

// ============================================================
// INSTALAÇÃO
// ============================================================
chrome.runtime.onInstalled.addListener(() => {
    console.log(`${LOG} WA Plus instalado com sucesso!`);
});

// ============================================================
// ÍCONE DA EXTENSÃO: Abre/foca o WhatsApp e alterna o painel
// ============================================================
chrome.action.onClicked.addListener(async () => {
    const tabs = await chrome.tabs.query({ url: '*://web.whatsapp.com/*' });
    let whatsappTab = tabs[0];

    if (!whatsappTab) {
        await chrome.tabs.create({ url: 'https://web.whatsapp.com', active: true });
        return;
    }

    await chrome.tabs.update(whatsappTab.id, { active: true });
    await chrome.windows.update(whatsappTab.windowId, { focused: true });

    try {
        await chrome.scripting.executeScript({
            target: { tabId: whatsappTab.id },
            func: () => {
                if (typeof toggleWaPlusPanel === 'function') toggleWaPlusPanel();
            }
        });
    } catch (e) {
        console.warn(`${LOG} Não foi possível executar toggleWaPlusPanel:`, e);
    }
});

// ============================================================
// ALARMES: Disparo de mensagens agendadas
// ============================================================
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (!alarm.name.startsWith('wa_msg_')) return;

    const msgId = alarm.name;
    const stored = await chrome.storage.local.get(msgId);
    const msgData = stored[msgId];

    if (!msgData) {
        console.warn(`${LOG} Alarme "${msgId}" disparou, mas dado não encontrado no storage.`);
        return;
    }

    if (msgData.status === 'paused' || msgData.status === 'sent') {
        console.log(`${LOG} Alarme ignorado — status: ${msgData.status}`);
        return;
    }

    console.log(`${LOG} ⏰ Alarme disparado para: ${msgData.contact}`);
    await dispararEnvioEmSegundoPlano(msgData);
});

// ============================================================
// FUNÇÃO PRINCIPAL: Cria aba oculta e inicia envio
// ============================================================
async function dispararEnvioEmSegundoPlano(msgData) {
    const { id, contact, phone, text } = msgData;

    // Prioridade: campo 'phone' (novo formato) → extração de dígitos de 'contact' (legado)
    const numero = (phone || '').replace(/\D/g, '') || (contact || '').replace(/\D/g, '');

    if (!numero || numero.length < 8) {
        console.error(`${LOG} Número inválido: "${contact}"`);
        await registrarFalha(id, 'invalid_number');
        return;
    }

    // Monta URL direta (pré-preenche a conversa sem buscar por nome)
    const url = `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(text)}`;

    console.log(`${LOG} 📭 Criando aba oculta para envio...`);
    console.log(`${LOG} → Número: ${numero}`);
    console.log(`${LOG} → Mensagem: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);

    let tab;
    try {
        tab = await chrome.tabs.create({ url, active: false });
    } catch (e) {
        console.error(`${LOG} Falha ao criar aba:`, e);
        await registrarFalha(id, 'tab_creation_failed');
        return;
    }

    // Registra aba no mapa de pendentes
    pendingSenderTabs.set(tab.id, id);

    // Timeout de segurança: se não completar em 45s, fecha e registra falha
    const safetyTimer = setTimeout(async () => {
        if (pendingSenderTabs.has(tab.id)) {
            console.error(`${LOG} Timeout de segurança — fechando aba ${tab.id}`);
            pendingSenderTabs.delete(tab.id);
            await registrarFalha(id, 'safety_timeout');
            try { await chrome.tabs.remove(tab.id); } catch (_) {}
        }
    }, 45000);

    // Salva o timer no mapa para poder cancelá-lo
    pendingSenderTabs.set(tab.id, { msgId: id, timer: safetyTimer });
}

// ============================================================
// LISTENER: Aba concluiu carregamento → injeta sender.js
// ============================================================
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!pendingSenderTabs.has(tabId)) return;
    if (changeInfo.status !== 'complete') return;

    // Garante que é uma aba do WhatsApp (segurança)
    if (!tab.url || !tab.url.includes('web.whatsapp.com')) return;

    const entry = pendingSenderTabs.get(tabId);
    const msgId = typeof entry === 'object' ? entry.msgId : entry;

    console.log(`${LOG} ✅ Aba oculta carregada (tab ${tabId}), injetando sender...`);

    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['sender.js']
        });
        console.log(`${LOG} 💉 sender.js injetado na aba ${tabId}`);
    } catch (e) {
        console.error(`${LOG} Falha ao injetar sender.js:`, e);
        await registrarFalha(msgId, 'injection_failed');
        cleanup(tabId);
    }
});

// ============================================================
// LISTENER: Resultado do sender.js (ou do content.js)
// ============================================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // ----- Resultado do envio vindo da aba oculta (sender.js) -----
    if (request.action === 'sender_result') {
        const tabId = sender.tab?.id;
        console.log(`${LOG} 📬 Resultado do sender (tab ${tabId}):`, request);

        let msgId = null;
        if (tabId && pendingSenderTabs.has(tabId)) {
            const entry = pendingSenderTabs.get(tabId);
            msgId = typeof entry === 'object' ? entry.msgId : entry;
        }

        if (msgId) {
            if (request.success) {
                registrarSucesso(msgId);
            } else {
                registrarFalha(msgId, request.reason || 'unknown');
            }
            cleanup(tabId);
        }
        return false;
    }

    // ----- Agendar mensagem -----
    if (request.action === 'schedule_message') {
        const msgData = request.data;
        const { id, scheduledTime } = msgData;
        chrome.storage.local.set({ [id]: msgData }, () => {
            chrome.alarms.create(id, { when: scheduledTime });
            sendResponse({ success: true });
        });
        return true;
    }

    // ----- Pausar mensagem -----
    if (request.action === 'pause_message') {
        chrome.alarms.clear(request.id);
        chrome.storage.local.get(request.id, (data) => {
            if (data[request.id]) {
                data[request.id].status = 'paused';
                chrome.storage.local.set({ [request.id]: data[request.id] }, () => sendResponse({ success: true }));
            }
        });
        return true;
    }

    // ----- Retomar mensagem -----
    if (request.action === 'resume_message') {
        chrome.alarms.create(request.id, { when: request.scheduledTime });
        chrome.storage.local.get(request.id, (data) => {
            if (data[request.id]) {
                data[request.id].status = 'pending';
                chrome.storage.local.set({ [request.id]: data[request.id] }, () => sendResponse({ success: true }));
            }
        });
        return true;
    }

    // ----- Cancelar mensagem -----
    if (request.action === 'cancel_message') {
        chrome.alarms.clear(request.id);
        chrome.storage.local.remove(request.id, () => sendResponse({ success: true }));
        return true;
    }

    // ----- Limpar histórico -----
    if (request.action === 'clear_history') {
        chrome.storage.local.get(null, (allData) => {
            const keysToRemove = Object.keys(allData).filter(key =>
                key.startsWith('wa_msg_') && allData[key].status === 'sent'
            );
            chrome.storage.local.remove(keysToRemove, () => sendResponse({ success: true }));
        });
        return true;
    }
});

// ============================================================
// HELPERS: Registrar resultado no storage
// ============================================================
async function registrarSucesso(msgId) {
    const stored = await chrome.storage.local.get(msgId);
    if (!stored[msgId]) return;
    stored[msgId].status = 'sent';
    stored[msgId].sentAt = Date.now();
    await chrome.storage.local.set({ [msgId]: stored[msgId] });
    console.log(`${LOG} ✅ Status atualizado para 'sent': ${msgId}`);
}

async function registrarFalha(msgId, reason) {
    const stored = await chrome.storage.local.get(msgId);
    if (!stored[msgId]) return;
    stored[msgId].status = 'failed';
    stored[msgId].failReason = reason;
    stored[msgId].failedAt = Date.now();
    await chrome.storage.local.set({ [msgId]: stored[msgId] });
    console.error(`${LOG} ❌ Envio falhou [${reason}]: ${msgId}`);
}

// ============================================================
// HELPERS: Limpar aba oculta
// ============================================================
function cleanup(tabId) {
    const entry = pendingSenderTabs.get(tabId);
    if (entry && typeof entry === 'object' && entry.timer) {
        clearTimeout(entry.timer);
    }
    pendingSenderTabs.delete(tabId);

    // Fecha a aba com delay leve para garantir que o sender.js terminou
    setTimeout(async () => {
        try {
            await chrome.tabs.remove(tabId);
            console.log(`${LOG} 🗑️ Aba oculta ${tabId} fechada`);
        } catch (_) {
            // Aba já pode ter sido fechada manualmente
        }
    }, 1500);
}
