/**
 * RoutesDB - Database de Rotas Brasileiras
 * 
 * Contém um conjunto de rotas populares entre cidades brasileiras
 * com distâncias reais em quilômetros.
 * 
 * Estrutura:
 * - routes: Array de objetos com origin, destination e distanceKm
 * - getAllCities(): Retorna array único e ordenado de todas as cidades
 * - findDistance(): Busca a distância entre duas cidades em qualquer direção
 */

const RoutesDB = {
  /**
   * Array de rotas com origem, destino e distância em km
   */
  routes: [
    // Rotas entre Capitais (Sudeste)
    { origin: "São Paulo, SP", destination: "Rio de Janeiro, RJ", distanceKm: 430 },
    { origin: "São Paulo, SP", destination: "Brasília, DF", distanceKm: 1015 },
    { origin: "Rio de Janeiro, RJ", destination: "Brasília, DF", distanceKm: 1148 },
    { origin: "Belo Horizonte, MG", destination: "Rio de Janeiro, RJ", distanceKm: 520 },
    { origin: "Belo Horizonte, MG", destination: "São Paulo, SP", distanceKm: 586 },
    { origin: "Belo Horizonte, MG", destination: "Brasília, DF", distanceKm: 741 },

    // Rotas Regionais (Sudeste)
    { origin: "São Paulo, SP", destination: "Campinas, SP", distanceKm: 95 },
    { origin: "São Paulo, SP", destination: "Santos, SP", distanceKm: 71 },
    { origin: "São Paulo, SP", destination: "Sorocaba, SP", distanceKm: 108 },
    { origin: "Rio de Janeiro, RJ", destination: "Niterói, RJ", distanceKm: 13 },
    { origin: "Rio de Janeiro, RJ", destination: "Petrópolis, RJ", distanceKm: 66 },
    { origin: "Rio de Janeiro, RJ", destination: "Volta Redonda, RJ", distanceKm: 144 },
    { origin: "Belo Horizonte, MG", destination: "Ouro Preto, MG", distanceKm: 100 },
    { origin: "Belo Horizonte, MG", destination: "Contagem, MG", distanceKm: 30 },
    { origin: "Belo Horizonte, MG", destination: "Montes Claros, MG", distanceKm: 425 },

    // Rotas Entre Regiões (Norte/Nordeste)
    { origin: "Salvador, BA", destination: "Brasília, DF", distanceKm: 1645 },
    { origin: "Recife, PE", destination: "Salvador, BA", distanceKm: 840 },
    { origin: "Fortaleza, CE", destination: "Recife, PE", distanceKm: 785 },
    { origin: "Manaus, AM", destination: "Brasília, DF", distanceKm: 2487 },
    { origin: "Belém, PA", destination: "Brasília, DF", distanceKm: 2055 },
    { origin: "Belém, PA", destination: "Manaus, AM", distanceKm: 1617 },

    // Rotas Sul
    { origin: "Curitiba, PR", destination: "São Paulo, SP", distanceKm: 408 },
    { origin: "Curitiba, PR", destination: "Brasília, DF", distanceKm: 1320 },
    { origin: "Porto Alegre, RS", destination: "Curitiba, PR", distanceKm: 700 },
    { origin: "Porto Alegre, RS", destination: "São Paulo, SP", distanceKm: 1102 },
    { origin: "Florianópolis, SC", destination: "Curitiba, PR", distanceKm: 300 },
    { origin: "Florianópolis, SC", destination: "Porto Alegre, RS", distanceKm: 480 },

    // Rotas Centro-Oeste
    { origin: "Goiânia, GO", destination: "Brasília, DF", distanceKm: 209 },
    { origin: "Cuiabá, MT", destination: "Brasília, DF", distanceKm: 1236 },
    { origin: "Campo Grande, MS", destination: "Brasília, DF", distanceKm: 1273 },
    { origin: "Campo Grande, MS", destination: "São Paulo, SP", distanceKm: 1120 },

    // Rotas Adicionais
    { origin: "Uberlândia, MG", destination: "Brasília, DF", distanceKm: 448 },
    { origin: "Uberlândia, MG", destination: "São Paulo, SP", distanceKm: 560 },
    { origin: "Ribeirão Preto, SP", destination: "São Paulo, SP", distanceKm: 313 },
    { origin: "Jundiaí, SP", destination: "São Paulo, SP", distanceKm: 54 },
    { origin: "Piracicaba, SP", destination: "São Paulo, SP", distanceKm: 162 },
    { origin: "Itu, SP", destination: "São Paulo, SP", distanceKm: 103 },
  ],

  /**
   * Retorna um array único e ordenado alfabeticamente
   * contendo todas as cidades presentes nas rotas
   * 
   * @returns {Array<string>} Array de cidades únicas ordenadas
   */
  getAllCities: function() {
    // Coleta todas as cidades de origem e destino
    const cities = new Set();
    
    this.routes.forEach(route => {
      cities.add(route.origin);
      cities.add(route.destination);
    });

    // Converte para array e ordena alfabeticamente
    return Array.from(cities).sort();
  },

  /**
   * Busca a distância entre duas cidades
   * Realiza busca em ambas as direções (A->B e B->A)
   * Normaliza a entrada: remove espaços em branco e converte para minúsculas
   * 
   * @param {string} origin - Cidade de origem
   * @param {string} destination - Cidade de destino
   * @returns {number|null} Distância em km se encontrada, null caso contrário
   */
  findDistance: function(origin, destination) {
    // Normaliza as entradas: trim e lowercase para comparação
    const normalizedOrigin = origin.trim().toLowerCase();
    const normalizedDestination = destination.trim().toLowerCase();

    // Busca na direção origem -> destino
    const forwardRoute = this.routes.find(route => {
      return route.origin.toLowerCase() === normalizedOrigin &&
             route.destination.toLowerCase() === normalizedDestination;
    });

    if (forwardRoute) {
      return forwardRoute.distanceKm;
    }

    // Busca na direção inversa destino -> origem
    const reverseRoute = this.routes.find(route => {
      return route.origin.toLowerCase() === normalizedDestination &&
             route.destination.toLowerCase() === normalizedOrigin;
    });

    if (reverseRoute) {
      return reverseRoute.distanceKm;
    }

    // Retorna null se nenhuma rota for encontrada
    return null;
  }
};
