const requests = new Map();

export async function rateLimit(identifier) {
    const now = Date.now();
    const windowSize = 60000;
    const maxRequests = 1000;
    
    const key = `${identifier}:${Math.floor(now / windowSize)}`;
    
    const currentCount = requests.get(key) || 0;
    
    if (currentCount >= maxRequests) {
        return {
            limited: true,
            retryAfter: windowSize - (now % windowSize)
        };
    }
    
    requests.set(key, currentCount + 1);
    
    setTimeout(() => {
        requests.delete(key);
    }, windowSize * 2);
    
    return { limited: false };
}