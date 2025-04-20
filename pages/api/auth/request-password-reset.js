// pages/api/auth/request-password-reset.js
import prisma from '@/lib/prisma';
import { generatePasswordResetToken } from '@/utils/auth';
import { sendPasswordResetEmail } from '@/utils/emailService';
import rateLimit from '@/utils/rateLimit';

// Create limiter: 3 password reset requests per hour
const limiter = rateLimit({
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 100,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Apply rate limiting based on IP address
        await limiter.check(res, 3, req.headers['x-forwarded-for'] || req.socket.remoteAddress);

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        // Don't reveal whether a user exists for security reasons
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = await generatePasswordResetToken(user.id);

        // Send password reset email
        try {
            await sendPasswordResetEmail({
                to: user.email,
                token: resetToken,
                name: `${user.firstName} ${user.lastName}`
            });
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email. Please try again later.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again later.'
        });
    }
}