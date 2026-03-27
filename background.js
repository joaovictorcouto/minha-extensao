chrome.runtime.onInstalled.addListener(() => {
  console.log('WA Plus instalado com sucesso!');
});


// Ao clicar no ícone da extensão:
// - Se já existir aba do WhatsApp, ativa essa aba e abre/fecha o painel
// - Se não existir, cria UMA aba nova do WhatsApp
chrome.action.onClicked.addListener(async () => {
  // Procura aba do WhatsApp Web já aberta
  const tabs = await chrome.tabs.query({
    url: '*://web.whatsapp.com/*'   // ← filtro direto
  });

  let whatsappTab = tabs[0];

  if (!whatsappTab) {
    whatsappTab = await chrome.tabs.create({
      url: 'https://web.whatsapp.com',
      active: true
    });
    return;
  }

  await chrome.tabs.update(whatsappTab.id, { active: true });
  await chrome.windows.update(whatsappTab.windowId, { focused: true });

  try {
    await chrome.scripting.executeScript({
      target: { tabId: whatsappTab.id },
      func: () => {
        if (typeof toggleWaPlusPanel === 'function') {
          toggleWaPlusPanel();
        }
      }
    });
  } catch (e) {
    console.warn('Não foi possível executar toggleWaPlusPanel:', e);
  }
});


// ========================================
// MENSAGEM AUTOMÁTICA (AGENDAMENTO)
// ========================================
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('wa_msg_')) {
    const msgId = alarm.name;
    const data = await chrome.storage.local.get(msgId);
    
    if (data[msgId]) {
      const msgData = data[msgId];
      if (msgData.status === 'paused' || msgData.status === 'sent') return;
      
      // Procura abas do WhatsApp
      const tabs = await chrome.tabs.query({ url: '*://web.whatsapp.com/*' });
      
      if (tabs.length > 0) {
        // Envia mensagem para a primeira aba encontrada
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'send_scheduled_message',
          data: msgData
        });
        
        // Atualiza status para 'sent' em vez de remover
        msgData.status = 'sent';
        msgData.sentAt = Date.now();
        chrome.storage.local.set({ [msgId]: msgData });
      } else {
        console.warn('Alarme disparou, mas o WhatsApp Web não está aberto.');
        // Opcional: tentar novamente, aqui ele morre na praia por enquanto.
      }
    }
  }
});

// Listener para receber ações do painel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'schedule_message') {
    const msgData = request.data;
    const { id, scheduledTime } = msgData;

    chrome.storage.local.set({ [id]: msgData }, () => {
      chrome.alarms.create(id, { when: scheduledTime });
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'pause_message') {
    chrome.alarms.clear(request.id);
    chrome.storage.local.get(request.id, (data) => {
      if (data[request.id]) {
        data[request.id].status = 'paused';
        chrome.storage.local.set({ [request.id]: data[request.id] }, () => sendResponse({success: true}));
      }
    });
    return true;
  }

  if (request.action === 'resume_message') {
    chrome.alarms.create(request.id, { when: request.scheduledTime });
    chrome.storage.local.get(request.id, (data) => {
      if (data[request.id]) {
        data[request.id].status = 'pending';
        chrome.storage.local.set({ [request.id]: data[request.id] }, () => sendResponse({success: true}));
      }
    });
    return true;
  }

  if (request.action === 'cancel_message') {
    chrome.alarms.clear(request.id);
    chrome.storage.local.remove(request.id, () => sendResponse({success: true}));
    return true;
  }

  if (request.action === 'clear_history') {
    chrome.storage.local.get(null, (allData) => {
      const keysToRemove = Object.keys(allData).filter(key => 
        key.startsWith('wa_msg_') && allData[key].status === 'sent'
      );
      chrome.storage.local.remove(keysToRemove, () => sendResponse({success: true}));
    });
    return true;
  }
});
