// ============================================================
// SENDER.JS — Worker de Envio em Segundo Plano
// Injetado pelo background.js em uma aba OCULTA do WhatsApp
// A aba é criada com { active: false } e fechada após o envio
// ============================================================

(async function () {
    const LOG_PREFIX = '[WA Plus Sender]';

    function log(msg, ...args) {
        console.log(`${LOG_PREFIX} ${msg}`, ...args);
    }

    function logError(msg, ...args) {
        console.error(`${LOG_PREFIX} ❌ ${msg}`, ...args);
    }

    function reportResult(success, reason = '') {
        chrome.runtime.sendMessage({
            action: 'sender_result',
            success,
            reason
        });
    }

    // ----------------------------------------------------------
    // Aguarda um elemento aparecer no DOM com polling
    // ----------------------------------------------------------
    function waitForElement(selector, timeoutMs = 20000, intervalMs = 500) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() - start > timeoutMs) {
                    return reject(new Error(`Timeout aguardando: ${selector}`));
                }
                setTimeout(check, intervalMs);
            };
            check();
        });
    }

    // ----------------------------------------------------------
    // Delay simples
    // ----------------------------------------------------------
    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    // ----------------------------------------------------------
    // 1. Verifica se o WhatsApp está logado
    //    QR code visível = não logado
    // ----------------------------------------------------------
    function isLoggedOut() {
        // Presença de QR code ou tela de loading sem a UI principal
        return !!(
            document.querySelector('div[data-ref]') ||          // QR code
            document.querySelector('canvas[aria-label]') ||     // QR canvas
            document.querySelector('div[data-testid="qrcode"]') // alternativo
        );
    }

    // ----------------------------------------------------------
    // 2. Verifica se a conversa carregou (campo de texto presente)
    // ----------------------------------------------------------
    function findMessageInput() {
        return (
            document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
            document.querySelector('footer div[contenteditable="true"]') ||
            document.querySelector('div[contenteditable="true"][aria-label]') ||
            document.querySelector('div[role="textbox"]')
        );
    }

    // ----------------------------------------------------------
    // 3. Verifica se a página exibiu erro de número inválido
    // ----------------------------------------------------------
    function hasInvalidNumberError() {
        const body = document.body?.innerText || '';
        return (
            body.includes('número de telefone compartilhado') ||
            body.includes('Phone number shared via url is invalid') ||
            document.querySelector('[data-animate-modal-popup="true"]') !== null
        );
    }

    // ----------------------------------------------------------
    // MAIN
    // ----------------------------------------------------------
    log('🚀 Sender iniciado');

    // Aguarda a página ter algum conteúdo mínimo
    await delay(3000);

    // 1. Verificar login
    if (isLoggedOut()) {
        logError('WhatsApp não está logado (QR code detectado)');
        reportResult(false, 'no_session');
        return;
    }

    log('✅ Sessão detectada, aguardando carregamento da conversa...');

    // 2. Aguardar campo de mensagem aparecer (conversa abriu via URL)
    let messageInput;
    try {
        messageInput = await waitForElement(
            'div[contenteditable="true"][data-tab="10"], footer div[contenteditable="true"]',
            25000
        );
    } catch (e) {
        // Verifica se foi número inválido
        if (hasInvalidNumberError()) {
            logError('Número de telefone inválido');
            reportResult(false, 'invalid_number');
        } else {
            logError('Conversa não carregou no tempo esperado:', e.message);
            reportResult(false, 'timeout');
        }
        return;
    }

    // Verificação extra de número inválido após carregamento
    await delay(500);
    if (hasInvalidNumberError()) {
        logError('Número de telefone inválido (detectado após carregamento)');
        reportResult(false, 'invalid_number');
        return;
    }

    log('✅ Conversa carregada! Campo de mensagem encontrado.');

    // 3. Aguarda botão de enviar estar disponível
    //    (O texto já foi pré-preenchido via URL, mas o botão pode demorar)
    await delay(1000);

    // 4. Localizar botão de enviar
    let sendButton = (
        document.querySelector('button[aria-label="Enviar"]') ||
        document.querySelector('button[aria-label="Send"]') ||
        document.querySelector('span[data-icon="send"]')?.closest('button') ||
        document.querySelector('button[data-tab="11"]')
    );

    if (!sendButton) {
        // Tenta aguardar mais um pouco
        await delay(2000);
        sendButton = (
            document.querySelector('button[aria-label="Enviar"]') ||
            document.querySelector('button[aria-label="Send"]') ||
            document.querySelector('span[data-icon="send"]')?.closest('button') ||
            document.querySelector('button[data-tab="11"]')
        );
    }

    if (!sendButton) {
        logError('Botão de enviar não encontrado');

        // Fallback: tenta pressionando Enter no campo de texto
        log('⚠️ Tentando fallback com tecla Enter...');
        messageInput.focus();
        await delay(300);

        const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            keyCode: 13
        });
        messageInput.dispatchEvent(enterEvent);

        await delay(2000);

        // Verifica se a mensagem sumiu do campo (indicativo de envio)
        const currentText = messageInput.innerText?.trim();
        if (!currentText || currentText.length === 0) {
            log('✅ Mensagem enviada via Enter (campo limpo após envio)');
            reportResult(true, 'sent_via_enter');
        } else {
            logError('Falha no fallback Enter — campo ainda contém texto');
            reportResult(false, 'no_send_button');
        }
        return;
    }

    // 5. Clicar no botão de enviar
    log('📤 Clicando no botão de enviar...');
    sendButton.click();

    // 6. Aguarda confirmação (campo de texto limpa após envio)
    await delay(2000);
    
    const textAfterSend = messageInput.innerText?.trim();
    if (!textAfterSend || textAfterSend.length === 0) {
        log('✅ Mensagem enviada com sucesso!');
        reportResult(true, 'sent');
    } else {
        // Pode ter enviado mesmo assim (WA às vezes mantém o cursor)
        log('⚠️ Campo ainda tem texto, mas o envio provavelmente ocorreu. Reportando sucesso.');
        reportResult(true, 'sent_assumed');
    }
})();
