import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import PDFKit from 'pdfkit';

class ReportService {
  static async generateBookingReport(filters) {
    const {
      startDate,
      endDate,
      status,
      type,
      source,
      roomType
    } = filters;

    const where = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (status) where.status = status;
    if (type) where.type = type;
    if (source) where.source = source;
    if (roomType) where.roomType = roomType;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        room: true,
        payment: true
      }
    });

    return {
      totalBookings: bookings.length,
      byStatus: this.groupBy(bookings, 'status'),
      byType: this.groupBy(bookings, 'type'),
      bySource: this.groupBy(bookings, 'source'),
      byRoomType: this.groupBy(bookings, 'roomType'),
      bookings
    };
  }

  static async generateOccupancyReport(filters) {
    const {
      startDate,
      endDate,
      roomType
    } = filters;

    const bookings = await prisma.booking.findMany({
      where: {
        checkInDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...(roomType && { roomType })
      },
      include: {
        room: true
      }
    });

    const totalRooms = await prisma.room.count({
      where: roomType ? { type: roomType } : {}
    });

    const occupancyByDate = this.calculateOccupancyByDate(bookings, totalRooms);
    const peakPeriods = this.identifyPeakPeriods(occupancyByDate);

    return {
      totalRooms,
      averageOccupancy: this.calculateAverageOccupancy(occupancyByDate),
      peakPeriods,
      occupancyByDate,
      bookings
    };
  }

  static async generateRevenueReport(filters) {
    const {
      startDate,
      endDate,
      paymentMethod
    } = filters;

    const where = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (paymentMethod) where.paymentMethod = paymentMethod;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: true
      }
    });

    const refunds = await prisma.refund.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        booking: true
      }
    });

    return {
      totalRevenue: this.calculateTotalRevenue(payments),
      byPaymentMethod: this.groupBy(payments, 'method'),
      byStatus: this.groupBy(payments, 'status'),
      refunds: {
        total: this.calculateTotalRefunds(refunds),
        byReason: this.groupBy(refunds, 'reason')
      },
      payments,
      refunds
    };
  }

  static async generateTrendReport(filters) {
    const {
      startDate,
      endDate,
      metric
    } = filters;

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        user: true,
        room: true
      }
    });

    return {
      bookingTrends: this.calculateBookingTrends(bookings),
      seasonalPatterns: this.identifySeasonalPatterns(bookings),
      clientUsage: this.analyzeClientUsage(bookings),
      metricAnalysis: this.analyzeMetric(bookings, metric)
    };
  }

  static async exportReport(report, format, filters) {
    switch (format) {
      case 'EXCEL':
        return await this.exportToExcel(report, filters);
      case 'PDF':
        return await this.exportToPDF(report, filters);
      case 'CSV':
        return await this.exportToCSV(report, filters);
      default:
        throw new Error('Unsupported export format');
    }
  }

  static async scheduleReport(reportType, schedule, email, filters) {
    const scheduledReport = await prisma.scheduledReport.create({
      data: {
        type: reportType,
        schedule,
        email,
        filters: JSON.stringify(filters),
        lastGenerated: null,
        nextGeneration: this.calculateNextGeneration(schedule),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return scheduledReport;
  }

  static async logReportActivity(userId, reportType, exportStatus) {
    await prisma.reportLog.create({
      data: {
        userId,
        reportType,
        exportStatus,
        createdAt: new Date()
      }
    });
  }

  // Helper methods
  static groupBy(array, key) {
    return array.reduce((result, item) => {
      const value = item[key];
      result[value] = (result[value] || 0) + 1;
      return result;
    }, {});
  }

  static calculateOccupancyByDate(bookings, totalRooms) {
    // Implementation for calculating occupancy by date
  }

  static identifyPeakPeriods(occupancyByDate) {
    // Implementation for identifying peak periods
  }

  static calculateAverageOccupancy(occupancyByDate) {
    // Implementation for calculating average occupancy
  }

  static calculateTotalRevenue(payments) {
    // Implementation for calculating total revenue
  }

  static calculateTotalRefunds(refunds) {
    // Implementation for calculating total refunds
  }

  static calculateBookingTrends(bookings) {
    // Implementation for calculating booking trends
  }

  static identifySeasonalPatterns(bookings) {
    // Implementation for identifying seasonal patterns
  }

  static analyzeClientUsage(bookings) {
    // Implementation for analyzing client usage
  }

  static analyzeMetric(bookings, metric) {
    // Implementation for analyzing specific metrics
  }

  static async exportToExcel(report, filters) {
    // Implementation for Excel export
  }

  static async exportToPDF(report, filters) {
    // Implementation for PDF export
  }

  static async exportToCSV(report, filters) {
    // Implementation for CSV export
  }

  static calculateNextGeneration(schedule) {
    // Implementation for calculating next report generation time
  }
}

export default ReportService; 