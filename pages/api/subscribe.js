import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/utils/email';
import { getSubscriptionConfirmationTemplate } from '@/utils/emailTemplates';

export async function POST(req) {
  try {
    const { email, priceRange, roomType } = await req.json();

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { email },
      update: {
        priceRange: JSON.stringify(priceRange),
        roomType,
        updatedAt: new Date()
      },
      create: {
        email,
        priceRange: JSON.stringify(priceRange),
        roomType,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Send confirmation email with the new template
    const emailResult = await sendEmail({
      to: email,
      subject: 'Hotel Price Alert Subscription Confirmed',
      html: getSubscriptionConfirmationTemplate({ email, priceRange, roomType })
    });

    return NextResponse.json({
      message: 'Subscription successful',
      subscription,
      emailPreview: emailResult.previewUrl,
      etherealCredentials: {
        user: emailResult.etherealUser,
        pass: emailResult.etherealPass
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Error processing subscription' },
      { status: 500 }
    );
  }
} 