import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const date = searchParams.get('date');

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (type && type !== 'ALL') {
      where.type = type;
    }
    if (date) {
      where.createdAt = {
        gte: new Date(date),
        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      };
    }

    const requests = await prisma.adminRequest.findMany({
      where,
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin requests' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'FRONT_DESK' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
      { error: 'Failed to create admin request' },
      { status: 500 }
    );
  }
} 