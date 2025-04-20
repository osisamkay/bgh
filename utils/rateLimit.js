// utils/rateLimit.js
export default function rateLimit(options) {
    const { interval = 60 * 1000, uniqueTokenPerInterval = 500 } = options;
    const tokenCache = new Map();

    return {
        check: (res, limit, token) => {
            const tokenCount = tokenCache.get(token) || 0;

            if (tokenCount >= limit) {
                res.status(429).json({
                    success: false,
                    message: 'Rate limit exceeded. Please try again later.'
                });
                return Promise.reject('Rate limit exceeded');
            }

            // Set or update token count
            tokenCache.set(token, tokenCount + 1);

            // Clear token after interval
            setTimeout(() => {
                tokenCache.delete(token);
            }, interval);

            return Promise.resolve();
        }
    };
}