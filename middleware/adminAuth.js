// middleware/adminAuth.js
import { verifyToken } from '../utils/auth';

export default async function adminAuthMiddleware(req, res, next) {
    try {
        // Skip for non-GET options requests (CORS preflight)
        if (req.method === 'OPTIONS') {
            return next();
        }

        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token and get user
        const user = await verifyToken(token);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
}