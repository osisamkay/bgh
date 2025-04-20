// utils/csrf.js
import crypto from 'crypto';

export function generateCsrfToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function validateCsrfToken(receivedToken, expectedToken) {
    if (!receivedToken || !expectedToken) {
        return false;
    }

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
        Buffer.from(receivedToken),
        Buffer.from(expectedToken)
    );
}