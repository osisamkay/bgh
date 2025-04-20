import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Function to generate a secure random password
function generateSecurePassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Ensure at least one of each required character type
    password += charset.match(/[A-Z]/)[0]; // Uppercase
    password += charset.match(/[a-z]/)[0]; // Lowercase
    password += charset.match(/[0-9]/)[0]; // Number
    password += charset.match(/[!@#$%^&*]/)[0]; // Special character

    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
        const randomIndex = crypto.randomInt(charset.length);
        password += charset[randomIndex];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Generate a secure password
        const newPassword = generateSecurePassword();

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin user's password
        const updatedAdmin = await prisma.user.update({
            where: {
                email: 'admin@hotel.com',
                role: 'ADMIN'
            },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            },
            select: {
                id: true,
                email: true,
                role: true,
                updatedAt: true
            }
        });

        if (!updatedAdmin) {
            return res.status(404).json({ error: 'Admin user not found' });
        }

        return res.status(200).json({
            message: 'Admin password reset successfully',
            password: newPassword, // Return the generated password
            user: updatedAdmin
        });
    } catch (error) {
        console.error('Error resetting admin password:', error);
        return res.status(500).json({ error: 'Failed to reset admin password' });
    } finally {
        await prisma.$disconnect();
    }
} 