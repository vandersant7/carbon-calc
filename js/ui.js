/**
 * UI - Objeto de Gerenciamento de Interface do Usuário
 * 
 * Contém métodos para:
 * - Formatação de números e moeda
 * - Manipulação de elementos (mostrar, ocultar, scroll)
 * - Renderização de resultados em HTML
 * - Gerenciamento de estados de carregamento
 */

const UI = {
  /**
   * ========================================
   * UTILITY METHODS (Métodos Utilitários)
   * ======================================== 
   */

  /**
   * Formata um número com separador de milhares e casas decimais
   * 
   * @param {number} number - Número a ser formatado
   * @param {number} decimals - Quantidade de casas decimais (padrão: 2)
   * @returns {string} Número formatado (ex: "1.234,56")
   */
  formatNumber: function(number, decimals = 2) {
    // Usa toLocaleString com locale 'pt-BR' para formatar com separadores
    return parseFloat(number).toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Formata um valor como moeda brasileira
   * 
   * @param {number} value - Valor em reais
   * @returns {string} Valor formatado (ex: "R$ 1.234,56")
   */
  formatCurrency: function(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Mostra um elemento removendo a classe 'hidden'
   * 
   * @param {string} elementId - ID do elemento a ser mostrado
   */
  showElement: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('hidden');
    }
  },

  /**
   * Oculta um elemento adicionando a classe 'hidden'
   * 
   * @param {string} elementId - ID do elemento a ser ocultado
   */
  hideElement: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('hidden');
    }
  },

  /**
   * Faz scroll suave para um elemento específico
   * 
   * @param {string} elementId - ID do elemento para o qual fazer scroll
   */
  scrollToElement: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  /**
   * ========================================
   * LOADING METHODS (Métodos de Carregamento)
   * ======================================== 
   */

  /**
   * Mostra estado de carregamento no botão
   * Salva texto original e substitui por spinner + "Calculando..."
   * 
   * @param {HTMLElement} buttonElement - Elemento do botão
   */
  showLoading: function(buttonElement) {
    // Salva texto original em atributo data
    buttonElement.dataset.originalText = buttonElement.innerText;
    
    // Desabilita o botão
    buttonElement.disabled = true;
    
    // Substitui conteúdo por spinner e texto
    buttonElement.innerHTML = '<span class="spinner"></span> Calculando...';
  },

  /**
   * Oculta estado de carregamento e restaura o botão ao normal
   * 
   * @param {HTMLElement} buttonElement - Elemento do botão
   */
  hideLoading: function(buttonElement) {
    // Habilita o botão
    buttonElement.disabled = false;
    
    // Restaura texto original
    buttonElement.innerText = buttonElement.dataset.originalText || 'Calcular emissão';
  },

  /**
   * ========================================
   * RENDERING METHODS (Métodos de Renderização)
   * ======================================== 
   */

  /**
   * Renderiza a seção de resultados principais
   * 
   * Estrutura HTML:
   * - Card de rota (origem → destino)
   * - Card de distância
   * - Card de emissão (com ícone)
   * - Card de modo de transporte
   * - Card de economia (se houver savings)
   * 
   * @param {Object} data - Objeto contendo:
   *   - origin: cidade de origem
   *   - destination: cidade de destino
   *   - distance: distância em km
   *   - emission: emissão em kg CO2
   *   - mode: modo de transporte
   *   - savings: objeto com savedKg e percentage (opcional)
   * @returns {string} HTML string com os resultados
   */
  renderResults: function(data) {
    const modeInfo = CONFIG.TRANSPORT_MODES[data.mode];
    const formattedEmission = this.formatNumber(data.emission, 2);
    const formattedDistance = this.formatNumber(data.distance, 1);

    let html = `
      <div class="results__container">
        <!-- Card de Rota -->
        <div class="results__card results__card--route">
          <div class="results__card-label">Trajeto</div>
          <div class="results__card-content">
            <span class="results__city">${data.origin}</span>
            <span class="results__arrow">→</span>
            <span class="results__city">${data.destination}</span>
          </div>
        </div>

        <!-- Card de Distância -->
        <div class="results__card results__card--distance">
          <div class="results__card-label">Distância</div>
          <div class="results__card-value">${formattedDistance} km</div>
        </div>

        <!-- Card de Emissão -->
        <div class="results__card results__card--emission">
          <div class="results__card-label">Emissão de CO₂</div>
          <div class="results__card-value results__emission-value">
            🍃 ${formattedEmission} kg
          </div>
        </div>

        <!-- Card de Modo de Transporte -->
        <div class="results__card results__card--transport">
          <div class="results__card-label">Modo de Transporte</div>
          <div class="results__card-content results__transport-content">
            <span class="results__transport-icon">${modeInfo.icon}</span>
            <span class="results__transport-label">${modeInfo.label}</span>
          </div>
        </div>
    `;

    // Adiciona card de economia se dados disponíveis
    if (data.savings && data.mode !== 'car') {
      const formattedSaved = this.formatNumber(data.savings.savedKg, 2);
      html += `
        <!-- Card de Economia -->
        <div class="results__card results__card--savings">
          <div class="results__card-label">Economia vs Carro</div>
          <div class="results__card-content results__savings-content">
            <div class="results__savings-amount">${formattedSaved} kg economizados</div>
            <div class="results__savings-percentage">${data.savings.percentage}% menos emissão</div>
          </div>
        </div>
      `;
    }

    html += `</div>`;

    return html;
  },

  /**
   * Renderiza a comparação entre todos os modos de transporte
   * 
   * Estrutura HTML:
   * - Item para cada modo com:
   *   - Ícone e label
   *   - Badge "Selecionado" se for o modo escolhido
   *   - Emissão e percentual vs carro
   *   - Barra de progresso com cor codificada
   * - Info box com dica útil
   * 
   * @param {Array} modesArray - Array de objetos de modos do Calculator.calculateAllModes()
   * @param {string} selectedMode - Modo atualmente selecionado
   * @returns {string} HTML string com a comparação
   */
  renderComparison: function(modesArray, selectedMode) {
    const maxEmission = Math.max(...modesArray.map(m => m.emission));

    let html = `<div class="comparison__container">`;

    modesArray.forEach(item => {
      const modeInfo = CONFIG.TRANSPORT_MODES[item.mode];
      const isSelected = item.mode === selectedMode;
      const widthPercent = (item.emission / maxEmission) * 100;
      
      // Determina cor da barra baseado no percentual vs carro
      let barColor = '#10b981'; // verde (0-25%)
      if (item.percentageVsCar > 25 && item.percentageVsCar <= 75) {
        barColor = '#f59e0b'; // amarelo (25-75%)
      } else if (item.percentageVsCar > 75 && item.percentageVsCar <= 100) {
        barColor = '#f97316'; // laranja (75-100%)
      } else if (item.percentageVsCar > 100) {
        barColor = '#ef4444'; // vermelho (>100%)
      }

      html += `
        <div class="comparison__item ${isSelected ? 'comparison__item--selected' : ''}">
          <div class="comparison__header">
            <div class="comparison__mode-info">
              <span class="comparison__icon">${modeInfo.icon}</span>
              <span class="comparison__label">${modeInfo.label}</span>
            </div>
            ${isSelected ? '<span class="comparison__badge">✓ Selecionado</span>' : ''}
          </div>

          <div class="comparison__stats">
            <div class="comparison__emission">${this.formatNumber(item.emission, 2)} kg CO₂</div>
            <div class="comparison__percentage">${item.percentageVsCar}% vs carro</div>
          </div>

          <div class="comparison__bar-container">
            <div 
              class="comparison__bar" 
              style="width: ${widthPercent}%; background-color: ${barColor};"
            ></div>
          </div>
        </div>
      `;
    });

    // Info box com mensagem útil
    html += `
      <div class="comparison__info">
        <h3 class="comparison__info-title">💡 Dica</h3>
        <p class="comparison__info-text">
          Use transportes com menor emissão de CO₂ para reduzir seu impacto ambiental. 
          Bicicleta e transporte público são as melhores opções!
        </p>
      </div>
    </div>`;

    return html;
  },

  /**
   * Renderiza a seção de créditos de carbono
   * 
   * Estrutura HTML:
   * - Grid com 2 cards:
   *   - Card de créditos necessários
   *   - Card de preço estimado com range
   * - Info box explicando créditos de carbono
   * - Botão "Compensar Emissões"
   * 
   * @param {Object} creditsData - Objeto contendo:
   *   - credits: quantidade de créditos
   *   - price: objeto com { min, max, average }
   * @returns {string} HTML string com créditos de carbono
   */
  renderCarbonCredits: function(creditsData) {
    const formattedCredits = this.formatNumber(creditsData.credits, 4);
    const formattedAverage = this.formatCurrency(creditsData.price.average);
    const formattedMin = this.formatCurrency(creditsData.price.min);
    const formattedMax = this.formatCurrency(creditsData.price.max);

    const html = `
      <div class="carbon-credits__container">
        <!-- Grid de Cards -->
        <div class="carbon-credits__grid">
          <!-- Card de Créditos -->
          <div class="carbon-credits__card carbon-credits__card--credits">
            <div class="carbon-credits__card-label">Créditos Necessários</div>
            <div class="carbon-credits__card-value">${formattedCredits}</div>
            <div class="carbon-credits__card-helper">1 crédito = 1.000 kg CO₂</div>
          </div>

          <!-- Card de Preço Estimado -->
          <div class="carbon-credits__card carbon-credits__card--price">
            <div class="carbon-credits__card-label">Preço Estimado (Médio)</div>
            <div class="carbon-credits__card-value">${formattedAverage}</div>
            <div class="carbon-credits__card-range">
              ${formattedMin} a ${formattedMax}
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="carbon-credits__info">
          <h3 class="carbon-credits__info-title">🌍 O que são Créditos de Carbono?</h3>
          <p class="carbon-credits__info-text">
            Créditos de carbono são certificados que representam uma tonelada de CO₂ 
            removida ou deixada de ser emitida. Você pode compensar suas emissões 
            investindo em projetos de reflorestamento e energia limpa.
          </p>
        </div>

        <!-- Botão de Ação -->
        <button class="carbon-credits__button" disabled>
          💚 Compensar Emissões
        </button>
      </div>
    `;

    return html;
  }
};
