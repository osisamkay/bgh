import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

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

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Hotel Price Alert Subscription Confirmed',
      html: `
        <h2>Thank you for subscribing to price alerts!</h2>
        <p>We'll notify you when rooms matching your criteria become available:</p>
        <ul>
          <li>Price Range: $${priceRange[0]} - $${priceRange[1]}</li>
          ${roomType ? `<li>Room Type: ${roomType}</li>` : ''}
        </ul>
        <p>Best regards,<br>Best Garden Hotel</p>
      `
    });

    return NextResponse.json({
      message: 'Subscription successful',
      subscription
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Error processing subscription' },
      { status: 500 }
    );
  }
} 