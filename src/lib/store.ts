export interface FixedWindowState {
    current: number;
    resetAt: number;
  }
  
  export interface TokenBucketState {
    allowed: boolean;
    tokensLeft: number;
    resetAt: number;
  }
  
  export interface RateLimitStore {
    /**
     * Increment a counter for the current fixed window and return
     * the updated count and reset time.
     */
    incrementWindowCounter(
      key: string,
      windowMs: number
    ): Promise<FixedWindowState>;
  
    /**
     * Consume a token from the bucket, refilling based on time elapsed.
     */
    consumeToken(
      key: string,
      capacity: number,
      refillRatePerSec: number
    ): Promise<TokenBucketState>;
  }
  