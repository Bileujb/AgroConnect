// Distância aproximada (em km) de cada cidade até Curitiba (centro de referência).
// Não é GPS de verdade — é só uma estimativa pra ordenar "mais perto primeiro".
const DISTANCIA_ATE_CURITIBA = {
  'Curitiba': 0,
  'Araucária': 22,
  'Colombo': 15,
  'Pinhais': 12,
  'Campo Largo': 29,
  'Almirante Tamandaré': 18,
  'São José dos Pinhais': 15,
  'Campo Magro': 27,
  'Piraquara': 22,
  'Fazenda Rio Grande': 26,
  'Quatro Barras': 26,
  'Campina Grande do Sul': 34,
  'Itaperuçu': 33,
  'Rio Branco do Sul': 40,
  'Bocaiúva do Sul': 45,
  'Mandirituba': 34,
  'Lapa': 68,
  'Balsa Nova': 45,
};

// Estima a distância entre duas cidades somando a distância de cada uma até Curitiba.
export function calcularDistanciaEntreCidades(cidadeA, cidadeB) {
  if (!cidadeA || !cidadeB) return 9999; // sem cidade definida, manda pro fim da lista
  if (cidadeA === cidadeB) return 0; // mesma cidade = distância zero

  const distA = DISTANCIA_ATE_CURITIBA[cidadeA] ?? 9999;
  const distB = DISTANCIA_ATE_CURITIBA[cidadeB] ?? 9999;

  return distA + distB;
}