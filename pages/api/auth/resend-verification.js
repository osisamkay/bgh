import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/utils/emailService';
import { generateVerificationToken } from '@/utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                verificationTokens: {
                    where: {
                        expiresAt: {
                            gt: new Date()
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Check if there's an active token and it was created less than 5 minutes ago
        const activeToken = user.verificationTokens[0];
        if (activeToken) {
            const tokenAge = Date.now() - activeToken.createdAt.getTime();
            const fiveMinutes = 5 * 60 * 1000;

            if (tokenAge < fiveMinutes) {
                return res.status(429).json({
                    success: false,
                    message: 'Please wait 5 minutes before requesting another verification email'
                });
            }
        }

        // Generate new verification token
        const verificationToken = await generateVerificationToken();

        // Save token to database
        await prisma.verificationToken.create({
            data: {
                token: verificationToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken, {
            firstName: user.firstName,
            lastName: user.lastName
        });

        return res.status(200).json({
            success: true,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send verification email'
        });
    }
} 