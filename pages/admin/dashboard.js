import React from 'react';
import Head from 'next/head';
import AdminDashboard from '../../components/admin/Dashboard';

const AdminDashboardPage = () => {
    return (
        <>
            <Head>
                <title>Admin Dashboard - Best Garden Hotel</title>
                <meta name="description" content="Admin dashboard for managing hotel operations" />
            </Head>
            <AdminDashboard />
        </>
    );
};

export default AdminDashboardPage;
