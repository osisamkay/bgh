// pages/api/test-transactions.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    // Count total payments in the database
    const paymentCount = await prisma.payment.count();
    
    // Count total refunds in the database
    const refundCount = await prisma.refund.count();

    // Get 5 most recent payments if any exist
    const recentPayments = paymentCount > 0 
      ? await prisma.payment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            booking: {
              select: { id: true }
            },
            user: {
              select: { email: true }
            }
          }
        })
      : [];

    // Get payment dates to check date range
    const paymentDates = recentPayments.map(p => ({
      id: p.id,
      createdAt: p.createdAt,
      paymentDate: p.paymentDate
    }));

    return res.status(200).json({
      success: true,
      counts: {
        totalPayments: paymentCount,
        totalRefunds: refundCount
      },
      sampleDates: paymentDates,
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        bookingId: p.bookingId,
        userEmail: p.user?.email || 'N/A'
      }))
    });
  } catch (error) {
    console.error('Error testing transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Error testing transactions',
      error: error.message
    });
  }
}