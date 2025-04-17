import { prisma } from '@/lib/prisma';
import { NotificationService } from './notificationService';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

export class RefundService {
  static async processRefund(bookingId, userId, cancellationData) {
    try {
      // Fetch booking and payment details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          payment: true,
          room: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Calculate refund amount
      const refundAmount = this.calculateRefundAmount(
        booking.totalPrice,
        cancellationData.penalty
      );

      // Generate refund transaction ID
      const refundTransactionId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Process refund based on payment method
      const refundResult = await this.processRefundByPaymentMethod(
        booking.payment,
        refundAmount,
        refundTransactionId
      );

      // Update booking status and store refund details
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          refund: {
            create: {
              amount: refundAmount,
              transactionId: refundTransactionId,
              status: refundResult.status,
              paymentMethod: booking.payment.method,
              processedAt: new Date(),
              details: JSON.stringify(refundResult.details)
            }
          }
        }
      });

      // Log refund in employee dashboard
      await this.logRefund(booking, refundResult, userId);

      // Notify patron
      await NotificationService.sendRefundNotification(
        booking,
        refundResult,
        cancellationData
      );

      return {
        success: true,
        refundTransactionId,
        amount: refundAmount,
        status: refundResult.status
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }

  static calculateRefundAmount(totalAmount, penalty) {
    return totalAmount - (penalty || 0);
  }

  static async processRefundByPaymentMethod(payment, amount, transactionId) {
    let attempts = 0;
    let lastError = null;

    while (attempts < MAX_RETRY_ATTEMPTS) {
      try {
        if (payment.method === 'CREDIT_CARD') {
          // Integrate with your payment gateway here
          // This is a mock implementation
          return {
            status: 'PROCESSED',
            details: {
              gateway: 'mock_payment_gateway',
              transactionId,
              amount
            }
          };
        } else if (payment.method === 'CASH') {
          // Notify hotel manager for manual processing
          await this.notifyHotelManager(payment, amount, transactionId);
          return {
            status: 'PENDING_MANUAL',
            details: {
              type: 'CASH_REFUND',
              transactionId,
              amount,
              notifiedAt: new Date()
            }
          };
        } else {
          throw new Error('Unsupported payment method');
        }
      } catch (error) {
        lastError = error;
        attempts++;
        if (attempts < MAX_RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }

    // If all retries failed, escalate to hotel manager
    await this.escalateToHotelManager(payment, amount, transactionId, lastError);
    throw new Error('Refund processing failed after maximum retries');
  }

  static async notifyHotelManager(payment, amount, transactionId) {
    // Implement notification to hotel manager
    // This could be an email, in-app notification, or both
    console.log('Notifying hotel manager for manual refund processing:', {
      payment,
      amount,
      transactionId
    });
  }

  static async escalateToHotelManager(payment, amount, transactionId, error) {
    // Implement escalation logic
    console.log('Escalating failed refund to hotel manager:', {
      payment,
      amount,
      transactionId,
      error
    });
  }

  static async logRefund(booking, refundResult, userId) {
    await prisma.employeeLog.create({
      data: {
        type: 'REFUND_PROCESSED',
        userId,
        userName: booking.user.name,
        timestamp: new Date(),
        details: JSON.stringify({
          bookingId: booking.id,
          refundAmount: refundResult.details.amount,
          transactionId: refundResult.details.transactionId,
          status: refundResult.status
        })
      }
    });
  }
} 