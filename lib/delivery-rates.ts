export const DELIVERY_RATES: Record<string, { HOME: number; STOP_DESK: number | null }> = {
  "M'Sila": { HOME: 800, STOP_DESK: 570 },
  'Mascara': { HOME: 800, STOP_DESK: 520 },
  'Ouargla': { HOME: 950, STOP_DESK: 670 },
  'Oran': { HOME: 800, STOP_DESK: 520 },
  'El Bayadh': { HOME: 1100, STOP_DESK: 670 },
  'Bordj Bou Arreridj': { HOME: 750, STOP_DESK: 520 },
  'Boumerdès': { HOME: 750, STOP_DESK: 520 },
  'El Tarf': { HOME: 800, STOP_DESK: 520 },
  'Tissemsilt': { HOME: 800, STOP_DESK: 520 },
  'El Oued': { HOME: 900, STOP_DESK: 670 },
  'Khenchela': { HOME: 600, STOP_DESK: 520 },
  'Souk Ahras': { HOME: 700, STOP_DESK: 520 },
  'Tipaza': { HOME: 800, STOP_DESK: 520 },
  'Mila': { HOME: 700, STOP_DESK: 520 },
  'Aïn Defla': { HOME: 800, STOP_DESK: 520 },
  'Naâma': { HOME: 1100, STOP_DESK: 670 },
  'Aïn Témouchent': { HOME: 850, STOP_DESK: 520 },
  'Ghardaïa': { HOME: 950, STOP_DESK: 670 },
  'Relizane': { HOME: 800, STOP_DESK: 520 },
  'Timimoun': { HOME: 1400, STOP_DESK: 970 },
  'Ouled Djellal': { HOME: 950, STOP_DESK: 520 },
  'Beni Abbès': { HOME: 1200, STOP_DESK: 970 },
  'In Salah': { HOME: 1600, STOP_DESK: 1120 },
  'In Guezzam': { HOME: 1600, STOP_DESK: null },
  'Touggourt': { HOME: 950, STOP_DESK: 670 },
  'El M\'Ghair': { HOME: 900, STOP_DESK: null },
  'El Meniaa': { HOME: 1000, STOP_DESK: 670 },
};

export const AVAILABLE_WILAYAS = Object.keys(DELIVERY_RATES);

export function getDeliveryRate(wilaya: string, method: 'HOME' | 'STOP_DESK'): number | null {
  const normalizedWilaya = Object.keys(DELIVERY_RATES).find(
    (w) => w.toLowerCase() === wilaya.toLowerCase()
  );
  if (!normalizedWilaya) {
    throw new Error('Unsupported delivery location');
  }
  return DELIVERY_RATES[normalizedWilaya][method];
}
