import { sendEmail } from './email';
import { prisma } from '@/lib/prisma';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

export class NotificationService {
  static async sendCancellationNotification(booking, user, cancellationData) {
    const notification = {
      type: 'BOOKING_CANCELLATION',
      userId: user.id,
      bookingId: booking.id,
      status: 'PENDING',
      attempts: 0,
      data: {
        bookingReference: booking.id,
        checkInDate: booking.checkInDate,
        roomType: booking.room.type,
        totalAmount: booking.totalPrice,
        cancellationDate: new Date().toISOString(),
        refundAmount: cancellationData.refundAmount,
        penalty: cancellationData.penalty,
        refundProcessingTime: '3 business days',
        refundTransactionId: cancellationData.refundTransactionId,
        supportContact: {
          email: 'support@hotel.com',
          phone: '+1 (555) 123-4567'
        }
      }
    };

    try {
      // Store notification in database
      const storedNotification = await prisma.notification.create({
        data: {
          ...notification,
          data: JSON.stringify(notification.data)
        }
      });

      // Send notification
      await this._sendNotificationWithRetry(storedNotification, user);

      // Log in employee dashboard
      await this._logEmployeeDashboard(notification, user);

      return storedNotification;
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
      throw error;
    }
  }

  static async _sendNotificationWithRetry(notification, user) {
    let attempts = 0;
    let success = false;

    while (attempts < MAX_RETRY_ATTEMPTS && !success) {
      try {
        // Send in-app notification
        await this._sendInAppNotification(notification, user);

        // Send email notification
        await this._sendEmailNotification(notification, user);

        success = true;
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'SENT' }
        });
      } catch (error) {
        attempts++;
        console.error(`Notification attempt ${attempts} failed:`, error);

        if (attempts === MAX_RETRY_ATTEMPTS) {
          await this._escalateToStaff(notification, user);
          throw new Error('Notification failed after maximum retries');
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  static async _sendInAppNotification(notification, user) {
    // Implement in-app notification logic here
    // This could be using a WebSocket connection or a notification queue
    console.log('Sending in-app notification:', notification);
  }

  static async _sendEmailNotification(notification, user) {
    const emailContent = this._generateEmailContent(notification);
    
    await sendEmail({
      to: user.email,
      subject: 'Booking Cancellation Confirmation',
      html: emailContent
    });
  }

  static _generateEmailContent(notification) {
    const data = JSON.parse(notification.data);
    
    return `
      <h2>Booking Cancellation Confirmation</h2>
      <p>Dear ${user.name},</p>
      
      <h3>Booking Details</h3>
      <ul>
        <li>Reference Number: ${data.bookingReference}</li>
        <li>Check-in Date: ${new Date(data.checkInDate).toLocaleDateString()}</li>
        <li>Room Type: ${data.roomType}</li>
        <li>Total Amount Paid: $${data.totalAmount.toFixed(2)}</li>
      </ul>

      <h3>Cancellation Details</h3>
      <ul>
        <li>Cancellation Date: ${new Date(data.cancellationDate).toLocaleString()}</li>
        <li>Refund Amount: $${data.refundAmount.toFixed(2)}</li>
        ${data.penalty > 0 ? `<li>Penalty: $${data.penalty.toFixed(2)}</li>` : ''}
        <li>Estimated Processing Time: ${data.refundProcessingTime}</li>
        ${data.refundTransactionId ? `<li>Refund Transaction ID: ${data.refundTransactionId}</li>` : ''}
      </ul>

      <p>For any questions or concerns, please contact our support team:</p>
      <ul>
        <li>Email: ${data.supportContact.email}</li>
        <li>Phone: ${data.supportContact.phone}</li>
      </ul>
    `;
  }

  static async _logEmployeeDashboard(notification, user) {
    await prisma.employeeLog.create({
      data: {
        type: 'NOTIFICATION_SENT',
        userId: user.id,
        userName: user.name,
        timestamp: new Date(),
        details: JSON.stringify({
          notificationId: notification.id,
          bookingId: notification.bookingId
        })
      }
    });
  }

  static async _escalateToStaff(notification, user) {
    // Implement escalation logic here
    // This could involve sending alerts to specific staff members
    console.log('Escalating notification to staff:', notification);
  }

  static async sendManualNotification(notificationId, staffId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    const user = await prisma.user.findUnique({
      where: { id: notification.userId }
    });

    await this._sendNotificationWithRetry(notification, user);

    // Log manual sending
    await prisma.employeeLog.create({
      data: {
        type: 'MANUAL_NOTIFICATION_SENT',
        userId: staffId,
        timestamp: new Date(),
        details: JSON.stringify({
          notificationId: notification.id,
          bookingId: notification.bookingId
        })
      }
    });
  }
} 