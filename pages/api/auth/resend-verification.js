import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { sendVerificationEmail } from '@/utils/email';
import crypto from 'crypto';

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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Delete any existing verification tokens for this user
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id }
        });

        // Create new verification token
        const newToken = await prisma.verificationToken.create({
            data: {
                token: verificationToken,
                userId: user.id,
                expiresAt: expiresAt
            }
        });

        // Send verification email
        const emailResult = await sendVerificationEmail({
            to: user.email,
            token: verificationToken,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
        });

        // In development, return the verification URL for preview
        if (process.env.NODE_ENV === 'development' && emailResult?.previewUrl) {
            return res.status(200).json({
                success: true,
                message: 'Verification email sent successfully',
                previewUrl: emailResult.previewUrl
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Verification email sent successfully',
            emailDetails: emailResult
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while resending verification email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}