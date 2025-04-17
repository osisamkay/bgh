import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { NotificationService } from '@/utils/notificationService';
import { RefundService } from '@/utils/refundService';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cancellationData = await req.json();
    
    // Validate cancellation data
    if (!cancellationData.bookingId || !cancellationData.userId) {
      return NextResponse.json(
        { error: 'Invalid cancellation data' },
        { status: 400 }
      );
    }

    // Process refund
    const refundResult = await RefundService.processRefund(
      cancellationData.bookingId,
      cancellationData.userId,
      cancellationData
    );

    return NextResponse.json({
      success: true,
      bookingId: cancellationData.bookingId,
      status: 'CANCELLED',
      refund: {
        transactionId: refundResult.refundTransactionId,
        amount: refundResult.amount,
        status: refundResult.status
      }
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: 'Cancellation failed' },
      { status: 500 }
    );
  }
} 