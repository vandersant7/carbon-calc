/**
 * CONFIG - Configuração Global da Aplicação
 * 
 * Contém:
 * - Fatores de emissão de CO2 por modo de transporte
 * - Metadados dos modos de transporte (label, ícone, cor)
 * - Configurações de créditos de carbono
 * - Métodos para inicializar datalist e preenchimento automático de distância
 */

const CONFIG = {
  /**
   * Fatores de emissão de CO2 em kg por quilômetro
   * Baseado em dados de agências ambientais
   */
  EMISSION_FACTORS: {
    bicycle: 0,
    car: 0.12,
    bus: 0.089,
    truck: 0.96
  },

  /**
   * Metadados dos modos de transporte
   * Inclui label em português, ícone emoji e cor para UI
   */
  TRANSPORT_MODES: {
    bicycle: {
      label: "Bicicleta",
      icon: "🚲",
      color: "#3b82f6"
    },
    car: {
      label: "Carro",
      icon: "🚗",
      color: "#ef4444"
    },
    bus: {
      label: "Ônibus",
      icon: "🚌",
      color: "#f59e0b"
    },
    truck: {
      label: "Caminhão",
      icon: "🚛",
      color: "#8b5cf6"
    }
  },

  /**
   * Configurações de créditos de carbono
   */
  CARBON_CREDIT: {
    KG_PER_CREDIT: 1000,
    PRICE_MIN_BRL: 50,
    PRICE_MAX_BRL: 150
  },

  /**
   * Popula a datalist com todas as cidades disponíveis em RoutesDB
   * 
   * Processo:
   * 1. Obtém lista de cidades de RoutesDB.getAllCities()
   * 2. Encontra o elemento datalist com id 'cities-list'
   * 3. Cria elementos <option> para cada cidade
   * 4. Adiciona à datalist
   */
  populateDatalist: function() {
    try {
      // Verifica se RoutesDB está disponível
      if (typeof RoutesDB === 'undefined') {
        console.error('RoutesDB não está carregado. Certifique-se que routes-data.js foi carregado antes.');
        return;
      }

      // Obtém a lista de cidades
      const cities = RoutesDB.getAllCities();
      
      // Obtém o elemento datalist
      const datalist = document.getElementById('cities-list');
      
      if (!datalist) {
        console.error('Elemento datalist com id "cities-list" não encontrado.');
        return;
      }

      // Limpa datalist anterior (se houver)
      datalist.innerHTML = '';

      // Cria e adiciona opciones para cada cidade
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
      });

      console.log(`Datalist populada com ${cities.length} cidades.`);
    } catch (error) {
      console.error('Erro ao popular datalist:', error);
    }
  },

  /**
   * Configura o preenchimento automático de distância
   * 
   * Funcionalidades:
   * - Busca automática de distância quando origem e destino são preenchidos
   * - Torna o campo readonly quando distância é encontrada
   * - Permite inserção manual de distância via checkbox
   * - Mensagens de feedback ao usuário
   */
  setupDistanceAutofill: function() {
    try {
      // Obtém elementos do DOM
      const originInput = document.getElementById('origin');
      const destinationInput = document.getElementById('destination');
      const distanceInput = document.getElementById('distance');
      const manualCheckbox = document.getElementById('manual-distance');
      const helperText = document.querySelector('.calculator__helper');

      if (!originInput || !destinationInput || !distanceInput || !manualCheckbox) {
        console.error('Um ou mais elementos de entrada não foram encontrados.');
        return;
      }

      /**
       * Função auxiliar para tentar preencher a distância automaticamente
       */
      const tryAutoFillDistance = () => {
        // Se manual está marcado, não faz nada
        if (manualCheckbox.checked) {
          return;
        }

        const origin = originInput.value.trim();
        const destination = destinationInput.value.trim();

        // Se ambos os campos estão preenchidos
        if (origin && destination) {
          const distance = RoutesDB.findDistance(origin, destination);

          if (distance !== null) {
            // Distância encontrada
            distanceInput.value = distance;
            distanceInput.readOnly = true;
            distanceInput.style.backgroundColor = 'var(--gray-50)';
            
            // Atualiza helper text com mensagem de sucesso
            if (helperText) {
              helperText.textContent = '✓ Distância preenchida automaticamente';
              helperText.style.color = 'var(--primary)';
              helperText.style.fontWeight = '600';
            }
          } else {
            // Distância não encontrada
            distanceInput.value = '';
            distanceInput.readOnly = true;
            distanceInput.style.backgroundColor = 'var(--gray-100)';
            
            // Atualiza helper text com sugestão
            if (helperText) {
              helperText.textContent = '⚠ Rota não encontrada. Insira a distância manualmente.';
              helperText.style.color = 'var(--warning)';
              helperText.style.fontWeight = '400';
            }
          }
        } else {
          // Um ou ambos os campos estão vazios
          distanceInput.value = '';
          distanceInput.readOnly = true;
          distanceInput.style.backgroundColor = 'var(--gray-100)';
          
          if (helperText) {
            helperText.textContent = 'A distância será preenchida automaticamente';
            helperText.style.color = 'var(--gray-500)';
            helperText.style.fontWeight = '400';
          }
        }
      };

      /**
       * Event listeners para os campos de origem e destino
       */
      originInput.addEventListener('change', tryAutoFillDistance);
      destinationInput.addEventListener('change', tryAutoFillDistance);

      /**
       * Event listener para o checkbox de distância manual
       */
      manualCheckbox.addEventListener('change', () => {
        if (manualCheckbox.checked) {
          // Quando marcado: permite edição manual
          distanceInput.readOnly = false;
          distanceInput.style.backgroundColor = 'var(--white)';
          distanceInput.value = '';
          
          if (helperText) {
            helperText.textContent = 'Insira a distância em quilômetros';
            helperText.style.color = 'var(--info)';
            helperText.style.fontWeight = '600';
          }
        } else {
          // Quando desmarcado: tenta preencher automaticamente novamente
          tryAutoFillDistance();
        }
      });

      console.log('Preenchimento automático de distância configurado.');
    } catch (error) {
      console.error('Erro ao configurar preenchimento automático de distância:', error);
    }
  }
};
