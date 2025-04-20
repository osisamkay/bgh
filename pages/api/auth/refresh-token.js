import { verifyRefreshToken } from '@/utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Get refresh token from cookie in production or request body in development
        let refreshToken;

        if (process.env.NODE_ENV === 'production') {
            // Get token from cookie
            const cookies = req.cookies;
            refreshToken = cookies.refreshToken;
        } else {
            // Get token from request body
            refreshToken = req.body.refreshToken;
        }

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token and get new access token
        const result = await verifyRefreshToken(refreshToken);

        if (!result) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Return new access token and user data
        return res.status(200).json({
            success: true,
            token: result.accessToken,
            user: result.user
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to refresh token'
        });
    }
}