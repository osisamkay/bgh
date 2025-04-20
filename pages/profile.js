import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useNotification } from '../contexts/NotificationContext';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const [isEditing, setIsEditing] = useState({
        password: false,
        address: false,
        phone: false,
        personalInfo: false
    });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            province: '',
            postalCode: ''
        },
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle authentication redirect
    useEffect(() => {
        if (mounted && !user) {
            router.push('/login');
        }
    }, [mounted, user, router]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!mounted || !user) return;

            try {
                const response = await fetch('/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const userData = await response.json();
                setFormData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: {
                        street: userData.address?.street || '',
                        city: userData.address?.city || '',
                        province: userData.address?.province || '',
                        postalCode: userData.address?.postalCode || ''
                    },
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } catch (error) {
                console.error('Error fetching user details:', error);
                addNotification('Failed to load user details', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [mounted, user, addNotification]);

    if (!mounted) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A2B3B]"></div>
            </div>
        );
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddressChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
    };

    const handlePasswordChange = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            addNotification('New passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update password');
            }

            addNotification('Password updated successfully', 'success');
            setIsEditing(prev => ({ ...prev, password: false }));
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error) {
            addNotification(error.message || 'Failed to update password', 'error');
        }
    };

    const handleSave = async () => {
        try {
            // Validate phone number format
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (formData.phone && !phoneRegex.test(formData.phone)) {
                addNotification('Please enter a valid phone number with at least 10 digits', 'error');
                return;
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    address: {
                        street: formData.address.street,
                        city: formData.address.city,
                        province: formData.address.province,
                        postalCode: formData.address.postalCode
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();
            updateUser(updatedUser);
            addNotification('Profile updated successfully', 'success');
            setIsEditing({
                password: false,
                address: false,
                phone: false,
                personalInfo: false
            });
        } catch (error) {
            addNotification(error.message || 'Failed to update profile', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>Manage Your Account - Best Garden Hotel</title>
                <meta name="description" content="Manage your Best Garden Hotel account" />
            </Head>

            <main className="container mx-auto px-4 py-12">
                <div className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-[#1A2B3B] text-white p-8">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <Image
                                    src="/images/default-avatar.svg"
                                    alt="Profile"
                                    width={120}
                                    height={120}
                                    className="rounded-full border-4 border-white"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold">Hello, {formData.firstName}</h1>
                                <p className="text-gray-300 mt-1">Customer ID: {user.customerId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                {/* Login Information */}
                                <section className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B3B]">Login Information</h3>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-600 mb-2">Email</p>
                                            <p className="font-medium">{formData.email}</p>
                                        </div>
                                        {!isEditing.password ? (
                                            <button
                                                onClick={() => setIsEditing(prev => ({ ...prev, password: true }))}
                                                className="w-full bg-white border-2 border-[#1A2B3B] text-[#1A2B3B] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                            >
                                                CHANGE PASSWORD
                                            </button>
                                        ) : (
                                            <div className="space-y-4">
                                                <input
                                                    type="password"
                                                    placeholder="Current Password"
                                                    value={formData.currentPassword}
                                                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    value={formData.newPassword}
                                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Confirm New Password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={handlePasswordChange}
                                                        className="flex-1 bg-[#1A2B3B] text-white px-6 py-3 rounded-lg hover:bg-[#2c3e50] transition-colors"
                                                    >
                                                        Save Password
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(prev => ({ ...prev, password: false }));
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                currentPassword: '',
                                                                newPassword: '',
                                                                confirmPassword: ''
                                                            }));
                                                        }}
                                                        className="flex-1 border-2 border-[#1A2B3B] text-[#1A2B3B] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Address Section */}
                                <section className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B3B]">Address</h3>
                                    <div className="space-y-4">
                                        {!isEditing.address ? (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-gray-600">{formData.address.street || 'No address provided'}</p>
                                                <p className="text-gray-600">
                                                    {formData.address.city && formData.address.province
                                                        ? `${formData.address.city}, ${formData.address.province}`
                                                        : 'No city/province provided'}
                                                </p>
                                                <p className="text-gray-600">{formData.address.postalCode || 'No postal code provided'}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="Street Address"
                                                    value={formData.address.street}
                                                    onChange={(e) => handleAddressChange('street', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    value={formData.address.city}
                                                    onChange={(e) => handleAddressChange('city', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Province"
                                                    value={formData.address.province}
                                                    onChange={(e) => handleAddressChange('province', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Postal Code"
                                                    value={formData.address.postalCode}
                                                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setIsEditing(prev => ({ ...prev, address: !prev.address }))}
                                            className="w-full bg-white border-2 border-[#1A2B3B] text-[#1A2B3B] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            {isEditing.address ? 'CANCEL' : 'EDIT ADDRESS'}
                                        </button>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                {/* Personal Information */}
                                <section className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B3B]">Personal Information</h3>
                                    <div className="space-y-4">
                                        {!isEditing.personalInfo ? (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-gray-600">Name</p>
                                                <p className="font-medium">
                                                    {formData.firstName && formData.lastName
                                                        ? `${formData.firstName} ${formData.lastName}`
                                                        : 'No name provided'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                                />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setIsEditing(prev => ({ ...prev, personalInfo: !prev.personalInfo }))}
                                            className="w-full bg-white border-2 border-[#1A2B3B] text-[#1A2B3B] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            {isEditing.personalInfo ? 'CANCEL' : 'EDIT PERSONAL INFO'}
                                        </button>
                                    </div>
                                </section>

                                {/* Phone Number */}
                                <section className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B3B]">Phone Number</h3>
                                    <div className="space-y-4">
                                        {!isEditing.phone ? (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-gray-600">Primary Phone</p>
                                                <p className="font-medium">{formData.phone || 'No phone number provided'}</p>
                                            </div>
                                        ) : (
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B3B] focus:border-transparent"
                                            />
                                        )}
                                        <button
                                            onClick={() => setIsEditing(prev => ({ ...prev, phone: !prev.phone }))}
                                            className="w-full bg-white border-2 border-[#1A2B3B] text-[#1A2B3B] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            {isEditing.phone ? 'CANCEL' : 'EDIT PHONE NUMBER'}
                                        </button>
                                    </div>
                                </section>

                                {/* Save Button */}
                                {Object.values(isEditing).some(Boolean) && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            className="bg-[#1A2B3B] text-white px-12 py-3 rounded-lg hover:bg-[#2c3e50] transition-colors text-lg font-medium"
                                        >
                                            SAVE CHANGES
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 