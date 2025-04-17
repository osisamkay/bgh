import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import ReportService from '@/utils/reportService';

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
    const {
      reportType,
      filters,
      format,
      email,
      schedule
    } = data;

    let report;
    switch (reportType) {
      case 'BOOKING':
        report = await ReportService.generateBookingReport(filters);
        break;
      case 'OCCUPANCY':
        report = await ReportService.generateOccupancyReport(filters);
        break;
      case 'REVENUE':
        report = await ReportService.generateRevenueReport(filters);
        break;
      case 'TREND':
        report = await ReportService.generateTrendReport(filters);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    // If scheduled report is requested
    if (schedule) {
      await ReportService.scheduleReport(reportType, schedule, email, filters);
      return NextResponse.json({
        message: 'Report scheduled successfully',
        nextGeneration: schedule.nextGeneration
      });
    }

    // If export is requested
    if (format) {
      const exportData = await ReportService.exportReport(report, format, filters);
      
      // Log the export activity
      await ReportService.logReportActivity(
        session.user.id,
        reportType,
        'EXPORTED'
      );

      // If email is provided, send the report
      if (email) {
        await sendEmail({
          to: email,
          subject: `${reportType} Report`,
          html: `
            <h2>${reportType} Report</h2>
            <p>Please find the attached report.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          `,
          attachments: [{
            filename: `report.${format.toLowerCase()}`,
            content: exportData
          }]
        });
      }

      return NextResponse.json({
        message: 'Report generated and exported successfully',
        data: exportData
      });
    }

    // Log the report generation
    await ReportService.logReportActivity(
      session.user.id,
      reportType,
      'GENERATED'
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 