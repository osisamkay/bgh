import { prisma } from '../../../lib/prisma';
import { sendPasswordResetEmail } from '../../../lib/email';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return res.status(200).json({ message: 'If an account exists, a password reset email will be sent' });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Store reset token
        await prisma.resetPasswordToken.create({
            data: {
                token,
                expires,
                userId: user.id,
            },
        });

        // Generate reset link
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

        // Send reset email
        const emailResult = await sendPasswordResetEmail(user.email, resetLink);

        if (!emailResult.success) {
            return res.status(500).json({ error: 'Failed to send reset email' });
        }

        return res.status(200).json({ message: 'If an account exists, a password reset email will be sent' });
    } catch (error) {
        console.error('Password reset request failed:', error);
        return res.status(500).json({ error: 'Failed to process password reset request' });
    }
} 