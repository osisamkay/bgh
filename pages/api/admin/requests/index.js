import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';
import { verifyToken } from '@/utils/auth';

export async function GET(req) {
  try {
    // Get token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token and get user
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const requests = await prisma.adminRequest.findMany({
      orderBy: {
        createdAt: 'desc'
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

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    return NextResponse.json(
      { message: 'Error fetching admin requests' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Get token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token and get user
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin or front desk
    if (user.role !== 'ADMIN' && user.role !== 'FRONT_DESK') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await req.json();
    const {
      type,
      details,
      staffId
    } = data;

    const request = await prisma.adminRequest.create({
      data: {
        type,
        details: JSON.stringify(details),
        status: 'PENDING',
        requestedById: staffId,
        createdAt: new Date(),
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

    // Notify admin via email
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (admin) {
      await sendEmail({
        to: admin.email,
        subject: 'New Admin Request',
        html: `
          <h2>New Admin Request</h2>
          <p>A new request requires your attention.</p>
          <h3>Request Details:</h3>
          <ul>
            <li>Type: ${type}</li>
            <li>Requested by: ${request.requestedBy.name}</li>
            <li>Details: ${JSON.stringify(details)}</li>
          </ul>
          <p>Please review this request in the admin dashboard.</p>
        `
      });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error creating admin request:', error);
    return NextResponse.json(
      { message: 'Failed to create admin request' },
      { status: 500 }
    );
  }
} 