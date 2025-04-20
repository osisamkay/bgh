import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

export function generateToken(userData) {
    return jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
} 