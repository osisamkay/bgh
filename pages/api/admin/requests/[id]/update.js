import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const data = await req.json();
    const {
      status,
      comments,
      discount
    } = data;

    const request = await prisma.adminRequest.findUnique({
      where: { id },
      include: {
        requestedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    const updatedRequest = await prisma.adminRequest.update({
      where: { id },
      data: {
        status,
        comments,
        approvedById: session.user.id,
        approvedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        requestedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Notify the staff member who made the request
    if (request.requestedBy.email) {
      await sendEmail({
        to: request.requestedBy.email,
        subject: `Request ${status}`,
        html: `
          <h2>Your request has been ${status.toLowerCase()}</h2>
          <p>Your request has been reviewed and ${status.toLowerCase()} by the admin.</p>
          <h3>Request Details:</h3>
          <ul>
            <li>Type: ${request.type}</li>
            <li>Status: ${status}</li>
            <li>Comments: ${comments || 'No comments provided'}</li>
            ${discount ? `<li>Discount Applied: ${discount}%</li>` : ''}
          </ul>
        `
      });
    }

    // If approved and it's a discount request, update the booking
    if (status === 'APPROVED' && request.type === 'DISCOUNT' && discount) {
      const details = JSON.parse(request.details);
      if (details.bookingId) {
        await prisma.booking.update({
          where: { id: details.bookingId },
          data: {
            discount: discount,
            updatedAt: new Date()
          }
        });
      }
    }

    // Log the action
    await prisma.employeeLog.create({
      data: {
        action: `REQUEST_${status}`,
        details: JSON.stringify({
          requestId: id,
          type: request.type,
          status,
          comments,
          discount
        }),
        userId: session.user.id,
        createdAt: new Date()
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating admin request:', error);
    return NextResponse.json(
      { error: 'Failed to update admin request' },
      { status: 500 }
    );
  }
} 