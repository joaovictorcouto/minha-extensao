chrome.runtime.onInstalled.addListener(() => {
  console.log('WA Plus instalado com sucesso!');
});


// Ao clicar no ícone da extensão:
// - Se já existir aba do WhatsApp, ativa essa aba e abre/fecha o painel
// - Se não existir, cria UMA aba nova do WhatsApp
chrome.action.onClicked.addListener(async () => {
  // Procura qualquer aba que já esteja com o WhatsApp Web aberto
  const tabs = await chrome.tabs.query({});
  let whatsappTab = tabs.find(t => t.url && t.url.includes('web.whatsapp.com'));

  if (!whatsappTab) {
    // Não existe aba do WhatsApp: cria uma nova e sai
    whatsappTab = await chrome.tabs.create({
      url: 'https://web.whatsapp.com',
      active: true
    });
    return; // painel será aberto num próximo clique, quando o content.js já estiver carregado
  }

  // Já existe aba do WhatsApp: foca nela
  await chrome.tabs.update(whatsappTab.id, { active: true });
  await chrome.windows.update(whatsappTab.windowId, { focused: true });

  // Tenta abrir/fechar o painel na aba do WhatsApp
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

