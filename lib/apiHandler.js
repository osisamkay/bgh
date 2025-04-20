// lib/apiHandler.js
import adminAuthMiddleware from '../middleware/adminAuth';

// Higher-order function to wrap API handlers with middleware
export function withAdminAuth(handler) {
    return async (req, res) => {
        try {
            await adminAuthMiddleware(req, res, () => handler(req, res));
        } catch (error) {
            console.error('API error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}