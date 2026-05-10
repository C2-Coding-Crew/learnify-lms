export interface RateLimitOptions {
  interval: number; // in milliseconds
  uniqueTokenPerInterval?: number; // max users in cache
  limit: number; // request limit per interval
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, number[]>();

  return {
    check: async (limit: number, token: string) => {
      const now = Date.now();
      const tokenCount = tokenCache.get(token) || [];
      
      // Filter out tokens older than the interval
      const validTokens = tokenCount.filter((timestamp) => now - timestamp < options.interval);
      
      if (validTokens.length >= limit) {
        return { success: false, limit, remaining: 0 };
      }
      
      validTokens.push(now);
      tokenCache.set(token, validTokens);
      
      // Clean up cache if it grows too large (prevent memory leak)
      if (options.uniqueTokenPerInterval && tokenCache.size > options.uniqueTokenPerInterval) {
        const oldestToken = Array.from(tokenCache.keys())[0];
        tokenCache.delete(oldestToken);
      }

      return {
        success: true,
        limit,
        remaining: limit - validTokens.length,
      };
    },
  };
}
