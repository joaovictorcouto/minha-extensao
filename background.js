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


