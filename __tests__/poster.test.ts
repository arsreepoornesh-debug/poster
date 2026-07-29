import { PosterService } from "../services/poster.service";
import { CustomPosterService } from "../services/custom-poster.service";

describe("Poster Enterprise Core Service Tests", () => {
  test("PosterService.generateSKU produces valid format", () => {
    const sku = PosterService.generateSKU("Akatsuki Poster");
    expect(sku).toMatch(/^PSTR-AKA-\d{4}$/);
  });

  test("CustomPosterService.validateFile rejects files smaller than 5MB", () => {
    const smallFileSizeBytes = 2 * 1024 * 1024; // 2MB
    expect(() => {
      CustomPosterService.validateFile(smallFileSizeBytes, "image/jpeg", "sample.jpg");
    }).toThrow("Minimum required size for high-resolution printing is 5 MB");
  });

  test("CustomPosterService.validateFile rejects files larger than 50MB", () => {
    const largeFileSizeBytes = 55 * 1024 * 1024; // 55MB
    expect(() => {
      CustomPosterService.validateFile(largeFileSizeBytes, "image/jpeg", "sample.jpg");
    }).toThrow("exceeds maximum allowed limit of 50 MB");
  });

  test("CustomPosterService.validateFile accepts valid 10MB JPG file", () => {
    const validFileSizeBytes = 10 * 1024 * 1024; // 10MB
    expect(() => {
      CustomPosterService.validateFile(validFileSizeBytes, "image/jpeg", "highres.jpg");
    }).not.toThrow();
  });
});
