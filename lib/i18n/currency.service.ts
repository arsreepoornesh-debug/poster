export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP";

export class CurrencyService {
  private static rates: Record<SupportedCurrency, number> = {
    INR: 1.0,
    USD: 0.012, // 1 INR = 0.012 USD
    EUR: 0.011, // 1 INR = 0.011 EUR
    GBP: 0.0095, // 1 INR = 0.0095 GBP
  };

  public static convert(amountInINR: number, targetCurrency: SupportedCurrency = "INR"): number {
    const rate = this.rates[targetCurrency] || 1.0;
    return Math.round(amountInINR * rate * 100) / 100;
  }

  public static format(amountInINR: number, currency: SupportedCurrency = "INR"): string {
    const converted = this.convert(amountInINR, currency);
    const symbols: Record<SupportedCurrency, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return `${symbols[currency]}${converted.toLocaleString()}`;
  }
}
