// pages/profile.js
import React, { useState } from 'react';
import Head from 'next/head';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';

const EditModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [editMode, setEditMode] = useState(null);
    const [formData, setFormData] = useState({
        password: '',
        newPassword: '',
        confirmPassword: '',
        phone: user?.phone || '',
        streetAddress: user?.streetAddress || '',
        city: user?.city || '',
        province: user?.province || '',
        postalCode: user?.postalCode || ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            if (editMode === 'password') {
                // Handle password change
                if (formData.newPassword !== formData.confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                // Add password change logic here
            } else {
                await updateUser({
                    phone: formData.phone,
                    streetAddress: formData.streetAddress,
                    city: formData.city,
                    province: formData.province,
                    postalCode: formData.postalCode
                });
            }
            setEditMode(null);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const renderEditForm = () => {
        switch (editMode) {
            case 'password':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                );
            case 'address':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                            <input
                                type="text"
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                );
            case 'phone':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main>
            <Head>
                <title>Manage Your Account | BGH</title>
                <meta name="description" content="Manage your Best Garden Hotel profile" />
            </Head>

            <div className="min-h-screen ">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-4xl font-light text-center mb-12 text-gray-800">Manage Your Account</h1>

                    <div className="flex justify-center mb-10">
                        <div className="relative">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.firstName}
                                    className="w-36 h-36 rounded-full shadow-lg border-4 border-white"
                                />
                            ) : (
                                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg border-4 border-white">
                                    <span className="text-5xl font-light text-gray-600">{user?.firstName?.[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-light text-gray-800">Hello, {user?.firstName}</h2>
                        <p className="text-lg mt-2 text-gray-600">Customer ID: {user?.id}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column */}
                        <div className="space-y-10">
                            <section className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:shadow-md">
                                <h3 className="text-xl font-light mb-6 text-gray-800">Login Information</h3>
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <p className="text-gray-700">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => setEditMode('password')}
                                    className="w-full border-2 border-gray-800 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium"
                                >
                                    CHANGE PASSWORD
                                </button>
                            </section>

                            <section className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:shadow-md">
                                <h3 className="text-xl font-light mb-6 text-gray-800">Address</h3>
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <p className="text-gray-700">
                                        {user?.streetAddress || 'No address added'}<br />
                                        {user?.city && user?.province && user?.postalCode ?
                                            `${user.city}, ${user.province}, ${user.postalCode}` : ''}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setEditMode('address')}
                                        className="w-full border-2 border-gray-800 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium"
                                    >
                                        EDIT ADDRESS
                                    </button>

                                </div>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-10">
                            <section className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:shadow-md">
                                <h3 className="text-xl font-light mb-6 text-gray-800">Personal Information</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700">{user?.firstName} {user?.lastName}</p>
                                </div>
                            </section>

                            <section className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:shadow-md">
                                <h3 className="text-xl font-light mb-6 text-gray-800">Credit Card</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700">No card on file</p>
                                </div>
                            </section>

                            <section className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:shadow-md">
                                <h3 className="text-xl font-light mb-6 text-gray-800">Phone Number</h3>
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <p className="text-gray-700">{user?.phone || '(587) 123-9066'}</p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setEditMode('phone')}
                                        className="w-full border-2 border-gray-800 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium"
                                    >
                                        EDIT PHONE NUMBER
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <EditModal
                isOpen={!!editMode}
                onClose={() => setEditMode(null)}
                title={
                    editMode === 'password' ? 'Change Password' :
                        editMode === 'address' ? 'Edit Address' :
                            editMode === 'phone' ? 'Edit Phone Number' : ''
                }
            >
                {renderEditForm()}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => setEditMode(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </EditModal>
        </main>
    );
}

export default withAuth(Profile);