// ========================================
// INICIALIZAÇÃO
// ========================================
console.log('🚀 WA Plus carregado!');

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let buttonAdded = false;
let panelOpen = false;
let sidebarButtonAdded = false;

// Sistema de tentativas SIDEBAR
let sidebarAttempts = 0;
const MAX_SIDEBAR_ATTEMPTS = 5;
let sidebarTimers = [];

// ========================================
// FUNÇÕES AUXILIARES: Cópia de Estilos
// ========================================
function copiarEstilosRecursivamente(elementoOriginal, elementoNovo) {
    const estilos = window.getComputedStyle(elementoOriginal);
    
    if (estilos.cssText !== '') {
        elementoNovo.style.cssText = estilos.cssText;
    } else {
        Array.from(estilos).forEach(prop => {
            elementoNovo.style.setProperty(
                prop,
                estilos.getPropertyValue(prop),
                estilos.getPropertyPriority(prop)
            );
        });
    }
    
    const filhosOriginais = elementoOriginal.children;
    const filhosNovos = elementoNovo.children;
    
    for (let i = 0; i < filhosOriginais.length; i++) {
        if (filhosNovos[i]) {
            copiarEstilosRecursivamente(filhosOriginais[i], filhosNovos[i]);
        }
    }
}


// ========================================
// FUNÇÃO: Criar Botão Sidebar com Clonagem Profunda
// ========================================
function criarBotaoSidebar() {
    if (sidebarButtonAdded || document.getElementById('waplus-sidebar-btn')) {
        return true;
    }

    const botaoOriginal = document.querySelector('[aria-label="Anunciar no Facebook"]') ||
                          document.querySelector('[data-icon="megaphone-refreshed-32"]')?.closest('button');
    
    if (!botaoOriginal) {
        return false;
    }

    const spanWrapper = botaoOriginal.closest('span.html-span');
    if (!spanWrapper) {
        return false;
    }

    const divContainer = spanWrapper.parentElement;
    if (!divContainer || !divContainer.classList.contains('x1c4vz4f')) {
        return false;
    }

    const novoDivContainer = divContainer.cloneNode(true);
    const novoBotao = novoDivContainer.querySelector('button');
    
    if (!novoBotao) {
        return false;
    }
    
    novoBotao.id = 'waplus-sidebar-btn';
    novoBotao.setAttribute('aria-label', 'WA Plus');
    novoBotao.removeAttribute('data-navbar-item-index');

    // Procura o SVG dentro de span[aria-hidden="true"]
    const span = novoBotao.querySelector('span[aria-hidden="true"]');
    if (span) {
        // Remove o SVG clonado
        const svgAntigo = span.querySelector('svg');
        if (svgAntigo) {
            svgAntigo.remove();
        }
        
        // Cria SVG novo do zero
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('class', '');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M16.3392 14.3581C16.3392 14.3581 15.1145 12.855 14.8155 12.4925ZM16.3392 14.3581C16.3392 14.3581 15.4105 13.221 14.8155 12.4925ZM16.3392 14.3581C16.4326 14.4701 16.4691 14.4969 16.4942 14.3387L18.5672 5.96615C18.6241 5.69894 18.5802 5.76379 18.3476 5.87578L7.93727 10.8593C7.68412 10.9801 7.61702 10.9948 7.92436 10.9948L10.8369 10.9943C10.8369 10.9943 11.1135 10.9981 11.1017 11.0013C10.5076 11.6339 8.29892 14.1063 6.23243 15.6749C4.06247 17.3662 2.60942 17.9536 1.54393 18.3603C1.2597 18.4595 1.17578 18.2893 1.17578 18.0763C1.17578 14.6705 1.17581 9.35517 1.17581 9.35517C1.17581 6.47899 3.54282 4.01662 6.44554 4.01662C6.44554 4.01662 16.6879 4.01663 16.7331 4.01663C16.8687 4.01663 16.8558 4.12547 16.8106 4.17801C16.7989 4.19157 15.7696 5.38517 15.7696 5.38517C15.7271 5.43246 15.698 5.4585 15.7773 5.42625C15.7773 5.42625 22.2919 2.38486 22.358 2.35767C22.5582 2.27529 22.8359 2.35772 22.8101 2.69992C22.5194 4.21695 21.9641 7.14746 21.9641 7.14746C21.9641 7.14746 21.7252 8.41917 21.7252 9.34874C21.7252 9.34874 21.7573 11.7892 21.7252 13.1122C21.6606 15.7717 19.4519 18.0828 16.7137 18.1538H8.47982C8.47982 18.1538 3.47486 21.4847 3.28112 21.6138C3.1455 21.7171 2.84197 21.659 2.90655 21.3233C3.10672 20.495 3.51354 18.8135 3.53937 18.7154C3.57166 18.5927 3.67499 18.341 3.92039 18.3087C8.3827 17.2656 11.0869 15.4421 14.6569 12.4925C14.743 12.4213 14.7367 12.3968 14.8155 12.4925');
        path.setAttribute('fill', 'currentColor');
        
        svg.appendChild(path);
        span.appendChild(svg);
    }

    novoBotao.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWaPlusPanel();
    });

    divContainer.parentElement.insertBefore(novoDivContainer, divContainer.nextSibling);

    sidebarButtonAdded = true;
    addCustomTooltip(novoBotao);
    console.log('✅ Botão Sidebar adicionado com sucesso!');
    
    return true;
}


// ========================================
// INICIALIZAÇÃO DO BOTÃO SIDEBAR
// ========================================
function tentarAdicionarBotaoSidebar() {
    sidebarAttempts++;
    
    if (sidebarButtonAdded) return;
    
    const sucesso = criarBotaoSidebar();
    
    if (sucesso) {
        console.log('✅ Cancelando tentativas restantes do Sidebar...');
        sidebarTimers.forEach(timerId => clearTimeout(timerId));
        sidebarTimers = [];
        return;
    }
    
    if (sidebarAttempts >= MAX_SIDEBAR_ATTEMPTS) {
        console.log('⚠️ Botão Sidebar não adicionado. Use o ícone da extensão.');
    }
}

sidebarTimers.push(setTimeout(tentarAdicionarBotaoSidebar, 1000));
sidebarTimers.push(setTimeout(tentarAdicionarBotaoSidebar, 3000));
sidebarTimers.push(setTimeout(tentarAdicionarBotaoSidebar, 5000));
sidebarTimers.push(setTimeout(tentarAdicionarBotaoSidebar, 7000));
sidebarTimers.push(setTimeout(tentarAdicionarBotaoSidebar, 9000));

// ========================================
// FUNÇÃO: Adicionar tooltip customizado
// ========================================
function addCustomTooltip(button) {
  const tooltip = document.createElement('div');
  tooltip.id = 'waplus-tooltip';
  tooltip.textContent = 'WA Plus';  // ← TEXTO DO TOOLTIP (mude aqui)
  
  tooltip.style.cssText = `
    /* POSICIONAMENTO */
    position: fixed;
    visibility: hidden;
    opacity: 0;
    z-index: 9999;
    pointer-events: none;
    
    /* COR E FUNDO */
    background: #ffffff;           /* ← COR DE FUNDO (ex: #111b21 para escuro) */
    color: #111b21;                /* ← COR DO TEXTO (ex: #ffffff para branco) */
    
    /* TAMANHO E ESPAÇAMENTO */
    padding: 6px 12px;             /* ← ESPAÇAMENTO INTERNO (vertical horizontal) */
    border-radius: 4px;            /* ← ARREDONDAMENTO DAS BORDAS (0 = quadrado) */
    
    /* FONTE */
    font-size: 13px;               /* ← TAMANHO DA FONTE (12px, 16px, etc) */
    font-family: "Segoe UI", Helvetica Neue, Helvetica, Lucida Grande, Arial, Ubuntu, Cantarell, Fira Sans, sans-serif;
    font-weight: 400;              /* ← PESO DA FONTE (300=fino, 500=médio, 700=negrito) */
    white-space: nowrap;           /* ← IMPEDE QUEBRA DE LINHA */
    
    /* ANIMAÇÃO */
    transition: opacity 0.15s ease; /* ← VELOCIDADE DA ANIMAÇÃO (0.15s = 150ms) */
    
    /* SOMBRA */
    box-shadow: 0 2px 5px 0 rgba(11, 20, 26, 0.26), 0 2px 10px 0 rgba(11, 20, 26, 0.16);
    /* ↑ SOMBRA (remova a linha inteira para sem sombra) */
  `;
  
  document.body.appendChild(tooltip);

  let showTimeout, hideTimeout;

  button.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    showTimeout = setTimeout(() => {
      const rect = button.getBoundingClientRect();
      
      /* POSIÇÃO DO TOOLTIP */
      tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;  // ← ALINHADO VERTICALMENTE
      tooltip.style.left = `${rect.right + 4}px`;  // ← 4px À DIREITA DO BOTÃO (mude aqui)
      
      /* MOSTRA O TOOLTIP */
      tooltip.style.visibility = 'visible';
      tooltip.style.opacity = '1';
    }, 10);  // ← DELAY ANTES DE APARECER (300ms = 0.3s | mude para 0 = instantâneo)
  });

  button.addEventListener('mouseleave', () => {
    clearTimeout(showTimeout);
    hideTimeout = setTimeout(() => {
      tooltip.style.opacity = '0';
      setTimeout(() => tooltip.style.visibility = 'hidden', 150);  // ← TEMPO DA ANIMAÇÃO DE SAÍDA (deve ser >= transition)
    }, 0);  // ← DELAY ANTES DE SUMIR (0 = imediato | mude para 200 se quiser esperar)
  });
}


// ========================================
// PAINEL LATERAL: Toggle/Abrir/Fechar
// ========================================
function toggleWaPlusPanel() {
    const existingPanel = document.getElementById('waplus-panel');
    
    if (existingPanel) {
        closeWaPlusPanel();
    } else {
        openWaPlusPanel();
    }
}

function openWaPlusPanel() {
    const existingPanel = document.getElementById('waplus-panel');
    if (existingPanel) {
        panelOpen = true;
        return;
    }

    chrome.storage.sync.get([
        'desfoquePersonalizado',
        'blurMessages', 'blurMessagesIntensity',
        'blurNames', 'blurNamesIntensity',
        'blurPhotos', 'blurPhotosIntensity',
        'blurConversa', 'blurConversaIntensity'
    ], (data) => {
        const mensagensChecked = data.blurMessages || false;
        const mensagensValue   = data.blurMessagesIntensity || 5;
        const nomesChecked     = data.blurNames || false;
        const nomesValue       = data.blurNamesIntensity || 5;
        const fotosChecked     = data.blurPhotos || false;
        const fotosValue       = data.blurPhotosIntensity || 10;
        const conversaChecked  = data.blurConversa || false;
        const conversaValue    = data.blurConversaIntensity || 5;

        const panel = document.createElement('div');
        panel.id = 'waplus-panel';
        panel.innerHTML = `
        <div id="waplus-panel-resizer"></div>
        <div class="waplus-tabs">
            <button class="waplus-tab active" data-tab="melhorias">Melhorias</button>
            <button class="waplus-tab" data-tab="mensagens">Mensagens</button>
            <button class="waplus-tab" data-tab="exportacao">Exportação</button>
            <button class="waplus-tab" data-tab="estatisticas">Estatísticas</button>
        </div>
        <div class="waplus-content">
            <div class="waplus-tab-content active" data-content="melhorias">
                <h3>Privacidade</h3>
                
                <!-- CHECKBOX PRINCIPAL (SEM SETINHA) -->
                <div class="waplus-option-row">
                <div class="waplus-option-main">
                    <input type="checkbox" id="desfoque-personalizado" ${data.desfoquePersonalizado ? 'checked' : ''}>
                    <label for="desfoque-personalizado" class="waplus-main-label-static">
                    <span>Desfoque personalizado</span>
                    </label>
                </div>
                </div>

                <!-- SUB-OPÇÕES SEMPRE VISÍVEIS (SEM display: none) -->
                <div id="waplus-blur-suboptions" style="padding-left: 28px;">
                <!-- 1. Fotos dos contatos -->
                <div class="waplus-suboption-row">
                    <label class="waplus-suboption">
                    <span class="waplus-suboption-left">
                        <label class="waplus-toggle">
                        <input type="checkbox" id="desfocar-fotos" ${fotosChecked ? 'checked' : ''}>
                        <span class="waplus-toggle-slider"></span>
                        </label>
                        <span class="waplus-suboption-title">Fotos dos contatos</span>
                    </span>

                    <div class="waplus-compact-slider">
                        <input type="range" id="blur-fotos-intensity" min="0" max="20" value="${fotosValue}" step="1">
                        <span class="waplus-slider-value">${fotosValue}px</span>
                    </div>
                    </label>
                </div>
                
                
                <!-- 2. Nomes dos contatos -->
                <div class="waplus-suboption-row">
                    <label class="waplus-suboption">
                    <span class="waplus-suboption-left">
                        <label class="waplus-toggle">
                        <input type="checkbox" id="desfocar-nomes" ${nomesChecked ? 'checked' : ''}>
                        <span class="waplus-toggle-slider"></span>
                        </label>
                        <span class="waplus-suboption-title">Nomes dos contatos</span>
                    </span>

                    <div class="waplus-compact-slider">
                        <input type="range" id="blur-nomes-intensity" min="0" max="20" value="${nomesValue}" step="1">
                        <span class="waplus-slider-value">${nomesValue}px</span>
                    </div>
                    </label>
                </div>

                
                <!-- 3. Mensagens recentes -->
                <div class="waplus-suboption-row">
                    <label class="waplus-suboption">
                    <span class="waplus-suboption-left">
                        <label class="waplus-toggle">
                        <input type="checkbox" id="desfocar-mensagens" ${mensagensChecked ? 'checked' : ''}>
                        <span class="waplus-toggle-slider"></span>
                        </label>
                        <span class="waplus-suboption-title">Mensagens recentes</span>
                    </span>

                    <div class="waplus-compact-slider">
                        <input type="range" id="blur-mensagens-intensity" min="0" max="20" value="${mensagensValue}" step="1">
                        <span class="waplus-slider-value">${mensagensValue}px</span>
                    </div>
                    </label>
                </div>


                <!-- 4. Mensagens na conversa -->
                <div class="waplus-suboption-row">
                    <label class="waplus-suboption">
                    <span class="waplus-suboption-left">
                        <label class="waplus-toggle">
                        <input type="checkbox" id="desfocar-mensagens-conversa" ${conversaChecked ? 'checked' : ''}>
                        <span class="waplus-toggle-slider"></span>
                        </label>
                        <span class="waplus-suboption-title">Mensagens na conversa</span>
                    </span>

                    <div class="waplus-compact-slider">
                        <input type="range" id="blur-conversa-intensity" min="0" max="20" value="${conversaValue}" step="1">
                        <span class="waplus-slider-value">${conversaValue}px</span>
                    </div>
                    </label>
                </div>

            </div>

            <div class="waplus-tab-content" data-content="mensagens">
                <h3 style="margin-top: 5px;">Agendar Nova Mensagem</h3>
                
                <div class="waplus-schedule-container">
                    <div class="waplus-input-group">
                        <label for="waplus-schedule-contact">Número do Whatsapp (com DDD):</label>
                        <input type="text" id="waplus-schedule-contact" placeholder="Ex: 5511999999999">
                    </div>
                    
                    <div class="waplus-input-group">
                        <label for="waplus-schedule-text">Mensagem:</label>
                        <textarea id="waplus-schedule-text" rows="3" placeholder="Sua mensagem..."></textarea>
                    </div>
                    
                    <div class="waplus-input-group">
                        <label for="waplus-schedule-time">Data e Hora:</label>
                        <input type="datetime-local" id="waplus-schedule-time">
                    </div>
                    
                    <button id="waplus-schedule-btn" class="waplus-btn-primary">Agendar Mensagem</button>
                    <div id="waplus-schedule-status" class="waplus-status-msg"></div>
                </div>

                <!-- GERENCIADOR DE MENSAGENS -->
                <div class="waplus-msg-manager" style="margin-top: 20px;">
                    <div class="waplus-msg-tabs">
                        <button class="waplus-msg-tab active" data-target="scheduled">Agendadas</button>
                        <button class="waplus-msg-tab" data-target="history">Histórico</button>
                    </div>
                    
                    <div id="waplus-scheduled-view" class="waplus-msg-view active">
                        <div id="waplus-scheduled-list" class="waplus-list-container"></div>
                    </div>
                    
                    <div id="waplus-history-view" class="waplus-msg-view" style="display: none;">
                        <button id="waplus-clear-history-btn" class="waplus-btn-secondary" style="margin-bottom: 10px; width: 100%;">Limpar Histórico</button>
                        <div id="waplus-history-list" class="waplus-list-container"></div>
                    </div>
                </div>
            </div>

            <div class="waplus-tab-content" data-content="exportar">
                <h3>Em Breve</h3>
                <p>Funcionalidades de exportação em desenvolvimento...</p>
            </div>

            <div class="waplus-tab-content" data-content="estatisticas">
                <h3>Em Breve</h3>
                <p>Estatísticas em desenvolvimento...</p>
            </div>
        </div>
        <div class="waplus-footer">
            <span>Victor - JZ Viagens (55) 66990-7400</span>
        </div>
        `;

        const badge = document.createElement('div');
        const manifest = chrome.runtime.getManifest();
        const extensionVersion = manifest.version || '1.0.0';
        badge.id = 'waplus-floating-badge';
        badge.innerHTML = `
            <div class="waplus-badge">
                <span class="waplus-badge-logo">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.3392 14.3581C16.3392 14.3581 15.1145 12.855 14.8155 12.4925ZM16.3392 14.3581C16.3392 14.3581 15.4105 13.221 14.8155 12.4925ZM16.3392 14.3581C16.4326 14.4701 16.4691 14.4969 16.4942 14.3387L18.5672 5.96615C18.6241 5.69894 18.5802 5.76379 18.3476 5.87578L7.93727 10.8593C7.68412 10.9801 7.61702 10.9948 7.92436 10.9948L10.8369 10.9943C10.8369 10.9943 11.1135 10.9981 11.1017 11.0013C10.5076 11.6339 8.29892 14.1063 6.23243 15.6749C4.06247 17.3662 2.60942 17.9536 1.54393 18.3603C1.2597 18.4595 1.17578 18.2893 1.17578 18.0763C1.17578 14.6705 1.17581 9.35517 1.17581 9.35517C1.17581 6.47899 3.54282 4.01662 6.44554 4.01662C6.44554 4.01662 16.6879 4.01663 16.7331 4.01663C16.8687 4.01663 16.8558 4.12547 16.8106 4.17801C16.7989 4.19157 15.7696 5.38517 15.7696 5.38517C15.7271 5.43246 15.698 5.4585 15.7773 5.42625C15.7773 5.42625 22.2919 2.38486 22.358 2.35767C22.5582 2.27529 22.8359 2.35772 22.8101 2.69992C22.5194 4.21695 21.9641 7.14746 21.9641 7.14746C21.9641 7.14746 21.7252 8.41917 21.7252 9.34874C21.7252 9.34874 21.7573 11.7892 21.7252 13.1122C21.6606 15.7717 19.4519 18.0828 16.7137 18.1538H8.47982C8.47982 18.1538 3.47486 21.4847 3.28112 21.6138C3.1455 21.7171 2.84197 21.659 2.90655 21.3233C3.10672 20.495 3.51354 18.8135 3.53937 18.7154C3.57166 18.5927 3.67499 18.341 3.92039 18.3087C8.3827 17.2656 11.0869 15.4421 14.6569 12.4925C14.743 12.4213 14.7367 12.3968 14.8155 12.4925" fill="#00a884"/>
                    </svg>
                </span>
                <span class="waplus-badge-text">WA Plus</span>
                <span class="waplus-badge-version">${extensionVersion}</span>
            </div>
        `;
        badge.addEventListener('click', closeWaPlusPanel);

        panel.appendChild(badge);
        
        chrome.storage.sync.get(['panelWidth'], (data2) => {
            if (data2.panelWidth) {
                panel.style.width = data2.panelWidth + 'px';
            }
        });

        document.body.appendChild(panel);
        panelOpen = true;

        setupPanelEvents(panel);
        setupPanelResizer(panel);
    });
}

function closeWaPlusPanel() {
    const panel = document.getElementById('waplus-panel');
    if (panel) {
        panel.remove();
        panelOpen = false;
    }
}

// ========================================
// RESIZE LATERAL DO PAINEL
// ========================================
function setupPanelResizer(panel) {
    const resizer = panel.querySelector('#waplus-panel-resizer');
    if (!resizer) return;

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isResizing = true;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const viewportWidth = window.innerWidth;
        const newWidth = viewportWidth - e.clientX;

        const min = 510;
        const max = viewportWidth * 0.8;

        const clamped = Math.min(Math.max(newWidth, min), max);
        panel.style.width = clamped + 'px';

        chrome.storage.sync.set({ panelWidth: clamped });
    });

    document.addEventListener('mouseup', () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.style.userSelect = '';
    });
}

// ========================================
// FUNÇÃO: Configurar eventos do painel
// ========================================
function setupPanelEvents(panel) {
    const tabs = panel.querySelectorAll('.waplus-tab');
    const contents = panel.querySelectorAll('.waplus-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            panel.querySelector(`[data-content="${targetTab}"]`).classList.add('active');
        });
    });

    setupBlurControls(panel, 'desfocar-mensagens',           'blur-mensagens-intensity',  toggleBlurMessages);
    setupBlurControls(panel, 'desfocar-nomes',               'blur-nomes-intensity',      toggleBlurNames);
    setupBlurControls(panel, 'desfocar-fotos',               'blur-fotos-intensity',      toggleBlurPhotos);
    setupBlurControls(panel, 'desfocar-mensagens-conversa',  'blur-conversa-intensity',   toggleBlurConversa);

    setupDesfoquePersonalizado(panel);
    setupScheduleMessage(panel);
}

// ========================================
// SISTEMA DE GERENCIAMENTO DE MENSAGENS
// ========================================
let currentEditId = null;

function setupScheduleMessage(panel) {
    const btn = panel.querySelector('#waplus-schedule-btn');
    const statusMsg = panel.querySelector('#waplus-schedule-status');
    const timeInputEl = panel.querySelector('#waplus-schedule-time');
    
    // Configurar as abas do gerenciador
    const msgTabs = panel.querySelectorAll('.waplus-msg-tab');
    const msgViews = panel.querySelectorAll('.waplus-msg-view');

    msgTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            msgTabs.forEach(t => t.classList.remove('active'));
            msgViews.forEach(v => v.style.display = 'none');
            tab.classList.add('active');
            panel.querySelector(`#waplus-${tab.dataset.target}-view`).style.display = 'block';
        });
    });

    const clearHistoryBtn = panel.querySelector('#waplus-clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar todo o histórico de envios?')) {
                chrome.runtime.sendMessage({ action: 'clear_history' }, (res) => {
                    if (res && res.success) loadScheduledMessages(panel);
                });
            }
        });
    }

    if (!btn || !statusMsg) return;

    // Define o valor padrão para daqui a 1 hora
    if (timeInputEl) {
        const defaultDate = new Date();
        defaultDate.setHours(defaultDate.getHours() + 1);
        const tzOffset = defaultDate.getTimezoneOffset() * 60000;
        const localISOTime = new Date(defaultDate.getTime() - tzOffset).toISOString().slice(0, 16);
        timeInputEl.value = localISOTime;
    }

    btn.addEventListener('click', () => {
        const contact = panel.querySelector('#waplus-schedule-contact').value.trim();
        const text = panel.querySelector('#waplus-schedule-text').value.trim();
        const timeInput = panel.querySelector('#waplus-schedule-time').value;

        if (!contact || !text || !timeInput) {
            statusMsg.textContent = 'Preencha todos os campos.';
            statusMsg.style.color = '#ef4444'; // red
            return;
        }

        const scheduleTime = new Date(timeInput).getTime();
        const now = Date.now();

        if (scheduleTime <= now) {
            statusMsg.textContent = 'A data deve ser no futuro.';
            statusMsg.style.color = '#ef4444';
            return;
        }

        const msgData = {
            id: currentEditId || ('wa_msg_' + Date.now()),
            contact: contact,
            text: text,
            scheduledTime: scheduleTime,
            status: 'pending'
        };

        // Envia pro background salvar e agendar
        chrome.runtime.sendMessage({
            action: 'schedule_message',
            data: msgData
        }, (response) => {
            if (response && response.success) {
                statusMsg.textContent = currentEditId ? 'Mensagem editada com sucesso!' : 'Mensagem agendada com sucesso!';
                statusMsg.style.color = '#00a884';
                
                // Limpa campos
                panel.querySelector('#waplus-schedule-contact').value = '';
                panel.querySelector('#waplus-schedule-text').value = '';
                if (timeInputEl) {
                    const defaultDate = new Date();
                    defaultDate.setHours(defaultDate.getHours() + 1);
                    const tzOffset = defaultDate.getTimezoneOffset() * 60000;
                    timeInputEl.value = new Date(defaultDate.getTime() - tzOffset).toISOString().slice(0, 16);
                }
                
                btn.textContent = 'Agendar Mensagem';
                currentEditId = null;

                setTimeout(() => statusMsg.textContent = '', 3000);
                loadScheduledMessages(panel);
            }
        });
    });

    // Carregar lista ao inicializar
    loadScheduledMessages(panel);
}

function loadScheduledMessages(panel) {
    const scheduledList = panel.querySelector('#waplus-scheduled-list');
    const historyList = panel.querySelector('#waplus-history-list');
    
    if (!scheduledList || !historyList) return;

    chrome.storage.local.get(null, (data) => {
        const items = Object.values(data)
            .filter(item => item && item.id && item.id.startsWith('wa_msg_'))
            .sort((a, b) => (b.scheduledTime || 0) - (a.scheduledTime || 0));

        scheduledList.innerHTML = '';
        historyList.innerHTML = '';

        let hasScheduled = false;
        let hasHistory = false;

        items.forEach(msg => {
            const dateStr = new Date(msg.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
            
            const card = document.createElement('div');
            card.className = `waplus-msg-card ${msg.status || 'pending'}`;
            
            let html = `
                <div class="waplus-msg-card-header">
                    <span class="waplus-msg-card-contact">${msg.contact}</span>
                    <span class="waplus-msg-card-time">${msg.status === 'sent' && msg.sentAt ? 'Enviada em: ' + new Date(msg.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Para: ' + dateStr}</span>
                </div>
                <div class="waplus-msg-card-text">${msg.text}</div>
            `;

            if (msg.status === 'sent') {
                card.innerHTML = html;
                historyList.appendChild(card);
                hasHistory = true;
            } else {
                html += `<div class="waplus-msg-card-actions">`;
                
                html += `<button class="waplus-btn-action edit" data-id="${msg.id}">Editar</button>`;
                
                if (msg.status === 'paused') {
                    html += `<button class="waplus-btn-action resume" data-id="${msg.id}">Retomar</button>`;
                } else {
                    html += `<button class="waplus-btn-action pause" data-id="${msg.id}">Pausar</button>`;
                }
                
                html += `<button class="waplus-btn-action delete" data-id="${msg.id}">Cancelar</button>`;
                html += `</div>`;
                
                card.innerHTML = html;
                scheduledList.appendChild(card);
                hasScheduled = true;
            }
        });

        if (!hasScheduled) {
            scheduledList.innerHTML = '<div class="waplus-empty-msg">Nenhuma mensagem agendada.</div>';
        }
        if (!hasHistory) {
            historyList.innerHTML = '<div class="waplus-empty-msg">Seu histórico está vazio.</div>';
        }

        // Action Buttons Setup
        scheduledList.querySelectorAll('.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const msg = items.find(i => i.id === id);
                if (msg) {
                    currentEditId = id;
                    panel.querySelector('#waplus-schedule-contact').value = msg.contact;
                    panel.querySelector('#waplus-schedule-text').value = msg.text;
                    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
                    panel.querySelector('#waplus-schedule-time').value = new Date(msg.scheduledTime - tzOffset).toISOString().slice(0, 16);
                    panel.querySelector('#waplus-schedule-btn').textContent = 'Salvar Edição';
                }
            });
        });

        scheduledList.querySelectorAll('.pause').forEach(btn => {
            btn.addEventListener('click', (e) => {
                chrome.runtime.sendMessage({ action: 'pause_message', id: e.target.dataset.id }, () => loadScheduledMessages(panel));
            });
        });

        scheduledList.querySelectorAll('.resume').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const msg = items.find(i => i.id === id);
                if (msg && msg.scheduledTime <= Date.now()) {
                    alert('A data de agendamento já passou. Edite a mensagem para um horário no futuro.');
                    return;
                }
                chrome.runtime.sendMessage({ action: 'resume_message', id, scheduledTime: msg.scheduledTime }, () => loadScheduledMessages(panel));
            });
        });

        scheduledList.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Deseja realmente cancelar este agendamento?')) {
                    chrome.runtime.sendMessage({ action: 'cancel_message', id: e.target.dataset.id }, () => loadScheduledMessages(panel));
                }
            });
        });
    });
}

// Escuta mensagens do background para executar o envio na tela do WhatsApp
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'send_scheduled_message') {
        executarEnvioAutomatico(request.data);
    }
});

async function executarEnvioAutomatico(data) {
    console.log('🚀 Iniciando envio automático para:', data.contact);
    
    // 1. Encontrar e clicar no botão "Nova conversa" (mais seguro do que pesquisar na lista atual)
    let btnNovaConversa = document.querySelector('div[title="Nova conversa"], span[data-icon="chat"]');
    if (!btnNovaConversa) {
        console.error('❌ Não achou o botão de Nova Conversa');
        return;
    }
    
    btnNovaConversa.closest('div[role="button"]').click();
    await new Promise(r => setTimeout(r, 800)); // Aguarda painel lateral de contatos carregar

    // 2. Achar a barra de pesquisa que abre
    // A barra de pesquisa tem o title="Caixa de texto de pesquisa" ou parecido
    let searchInput = document.querySelector('div[contenteditable="true"][data-tab="3"], div[title="Caixa de texto de pesquisa"]');
    if (!searchInput) {
        console.error('❌ Não foi possível encontrar a barra de pesquisa de contatos.');
        return;
    }

    searchInput.focus();
    
    // Fallback pra inserir texto que ativa os eventos do React do Whatsapp
    const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true });
    searchInput.textContent = data.contact;
    searchInput.dispatchEvent(inputEvent);
    
    // 3. Aguardar o contato aparecer na lista e clicar
    await new Promise(r => setTimeout(r, 2000)); // Esperar pesquisa React
    
    // Procurar resultados da busca 
    const resultList = document.querySelectorAll('div[aria-label="Resultados da pesquisa"] div[role="listitem"], div[role="row"]');
    
    let clicked = false;
    // Pega o primeiro contato válido não-header
    for (let chat of resultList) {
        if(chat.innerText.includes(data.contact) || chat.innerText.length > 5) {
            chat.click();
            clicked = true;
            break;
        }
    }

    if (!clicked) {
        // Fallback genérico caso a lista não filtre perfeitamente (simplesmente clica no primeiro visível abaixo do input)
        const possibleChats = document.querySelectorAll('div[tabindex="-1"][role="button"]');
        if(possibleChats.length > 0) {
           possibleChats[0].click();
        } else {
           console.error('❌ Não conseguiu encontrar e clicar no contato.');
           return;
        }
    }

    await new Promise(r => setTimeout(r, 1500)); // Esperar chat abrir
    
    // 4. Cola a mensagem no campo da conversa
    const messageInput = document.querySelector('div[contenteditable="true"][data-tab="10"], div[title="Digite uma mensagem"]');
    if (!messageInput) {
        console.error('❌ Não foi possível encontrar a caixa de mensagens da conversa.');
        return;
    }
    
    messageInput.focus();
    
    // Inserir texto disparando os eventos para o WhatsApp reconhecer a mensagem
    document.execCommand('insertText', false, data.text);
    const msgEvent = new InputEvent('input', { bubbles: true, cancelable: true });
    messageInput.dispatchEvent(msgEvent);
    
    await new Promise(r => setTimeout(r, 500));
    
    // 5. Clicar no botão de enviar
    const sendButton = document.querySelector('span[data-icon="send"]')?.closest('button');
    if (sendButton) {
        sendButton.click();
        console.log('✅ Mensagem enviada com sucesso!');
    } else {
        // Fallback: se não achar o botão, simula tecla Enter
        const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true, cancelable: true, keyCode: 13, key: 'Enter'
        });
        messageInput.dispatchEvent(enterEvent);
        console.log('✅ Tentativa de envio com a tecla Enter.');
    }
}

// ========================================
// CHECKBOX PRINCIPAL "Desfoque personalizado"
// ========================================
function setupDesfoquePersonalizado(panel) {
  const mainCheckbox = panel.querySelector('#desfoque-personalizado');
  const suboptions   = panel.querySelector('#waplus-blur-suboptions');

  if (!mainCheckbox || !suboptions) return;

  // Quando a principal muda, só liga/desliga os estilos, sem mexer nos switches
  mainCheckbox.addEventListener('change', (e) => {
    const checked = e.target.checked;
    chrome.storage.sync.set({ desfoquePersonalizado: checked });

    // Marca o painel como principal ON/OFF
    const panelRoot = mainCheckbox.closest('#waplus-panel');
    if (panelRoot) {
      panelRoot.classList.toggle('waplus-main-off', !checked);
    }

    aplicarBlursConformeEstado(panel, checked);
  });

  // Estado inicial
  chrome.storage.sync.get('desfoquePersonalizado', (data) => {
    const checked = !!data.desfoquePersonalizado;
    mainCheckbox.checked = checked;

    // Aplica a classe correta ao carregar
    const panelRoot = mainCheckbox.closest('#waplus-panel');
    if (panelRoot) {
      panelRoot.classList.toggle('waplus-main-off', !checked);
    }

    // Ao abrir o painel, garante que os blurs reflitam
    aplicarBlursConformeEstado(panel, checked);
  });
}


// ========================================
// FUNÇÃO: Configurar controles de blur
// ========================================
function setupBlurControls(panel, checkboxId, sliderId, toggleFunction) {
  const checkbox     = panel.querySelector(`#${checkboxId}`);
  const slider       = panel.querySelector(`#${sliderId}`);
  if (!checkbox || !slider) return;
  const valueDisplay = slider.nextElementSibling;

  const map = {
    'desfocar-mensagens': {
      flag: 'blurMessages',
      intensity: 'blurMessagesIntensity',
      defaultIntensity: 5
    },
    'desfocar-nomes': {
      flag: 'blurNames',
      intensity: 'blurNamesIntensity',
      defaultIntensity: 5
    },
    'desfocar-fotos': {
      flag: 'blurPhotos',
      intensity: 'blurPhotosIntensity',
      defaultIntensity: 10
    },
    'desfocar-mensagens-conversa': {
      flag: 'blurConversa',
      intensity: 'blurConversaIntensity',
      defaultIntensity: 5
    }
  };

  const cfg = map[checkboxId];
  if (!cfg) return;

  chrome.storage.sync.get([cfg.flag, cfg.intensity], (data) => {
    const enabled   = !!data[cfg.flag];
    const intensity = data[cfg.intensity] ?? cfg.defaultIntensity;

    checkbox.checked = enabled;
    slider.value     = intensity;
    valueDisplay.textContent = `${intensity}px`;
  });

  checkbox.addEventListener('change', (e) => {
    const checked = e.target.checked;
    const value   = parseInt(slider.value, 10);

    // Se ligou QUALQUER subopção, ativa a principal
    if (checked) {
      const mainCheckbox = panel.querySelector('#desfoque-personalizado');
      if (mainCheckbox && !mainCheckbox.checked) {
        mainCheckbox.checked = true;
        chrome.storage.sync.set({ desfoquePersonalizado: true });
      }
    } else {
      // Opcional: se todas subopções estiverem OFF, desliga a principal
      const mainCheckbox = panel.querySelector('#desfoque-personalizado');
      if (mainCheckbox) {
        const anyOn = panel.querySelector('#waplus-blur-suboptions input[type="checkbox"]:checked');
        if (!anyOn) {
          mainCheckbox.checked = false;
          chrome.storage.sync.set({ desfoquePersonalizado: false });
        }
      }
    }

    toggleFunction(checked, value);
  });

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    valueDisplay.textContent = `${val}px`;
    if (checkbox.checked) {
      toggleFunction(true, val);
    }
  });
}


function aplicarBlursConformeEstado(panel, principalAtiva) {
  // Mapeia id do switch → função de blur
  const blurMap = {
    'desfocar-mensagens':          toggleBlurMessages,
    'desfocar-nomes':              toggleBlurNames,
    'desfocar-fotos':              toggleBlurPhotos,
    'desfocar-mensagens-conversa': toggleBlurConversa
  };

  Object.entries(blurMap).forEach(([id, fn]) => {
    const checkbox = panel.querySelector('#' + id);
    if (!checkbox) return;

    const row    = checkbox.closest('.waplus-suboption-row');
    const slider = row ? row.querySelector('input[type="range"]') : null;
    if (!slider) return;

    const intensidade = parseInt(slider.value, 10);

    // Se a principal estiver ativa, aplica blur conforme o switch da sub-opção.
    // Se a principal estiver desativada, força todos para false (sem blur).
    const deveAtivar = principalAtiva && checkbox.checked;
    fn(deveAtivar, intensidade);
  });
}


// ========================================
// FUNCIONALIDADES: Blur Mensagens
// ========================================
function toggleBlurMessages(enabled, intensity = 5) {
    const styleId = 'waplus-blur-messages';
    
    if (enabled) {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            div._ak8k {
                filter: blur(${intensity}px) !important;
                transition: filter 0.2s ease;
            }
            div[role="gridcell"]:hover div._ak8k {
                filter: blur(0px) !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        const style = document.getElementById(styleId);
        if (style) style.remove();
    }
    
    chrome.storage.sync.set({ blurMessages: enabled, blurMessagesIntensity: intensity });
}

// ========================================
// FUNCIONALIDADES: Blur Nomes
// ========================================
function toggleBlurNames(enabled, intensity = 5) {
    const styleId = 'waplus-blur-names';
    
    if (enabled) {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            div._ak8q {
                filter: blur(${intensity}px) !important;
                transition: filter 0.2s ease;
            }
            div[role="gridcell"]:hover div._ak8q {
                filter: blur(0px) !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        const style = document.getElementById(styleId);
        if (style) style.remove();
    }
    
    chrome.storage.sync.set({ blurNames: enabled, blurNamesIntensity: intensity });
}

// ========================================
// FUNCIONALIDADES: Blur Fotos
// ========================================
function toggleBlurPhotos(enabled, intensity = 10) {
    const styleId = 'waplus-blur-photos';
    
    if (enabled) {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            div._ak8h {
                filter: blur(${intensity}px) !important;
                transition: filter 0.2s ease;
            }
            div[role="gridcell"]:hover div._ak8h {
                filter: blur(0px) !important;
            }
            img.xh8yej3[alt]:not([src*="cdn.whatsapp.net"]) {
                filter: none !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        const style = document.getElementById(styleId);
        if (style) style.remove();
    }
    
    chrome.storage.sync.set({ blurPhotos: enabled, blurPhotosIntensity: intensity });
}

// ========================================
// FUNCIONALIDADES: Blur Mensagens da Conversa
// ========================================
function toggleBlurConversa(enabled, intensity = 5) {
    const styleId = 'waplus-blur-conversa';
    
    if (enabled) {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            div.message-in,
            div.message-out {
                filter: blur(${intensity}px) !important;
                transition: filter 0.2s ease;
            }
            
            div.message-in:hover,
            div.message-out:hover {
                filter: blur(0px) !important;
            }
            
            div._akbu {
                filter: blur(${intensity}px) !important;
                transition: filter 0.2s ease;
            }
            
            div[role="row"]:hover div._akbu {
                filter: blur(0px) !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Blur de conversa ativado:', intensity + 'px');
    } else {
        const style = document.getElementById(styleId);
        if (style) style.remove();
        console.log('❌ Blur de conversa desativado');
    }
    
    chrome.storage.sync.set({ blurConversa: enabled, blurConversaIntensity: intensity });
}


// ========================================
// APLICAR BLURS AUTOMATICAMENTE AO CARREGAR
// ========================================
chrome.storage.sync.get([
  'desfoquePersonalizado',
  'blurMessages', 'blurMessagesIntensity',
  'blurNames', 'blurNamesIntensity',
  'blurPhotos', 'blurPhotosIntensity',
  'blurConversa', 'blurConversaIntensity'
], (data) => {
  const personalizadoOn = !!data.desfoquePersonalizado;

  // Se o usuário desligou o Desfoque personalizado, NÃO aplica nenhum blur ao carregar
  if (!personalizadoOn) return;

  if (data.blurMessages) {
    toggleBlurMessages(true, data.blurMessagesIntensity || 5);
  }
  if (data.blurNames) {
    toggleBlurNames(true, data.blurNamesIntensity || 5);
  }
  if (data.blurPhotos) {
    toggleBlurPhotos(true, data.blurPhotosIntensity || 10);
  }
  if (data.blurConversa) {
    toggleBlurConversa(true, data.blurConversaIntensity || 5);
  }
});



// ========================================
// EVENTOS GLOBAIS
// ========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWaPlusPanel();
});

document.addEventListener('click', (e) => {
    const panel = document.getElementById('waplus-panel');
    const sidebarBtn = document.getElementById('waplus-sidebar-btn');
    
    if (sidebarBtn && sidebarBtn.contains(e.target)) return;
    if (!panel) return;
    if (panel.contains(e.target)) return;
    
    closeWaPlusPanel();
}, true);
