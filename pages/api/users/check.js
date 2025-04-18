import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        email: true
      }
    });

    if (user) {
      return res.status(200).json({
        exists: true,
        userId: user.id,
        role: user.role,
        email: user.email
      });
    }

    return res.status(200).json({
      exists: false
    });

  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ message: 'Error checking user existence' });
  }
} 