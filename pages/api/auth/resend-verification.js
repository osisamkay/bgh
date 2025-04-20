import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { sendVerificationEmail } from '@/utils/email';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const user = await verifyToken(token);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        // Check if email is already verified
        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        // Generate verification token and send email
        const verificationToken = await prisma.verificationToken.create({
            data: {
                token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                userId: user.id,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken.token);

        // In development, return the verification URL for preview
        let previewUrl;
        if (process.env.NODE_ENV === 'development') {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
            previewUrl = `${baseUrl}/verify-email?token=${verificationToken.token}`;
        }

        return res.status(200).json({
            success: true,
            message: 'Verification email sent successfully',
            previewUrl
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while resending verification email'
        });
    }
} 