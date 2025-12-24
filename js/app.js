/**
 * app.js - Aplicação Principal da Calculadora de Emissões de CO2
 * 
 * Responsável por:
 * - Inicialização da aplicação quando o DOM está pronto
 * - Manipulação de eventos do formulário
 * - Coordenação entre os módulos (CONFIG, Calculator, UI)
 * - Tratamento de erros
 */

// ========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Inicializando Calculadora de Emissões de CO2...');

  try {
    // 1. Popula a datalist com cidades disponíveis
    CONFIG.populateDatalist();

    // 2. Configura o preenchimento automático de distância
    CONFIG.setupDistanceAutofill();

    // 3. Obtém o elemento do formulário
    const form = document.getElementById('calculator-form');

    if (!form) {
      console.error('Formulário com id "calculator-form" não encontrado.');
      return;
    }

    // 4. Adiciona listener de envio do formulário
    form.addEventListener('submit', handleFormSubmit);

    console.log('✅ Calculadora inicializada!');
  } catch (error) {
    console.error('Erro durante inicialização:', error);
    alert('Erro ao inicializar a aplicação. Por favor, recarregue a página.');
  }
});

// ========================================
// MANIPULADOR DE ENVIO DO FORMULÁRIO
// ========================================

/**
 * Manipula o envio do formulário
 * Valida inputs, coleta dados e coordena cálculos
 * 
 * @param {Event} e - Evento de envio do formulário
 */
function handleFormSubmit(e) {
  // Previne o comportamento padrão de envio
  e.preventDefault();

  console.log('📤 Formulário enviado');

  try {
    // ========================================
    // 1. OBTER VALORES DO FORMULÁRIO
    // ========================================

    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const distanceInput = document.getElementById('distance');
    const transportRadios = document.querySelectorAll('input[name="transport"]:checked');

    // Coleta valores com trim de espaços em branco
    const origin = originInput.value.trim();
    const destination = destinationInput.value.trim();
    const distance = parseFloat(distanceInput.value);
    const transportMode = transportRadios.length > 0 ? transportRadios[0].value : null;

    // ========================================
    // 2. VALIDAR INPUTS
    // ========================================

    // Valida se origem está preenchida
    if (!origin) {
      alert('⚠️ Por favor, insira uma cidade de origem.');
      originInput.focus();
      return;
    }

    // Valida se destino está preenchido
    if (!destination) {
      alert('⚠️ Por favor, insira uma cidade de destino.');
      destinationInput.focus();
      return;
    }

    // Valida se distância está preenchida
    if (!distance || isNaN(distance)) {
      alert('⚠️ Por favor, insira uma distância válida em quilômetros.');
      distanceInput.focus();
      return;
    }

    // Valida se distância é maior que zero
    if (distance <= 0) {
      alert('⚠️ A distância deve ser maior que 0 km.');
      distanceInput.focus();
      return;
    }

    // Valida se modo de transporte está selecionado
    if (!transportMode) {
      alert('⚠️ Por favor, selecione um modo de transporte.');
      return;
    }

    console.log(`✓ Validação passou - Origem: ${origin}, Destino: ${destination}, Distância: ${distance}km, Modo: ${transportMode}`);

    // ========================================
    // 3. OBTER BOTÃO E MOSTRAR CARREGAMENTO
    // ========================================

    const submitButton = e.target.querySelector('button[type="submit"]');
    UI.showLoading(submitButton);

    // Oculta seções de resultados anteriores
    UI.hideElement('results');
    UI.hideElement('comparisson');
    UI.hideElement('carbon-credits');

    // ========================================
    // 4. SIMULAR PROCESSAMENTO COM DELAY
    // ========================================

    setTimeout(function() {
      processCalculation(
        origin,
        destination,
        distance,
        transportMode,
        submitButton
      );
    }, 1500);

  } catch (error) {
    console.error('Erro ao processar formulário:', error);
    alert('❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.');
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
      UI.hideLoading(submitButton);
    }
  }
}

// ========================================
// LÓGICA DE PROCESSAMENTO DE CÁLCULOS
// ========================================

/**
 * Processa todos os cálculos de emissão
 * 
 * @param {string} origin - Cidade de origem
 * @param {string} destination - Cidade de destino
 * @param {number} distance - Distância em km
 * @param {string} transportMode - Modo de transporte selecionado
 * @param {HTMLElement} submitButton - Elemento do botão de envio
 */
function processCalculation(origin, destination, distance, transportMode, submitButton) {
  try {
    console.log('⚙️ Processando cálculos...');

    // ========================================
    // CÁLCULOS PRINCIPAIS
    // ========================================

    // Calcula emissão para o modo selecionado
    const selectedEmission = Calculator.calculateEmission(distance, transportMode);
    console.log(`Emissão ${transportMode}: ${selectedEmission} kg CO2`);

    // Calcula emissão do carro como baseline
    const carEmission = Calculator.calculateEmission(distance, 'car');
    console.log(`Emissão carro (baseline): ${carEmission} kg CO2`);

    // Calcula economia comparado ao carro
    const savings = Calculator.calculateSavings(selectedEmission, carEmission);
    console.log(`Economia: ${savings.savedKg} kg (${savings.percentage}%)`);

    // Calcula emissões para todos os modos
    const allModes = Calculator.calculateAllModes(distance);
    console.log('Comparação de modos:', allModes);

    // Calcula créditos de carbono necessários
    const credits = Calculator.calculateCarbonCredits(selectedEmission);
    console.log(`Créditos necessários: ${credits}`);

    // Estima preço dos créditos
    const creditPrice = Calculator.estimateCreditPrice(credits);
    console.log(`Preço estimado: R$ ${creditPrice.average}`);

    // ========================================
    // PREPARAR DADOS PARA RENDERIZAÇÃO
    // ========================================

    // Objeto para resultados principais
    const resultsData = {
      origin: origin,
      destination: destination,
      distance: distance,
      emission: selectedEmission,
      mode: transportMode,
      savings: savings
    };

    // Objeto para comparação de modos
    const comparisonData = allModes;

    // Objeto para créditos de carbono
    const creditsData = {
      credits: credits,
      price: creditPrice
    };

    // ========================================
    // RENDERIZAR RESULTADOS
    // ========================================

    // Renderiza e exibe resultados principais
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = UI.renderResults(resultsData);
    UI.showElement('results');

    // Renderiza e exibe comparação de modos
    const comparisonContent = document.getElementById('comparisson-content');
    comparisonContent.innerHTML = UI.renderComparison(comparisonData, transportMode);
    UI.showElement('comparisson');

    // Renderiza e exibe créditos de carbono
    const creditsContent = document.getElementById('carbon-credits-content');
    creditsContent.innerHTML = UI.renderCarbonCredits(creditsData);
    UI.showElement('carbon-credits');

    // ========================================
    // FINALIZAR
    // ========================================

    // Faz scroll para a seção de resultados
    UI.scrollToElement('results');

    // Remove estado de carregamento do botão
    UI.hideLoading(submitButton);

    console.log('✅ Cálculos concluídos com sucesso!');

  } catch (error) {
    console.error('Erro durante processamento de cálculos:', error);
    alert('❌ Ocorreu um erro ao calcular as emissões. Por favor, verifique os dados e tente novamente.');
    UI.hideLoading(submitButton);
  }
}
