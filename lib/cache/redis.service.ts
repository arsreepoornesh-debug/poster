export class RedisCacheService {
  private static isRedisAvailable = false;
  private static inMemoryStore: Map<string, { value: any; expiresAt: number }> = new Map();

  public static async get<T>(key: string): Promise<T | null> {
    const item = this.inMemoryStore.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.inMemoryStore.delete(key);
      return null;
    }

    return item.value as T;
  }

  public static async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.inMemoryStore.set(key, { value, expiresAt });
  }

  public static async del(key: string): Promise<void> {
    this.inMemoryStore.delete(key);
  }

  public static async invalidatePattern(pattern: string): Promise<void> {
    const prefix = pattern.replace("*", "");
    for (const key of this.inMemoryStore.keys()) {
      if (key.startsWith(prefix)) {
        this.inMemoryStore.delete(key);
      }
    }
  }
}
