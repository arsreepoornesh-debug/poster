export type SupportedLanguage = "en" | "ta" | "hi";

export class LanguageService {
  private static translations: Record<SupportedLanguage, Record<string, string>> = {
    en: {
      welcome: "Welcome to Poster Store Enterprise",
      cart: "Cart",
      checkout: "Checkout",
      custom_poster: "Custom Artwork Upload",
    },
    ta: {
      welcome: "சுவரொட்டி கடைக்கு நல்வரவு",
      cart: "கூடை",
      checkout: "பணம் செலுத்துதல்",
      custom_poster: "தனிப்பயன் சுவரொட்டி பதிவேற்றம்",
    },
    hi: {
      welcome: "पोस्टर स्टोर एंटरप्राइज में आपका स्वागत है",
      cart: "कार्ट",
      checkout: "चेकआउट",
      custom_poster: "कस्टम पोस्टर अपलोड",
    },
  };

  public static translate(key: string, lang: SupportedLanguage = "en"): string {
    return this.translations[lang]?.[key] || this.translations.en[key] || key;
  }
}
