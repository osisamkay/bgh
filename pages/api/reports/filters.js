import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const filters = await prisma.reportFilter.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(filters);
  } catch (error) {
    console.error('Error fetching saved filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved filters' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { name, filters } = data;

    const savedFilter = await prisma.reportFilter.create({
      data: {
        name,
        filters: JSON.stringify(filters),
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(savedFilter);
  } catch (error) {
    console.error('Error saving filter:', error);
    return NextResponse.json(
      { error: 'Failed to save filter' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Filter ID is required' },
        { status: 400 }
      );
    }

    await prisma.reportFilter.delete({
      where: {
        id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ message: 'Filter deleted successfully' });
  } catch (error) {
    console.error('Error deleting filter:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter' },
      { status: 500 }
    );
  }
} 