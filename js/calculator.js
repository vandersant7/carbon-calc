/**
 * Calculator - Objeto de Cálculos de Emissões de CO2
 * 
 * Contém métodos para:
 * - Calcular emissão de CO2 por modo de transporte
 * - Comparar emissões entre todos os modos
 * - Calcular economia de emissões
 * - Calcular créditos de carbono
 * - Estimar preço de créditos de carbono
 */

const Calculator = {
  /**
   * Calcula a emissão de CO2 para um modo de transporte específico
   * 
   * Fórmula: distância (km) × fator de emissão (kg CO2/km)
   * 
   * @param {number} distanceKm - Distância em quilômetros
   * @param {string} transportMode - Modo de transporte (bicycle, car, bus, truck)
   * @returns {number} Emissão de CO2 em kg, arredondada para 2 casas decimais
   */
  calculateEmission: function(distanceKm, transportMode) {
    // Valida se o modo de transporte existe nas configurações
    if (!CONFIG.EMISSION_FACTORS.hasOwnProperty(transportMode)) {
      console.error(`Modo de transporte "${transportMode}" não reconhecido.`);
      return 0;
    }

    // Obtém o fator de emissão para o modo especificado
    const emissionFactor = CONFIG.EMISSION_FACTORS[transportMode];

    // Calcula: distância × fator de emissão
    const emission = distanceKm * emissionFactor;

    // Retorna arredondado a 2 casas decimais
    return Math.round(emission * 100) / 100;
  },

  /**
   * Calcula emissões de CO2 para todos os modos de transporte
   * e compara com a emissão do carro (linha de base)
   * 
   * Fórmula de comparação: (emissão / emissão_carro) × 100
   * 
   * @param {number} distanceKm - Distância em quilômetros
   * @returns {Array} Array de objetos com modo, emissão e percentual vs carro
   *                  Ordenado por emissão (menor primeiro)
   */
  calculateAllModes: function(distanceKm) {
    // Array para armazenar resultados
    const results = [];

    // Calcula emissão do carro (baseline para comparação)
    const carEmission = this.calculateEmission(distanceKm, 'car');

    // Itera sobre todos os modos de transporte
    Object.keys(CONFIG.EMISSION_FACTORS).forEach(mode => {
      // Calcula emissão para o modo atual
      const emission = this.calculateEmission(distanceKm, mode);

      // Calcula percentual em relação ao carro
      // Evita divisão por zero caso carEmission seja 0
      let percentageVsCar = 0;
      if (carEmission > 0) {
        percentageVsCar = Math.round((emission / carEmission) * 100 * 100) / 100;
      }

      // Adiciona resultado ao array
      results.push({
        mode: mode,
        emission: emission,
        percentageVsCar: percentageVsCar
      });
    });

    // Ordena por emissão (menor primeiro)
    results.sort((a, b) => a.emission - b.emission);

    return results;
  },

  /**
   * Calcula a economia de emissões entre dois valores
   * 
   * Fórmulas:
   * - Economia em kg: baseline - emissão
   * - Percentual: (economia / baseline) × 100
   * 
   * @param {number} emission - Emissão do modo escolhido em kg
   * @param {number} baselineEmission - Emissão do carro (baseline) em kg
   * @returns {Object} Objeto com savedKg e percentage, ambos com 2 casas decimais
   */
  calculateSavings: function(emission, baselineEmission) {
    // Calcula emissão economizada
    const savedKg = baselineEmission - emission;

    // Calcula percentual de economia
    let percentage = 0;
    if (baselineEmission > 0) {
      percentage = Math.round((savedKg / baselineEmission) * 100 * 100) / 100;
    }

    return {
      savedKg: Math.round(savedKg * 100) / 100,
      percentage: percentage
    };
  },

  /**
   * Calcula quantos créditos de carbono correspondem à emissão
   * 
   * Fórmula: emissão (kg) ÷ kg_por_crédito
   * 
   * @param {number} emissionKg - Emissão em quilogramas de CO2
   * @returns {number} Quantidade de créditos, arredondada para 4 casas decimais
   */
  calculateCarbonCredits: function(emissionKg) {
    // Obtém quantidade de kg por crédito das configurações
    const kgPerCredit = CONFIG.CARBON_CREDIT.KG_PER_CREDIT;

    // Calcula créditos: emissão / kg_por_crédito
    const credits = emissionKg / kgPerCredit;

    // Retorna arredondado a 4 casas decimais
    return Math.round(credits * 10000) / 10000;
  },

  /**
   * Estima o preço de créditos de carbono com base no intervalo configurado
   * 
   * Fórmulas:
   * - Mínimo: créditos × PRICE_MIN_BRL
   * - Máximo: créditos × PRICE_MAX_BRL
   * - Médio: (mínimo + máximo) / 2
   * 
   * @param {number} credits - Quantidade de créditos de carbono
   * @returns {Object} Objeto com min, max e average, todos com 2 casas decimais
   */
  estimateCreditPrice: function(credits) {
    // Obtém preços mínimo e máximo das configurações
    const priceMin = CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
    const priceMax = CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;

    // Calcula valores em reais
    const minPrice = credits * priceMin;
    const maxPrice = credits * priceMax;
    const averagePrice = (minPrice + maxPrice) / 2;

    return {
      min: Math.round(minPrice * 100) / 100,
      max: Math.round(maxPrice * 100) / 100,
      average: Math.round(averagePrice * 100) / 100
    };
  }
};
