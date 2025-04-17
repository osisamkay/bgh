import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import CryptoJS from 'crypto-js';

// Store processed payment IDs to prevent double payments
const processedPayments = new Set();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const paymentData = await req.json();
    
    // Validate payment data
    if (!paymentData.reservationId || !paymentData.amount || !paymentData.paymentMethod) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      );
    }

    // Check for duplicate payment attempts
    if (processedPayments.has(paymentData.reservationId)) {
      return NextResponse.json(
        { error: 'Payment already processed for this reservation' },
        { status: 400 }
      );
    }

    // Decrypt card data if present
    let decryptedCardData = {};
    if (paymentData.cardNumber && paymentData.expiryDate && paymentData.cvc) {
      const secretKey = process.env.ENCRYPTION_KEY;
      try {
        decryptedCardData = {
          cardNumber: CryptoJS.AES.decrypt(paymentData.cardNumber, secretKey).toString(CryptoJS.enc.Utf8),
          expiryDate: CryptoJS.AES.decrypt(paymentData.expiryDate, secretKey).toString(CryptoJS.enc.Utf8),
          cvc: CryptoJS.AES.decrypt(paymentData.cvc, secretKey).toString(CryptoJS.enc.Utf8),
        };
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid encrypted data' },
          { status: 400 }
        );
      }
    }

    // Here you would integrate with your payment gateway
    // For now, we'll simulate a successful payment
    const paymentResult = {
      id: `pay_${Date.now()}`,
      status: 'succeeded',
      amount: paymentData.amount,
      currency: 'CAD',
      paymentMethod: paymentData.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    // Mark this payment as processed
    processedPayments.add(paymentData.reservationId);

    // In a real implementation, you would:
    // 1. Verify the payment with your payment gateway
    // 2. Update the reservation status in your database
    // 3. Send confirmation emails
    // 4. Log the transaction

    return NextResponse.json(paymentResult);
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
} 