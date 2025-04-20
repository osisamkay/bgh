import prisma from '@/lib/prisma';
import { sendVerificationEmail } from '@/utils/emailService';
import { generateVerificationToken } from '@/utils/auth';
import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = await verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                verificationTokens: {
                    where: {
                        expiresAt: {
                            gt: new Date()
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
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

            // Delete old token
            await prisma.verificationToken.delete({
                where: { id: activeToken.id }
            });
        }

        // Generate new verification token
        const verificationToken = await generateVerificationToken();

        // Save token to database
        const savedToken = await prisma.verificationToken.create({
            data: {
                token: verificationToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });

        if (!savedToken) {
            throw new Error('Failed to save verification token');
        }

        // Send verification email
        const emailResult = await sendVerificationEmail({
            to: user.email,
            token: verificationToken,
            name: `${user.firstName} ${user.lastName}`
        });

        if (!emailResult.success) {
            // If email sending fails, delete the token we just created
            await prisma.verificationToken.delete({
                where: { id: savedToken.id }
            });

            throw new Error(emailResult.error || 'Failed to send verification email');
        }

        return res.status(200).json({
            success: true,
            message: 'Verification email sent successfully',
            previewUrl: emailResult.previewUrl
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to send verification email'
        });
    }
} 