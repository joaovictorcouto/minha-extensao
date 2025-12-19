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

// Sistema de tentativas MEGAPHONE (removido - não usado)


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
    novoBotao.setAttribute('aria-label', 'WA Web Plus');
    novoBotao.removeAttribute('data-navbar-item-index');

    const span = novoBotao.querySelector('[data-icon]');
    if (span) {
        span.setAttribute('data-icon', 'waplus-icon');
        const svg = span.querySelector('svg');
        if (svg) {
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('width', '24');
            svg.setAttribute('height', '24');
            
            svg.innerHTML = `
                <title>waplus-icon</title>
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            `;
            
            svg.style.transform = 'translateY(3px)';
        }
    }

    const divBotaoInterno = novoBotao.querySelector('div');
    if (divBotaoInterno) {
        divBotaoInterno.style.display = 'flex';
        divBotaoInterno.style.alignItems = 'center';
        divBotaoInterno.style.justifyContent = 'center';
    }

    const divFilho = divBotaoInterno?.querySelector('div');
    if (divFilho) {
        divFilho.style.display = 'flex';
        divFilho.style.alignItems = 'center';
        divFilho.style.justifyContent = 'center';
    }

    const divFinal = novoDivContainer.cloneNode(true);
    const botaoFinal = divFinal.querySelector('button');
    
    botaoFinal.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWaPlusPanel();
    });

    divContainer.parentElement.insertBefore(divFinal, divContainer.nextSibling);
    
    sidebarButtonAdded = true;
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
        // ✅ CANCELA TODAS AS TENTATIVAS RESTANTES
        console.log('✅ Cancelando tentativas restantes do Sidebar...');
        sidebarTimers.forEach(timerId => clearTimeout(timerId));
        sidebarTimers = [];
        return;
    }
    
    if (sidebarAttempts >= MAX_SIDEBAR_ATTEMPTS) {
        console.log('⚠️ Botão Sidebar não adicionado. Use o ícone da extensão.');
    }
}

// Agenda as 5 tentativas e guarda os IDs
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
    tooltip.textContent = 'WaPlus';
    tooltip.style.cssText = `
        position: fixed;
        visibility: hidden;
        opacity: 0;
        background: #233138;
        color: #e9edef;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 11px;
        white-space: nowrap;
        z-index: 9999;
        pointer-events: none;
        transition: opacity 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(tooltip);

    let showTimeout, hideTimeout;

    button.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        showTimeout = setTimeout(() => {
            const rect = button.getBoundingClientRect();
            tooltip.style.top = `${rect.top + rect.height / 2 - 16}px`;
            tooltip.style.left = `${rect.right + 4}px`;
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
        }, 50);
    });

    button.addEventListener('mouseleave', () => {
        clearTimeout(showTimeout);
        hideTimeout = setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.style.visibility = 'hidden', 50);
        }, 0);
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

    // ✅ CARREGAR CONFIGURAÇÕES SALVAS ANTES DE CRIAR O PAINEL
    chrome.storage.sync.get([
        'blurMessages', 'blurMessagesIntensity',
        'blurNames', 'blurNamesIntensity',
        'blurPhotos', 'blurPhotosIntensity',
        'blurConversa', 'blurConversaIntensity'  // ✅ ADICIONADO
    ], (data) => {
        // Valores padrão se não houver configuração salva
        const mensagensChecked = data.blurMessages || false;
        const mensagensValue = data.blurMessagesIntensity || 5;
        const nomesChecked = data.blurNames || false;
        const nomesValue = data.blurNamesIntensity || 5;
        const fotosChecked = data.blurPhotos || false;
        const fotosValue = data.blurPhotosIntensity || 10;
        const conversaChecked = data.blurConversa || false;  // ✅ NOVO
        const conversaValue = data.blurConversaIntensity || 5;  // ✅ NOVO

        const panel = document.createElement('div');
        panel.id = 'waplus-panel';
        panel.innerHTML = `
            <div class="waplus-header">
                <div class="waplus-logo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M16.3392 14.3581C16.3392 14.3581 15.1145 12.855 14.8155 12.4925ZM16.3392 14.3581C16.3392 14.3581 15.4105 13.221 14.8155 12.4925ZM16.3392 14.3581C16.4326 14.4701 16.4691 14.4969 16.4942 14.3387L18.5672 5.96615C18.6241 5.69894 18.5802 5.76379 18.3476 5.87578L7.93727 10.8593C7.68412 10.9801 7.61702 10.9948 7.92436 10.9948L10.8369 10.9943C10.8369 10.9943 11.1135 10.9981 11.1017 11.0013C10.5076 11.6339 8.29892 14.1063 6.23243 15.6749C4.06247 17.3662 2.60942 17.9536 1.54393 18.3603C1.2597 18.4595 1.17578 18.2893 1.17578 18.0763C1.17578 14.6705 1.17581 9.35517 1.17581 9.35517C1.17581 6.47899 3.54282 4.01662 6.44554 4.01662C6.44554 4.01662 16.6879 4.01663 16.7331 4.01663C16.8687 4.01663 16.8558 4.12547 16.8106 4.17801C16.7989 4.19157 15.7696 5.38517 15.7696 5.38517C15.7271 5.43246 15.698 5.4585 15.7773 5.42625C15.7773 5.42625 22.2919 2.38486 22.358 2.35767C22.5582 2.27529 22.8359 2.35772 22.8101 2.69992C22.5194 4.21695 21.9641 7.14746 21.9641 7.14746C21.9641 7.14746 21.7252 8.41917 21.7252 9.34874C21.7252 9.34874 21.7573 11.7892 21.7252 13.1122C21.6606 15.7717 19.4519 18.0828 16.7137 18.1538H8.47982C8.47982 18.1538 3.47486 21.4847 3.28112 21.6138C3.1455 21.7171 2.84197 21.659 2.90655 21.3233C3.10672 20.495 3.51354 18.8135 3.53937 18.7154C3.57166 18.5927 3.67499 18.341 3.92039 18.3087C8.3827 17.2656 11.0869 15.4421 14.6569 12.4925C14.743 12.4213 14.7367 12.3968 14.8155 12.4925" fill="currentColor"/>
                    </svg>
                    <span>WA Web Plus</span>
                </div>
                <button class="waplus-close">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M19.1 4.9C18.7 4.5 18.1 4.5 17.7 4.9L12 10.6L6.3 4.9C5.9 4.5 5.3 4.5 4.9 4.9C4.5 5.3 4.5 5.9 4.9 6.3L10.6 12L4.9 17.7C4.5 18.1 4.5 18.7 4.9 19.1C5.3 19.5 5.9 19.5 6.3 19.1L12 13.4L17.7 19.1C18.1 19.5 18.7 19.5 19.1 19.1C19.5 18.7 19.5 18.1 19.1 17.7L13.4 12L19.1 6.3C19.5 5.9 19.5 5.3 19.1 4.9Z"/>
                    </svg>
                </button>
            </div>

            <div class="waplus-tabs">
                <button class="waplus-tab active" data-tab="melhorias">Melhorias</button>
                <button class="waplus-tab" data-tab="ferramentas">Ferramentas Business</button>
                <button class="waplus-tab" data-tab="exportar">Exportar</button>
                <button class="waplus-tab" data-tab="estatisticas">Estatísticas</button>
            </div>

            <div class="waplus-content">
                <div class="waplus-tab-content active" data-content="melhorias">
                    <h3>Privacidade</h3>
                    
                    <div class="waplus-option-row">
                        <label class="waplus-option">
                            <input type="checkbox" id="desfocar-mensagens" ${mensagensChecked ? 'checked' : ''}>
                            <span>Desfocar mensagens recentes</span>
                        </label>
                        <button class="waplus-adjust-btn" data-target="blur-mensagens-intensity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="waplus-slider-popup" id="popup-blur-mensagens-intensity" style="display: none;">
                        <input type="range" id="blur-mensagens-intensity" min="0" max="20" value="${mensagensValue}" step="1">
                        <span class="waplus-slider-value">${mensagensValue}px</span>
                    </div>
                    
                    <div class="waplus-option-row">
                        <label class="waplus-option">
                            <input type="checkbox" id="desfocar-nomes" ${nomesChecked ? 'checked' : ''}>
                            <span>Desfocar nomes dos contatos</span>
                        </label>
                        <button class="waplus-adjust-btn" data-target="blur-nomes-intensity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="waplus-slider-popup" id="popup-blur-nomes-intensity" style="display: none;">
                        <input type="range" id="blur-nomes-intensity" min="0" max="20" value="${nomesValue}" step="1">
                        <span class="waplus-slider-value">${nomesValue}px</span>
                    </div>
                    
                    <div class="waplus-option-row">
                        <label class="waplus-option">
                            <input type="checkbox" id="desfocar-fotos" ${fotosChecked ? 'checked' : ''}>
                            <span>Desfocar fotos dos contatos</span>
                        </label>
                        <button class="waplus-adjust-btn" data-target="blur-fotos-intensity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="waplus-slider-popup" id="popup-blur-fotos-intensity" style="display: none;">
                        <input type="range" id="blur-fotos-intensity" min="0" max="30" value="${fotosValue}" step="1">
                        <span class="waplus-slider-value">${fotosValue}px</span>
                    </div>
                    <div class="waplus-slider-popup" id="popup-blur-fotos-intensity" style="display: none;">
                        <input type="range" id="blur-fotos-intensity" min="0" max="30" value="${fotosValue}" step="1">
                        <span class="waplus-slider-value">${fotosValue}px</span>
                    </div>
                    <div class="waplus-option-row">
                        <label class="waplus-option">
                            <input type="checkbox" id="desfocar-mensagens-conversa" ${conversaChecked ? 'checked' : ''}>
                            <span>Desfocar mensagens na conversa</span>
                        </label>
                        <button class="waplus-adjust-btn" data-target="blur-conversa-intensity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="waplus-slider-popup" id="popup-blur-conversa-intensity" style="display: none;">
                        <input type="range" id="blur-conversa-intensity" min="0" max="20" value="${conversaValue}" step="1">
                        <span class="waplus-slider-value">${conversaValue}px</span>
                    </div>

                </div>

                <div class="waplus-tab-content" data-content="ferramentas">
                    <h3>Em Breve</h3>
                    <p>Ferramentas Business em desenvolvimento...</p>
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
                <span>Victor - JZ Viagens 5566990740008</span>
            </div>
        `;

        document.body.appendChild(panel);
        panelOpen = true;

        setupPanelEvents(panel);
        
        // ✅ Aplicar os blurs SE estiverem ativados
        if (mensagensChecked) toggleBlurMessages(true, mensagensValue);
        if (nomesChecked) toggleBlurNames(true, nomesValue);
        if (fotosChecked) toggleBlurPhotos(true, fotosValue);
        if (conversaChecked) toggleBlurConversa(true, conversaValue);  // ✅ NOVO

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
// FUNÇÃO: Configurar eventos do painel
// ========================================
function setupPanelEvents(panel) {
    panel.querySelector('.waplus-close').addEventListener('click', closeWaPlusPanel);

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

    const adjustButtons = panel.querySelectorAll('.waplus-adjust-btn');
    adjustButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.getAttribute('data-target');
            const popup = panel.querySelector(`#popup-${targetId}`);
            
            panel.querySelectorAll('.waplus-slider-popup').forEach(p => {
                if (p !== popup) p.style.display = 'none';
            });
            
            popup.style.display = popup.style.display === 'none' ? 'flex' : 'none';
        });
    });

    panel.addEventListener('click', (e) => {
        if (!e.target.closest('.waplus-adjust-btn') && !e.target.closest('.waplus-slider-popup')) {
            panel.querySelectorAll('.waplus-slider-popup').forEach(p => p.style.display = 'none');
        }
    });

    setupBlurControls(panel, 'desfocar-mensagens', 'blur-mensagens-intensity', toggleBlurMessages);
    setupBlurControls(panel, 'desfocar-nomes', 'blur-nomes-intensity', toggleBlurNames);
    setupBlurControls(panel, 'desfocar-fotos', 'blur-fotos-intensity', toggleBlurPhotos);
    setupBlurControls(panel, 'desfocar-mensagens-conversa', 'blur-conversa-intensity', toggleBlurConversa);

}


// ========================================
// FUNÇÃO: Configurar controles de blur
// ========================================
function setupBlurControls(panel, checkboxId, sliderId, toggleFunction) {
    const checkbox = panel.querySelector(`#${checkboxId}`);
    const slider = panel.querySelector(`#${sliderId}`);
    const valueDisplay = slider.nextElementSibling;

    checkbox.addEventListener('change', (e) => {
        toggleFunction(e.target.checked, parseInt(slider.value));
    });

    slider.addEventListener('input', (e) => {
        valueDisplay.textContent = `${e.target.value}px`;
        if (checkbox.checked) {
            toggleFunction(true, parseInt(e.target.value));
        }
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
            /* ✅ Balões de mensagens recebidas e enviadas */
            div.message-in,
            div.message-out {
                filter: blur(${intensity}px) !important;
                transition: filter 0.2s ease;
            }
            
            /* ✅ Remove blur ao passar mouse */
            div.message-in:hover,
            div.message-out:hover {
                filter: blur(0px) !important;
            }
            
            /* ✅ Backup: balões internos */
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
