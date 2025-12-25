// Currency configuration based on country
export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // Rate relative to USD
  locale: string;
}

export const currencies: Record<string, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", rate: 1, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", rate: 0.92, locale: "fr-FR" },
  GBP: { code: "GBP", symbol: "£", rate: 0.79, locale: "en-GB" },
  CAD: { code: "CAD", symbol: "C$", rate: 1.36, locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", rate: 1.53, locale: "en-AU" },
  BRL: { code: "BRL", symbol: "R$", rate: 4.97, locale: "pt-BR" },
  MXN: { code: "MXN", symbol: "MX$", rate: 17.15, locale: "es-MX" },
  JPY: { code: "JPY", symbol: "¥", rate: 149.50, locale: "ja-JP" },
  CHF: { code: "CHF", symbol: "CHF", rate: 0.88, locale: "de-CH" },
  PLN: { code: "PLN", symbol: "zł", rate: 4.02, locale: "pl-PL" },
  SEK: { code: "SEK", symbol: "kr", rate: 10.42, locale: "sv-SE" },
  NOK: { code: "NOK", symbol: "kr", rate: 10.65, locale: "nb-NO" },
  DKK: { code: "DKK", symbol: "kr", rate: 6.87, locale: "da-DK" },
  INR: { code: "INR", symbol: "₹", rate: 83.12, locale: "en-IN" },
  RUB: { code: "RUB", symbol: "₽", rate: 92.50, locale: "ru-RU" },
  CNY: { code: "CNY", symbol: "¥", rate: 7.24, locale: "zh-CN" },
  KRW: { code: "KRW", symbol: "₩", rate: 1320, locale: "ko-KR" },
  TRY: { code: "TRY", symbol: "₺", rate: 30.25, locale: "tr-TR" },
  ZAR: { code: "ZAR", symbol: "R", rate: 18.65, locale: "en-ZA" },
  AED: { code: "AED", symbol: "د.إ", rate: 3.67, locale: "ar-AE" },
  SAR: { code: "SAR", symbol: "﷼", rate: 3.75, locale: "ar-SA" },
  COP: { code: "COP", symbol: "$", rate: 3950, locale: "es-CO" },
  ARS: { code: "ARS", symbol: "$", rate: 850, locale: "es-AR" },
  CLP: { code: "CLP", symbol: "$", rate: 880, locale: "es-CL" },
};

// Map country codes to currencies
export const countryToCurrency: Record<string, string> = {
  // North America
  US: "USD", CA: "CAD", MX: "MXN",
  // Europe
  FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", NL: "EUR",
  BE: "EUR", AT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
  SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR",
  GB: "GBP", CH: "CHF", PL: "PLN", SE: "SEK", NO: "NOK", DK: "DKK",
  RU: "RUB", UA: "EUR", TR: "TRY",
  // South America
  BR: "BRL", AR: "ARS", CO: "COP", CL: "CLP",
  // Asia
  JP: "JPY", CN: "CNY", KR: "KRW", IN: "INR",
  AE: "AED", SA: "SAR",
  // Oceania
  AU: "AUD", NZ: "AUD",
  // Africa
  ZA: "ZAR",
};

export function getCurrencyForCountry(countryCode: string): CurrencyConfig {
  const currencyCode = countryToCurrency[countryCode] || "USD";
  return currencies[currencyCode] || currencies.USD;
}

export function formatPrice(priceUSD: number, currency: CurrencyConfig): string {
  const convertedPrice = priceUSD * currency.rate;

  // Round nicely based on currency
  let finalPrice: number;
  if (currency.rate > 100) {
    // For currencies like JPY, KRW - round to nearest whole number
    finalPrice = Math.round(convertedPrice);
  } else if (currency.rate > 10) {
    // For currencies like MXN, SEK - round to nearest 5
    finalPrice = Math.round(convertedPrice / 5) * 5;
  } else {
    // For USD, EUR, etc. - round to .99
    finalPrice = Math.floor(convertedPrice) + 0.99;
    if (finalPrice < 1) finalPrice = 0.99;
  }

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.rate > 100 ? 0 : 2,
    maximumFractionDigits: currency.rate > 100 ? 0 : 2,
  }).format(finalPrice);
}

// Get raw converted price (for calculations)
export function convertPrice(priceUSD: number, currency: CurrencyConfig): number {
  return priceUSD * currency.rate;
}
