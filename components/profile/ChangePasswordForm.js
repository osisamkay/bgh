// components/profile/ChangePasswordForm.js
import React, { useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

export default function ChangePasswordForm() {
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Check if passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        // Check password length
        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                addNotification('You must be logged in to change your password', 'error');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                addNotification('Password changed successfully', 'success');
                // Reset form
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setError(data.message || 'Failed to change password');
                addNotification(data.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Password change error:', error);
            setError('An error occurred while changing your password');
            addNotification('An error occurred while changing your password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-md p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password*
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password*
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters long
                    </p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password*
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1a2b3b] text-white py-2 px-4 rounded-md hover:bg-[#2c3e50] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'UPDATING...' : 'CHANGE PASSWORD'}
                    </button>
                </div>
            </form>
        </div>
    );
}