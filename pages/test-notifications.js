import React from 'react';
import Head from 'next/head';
import TestNotifications from '../components/TestNotifications';

export default function TestNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Test Notifications</title>
        <meta name="description" content="Test page for notifications" />
      </Head>

      <div className="container mx-auto py-8">
        <TestNotifications />
      </div>
    </div>
  );
} 