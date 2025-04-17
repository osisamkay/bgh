import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Header from '../components/Header';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    province: '',
    country: ''
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { signup } = useAuth();
  const { addNotification } = useNotification();
  
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    Object.keys(formData).forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Email confirmation
    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }
    
    // Password validation
    if (formData.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character';
      }
    }
    
    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms and conditions
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signup(formData);
      
      if (result.success) {
        addNotification('Registration successful! Please check your email to verify your account.', 'success');
        router.push('/signup-success');
      } else {
        addNotification(result.message || 'Registration failed', 'error');
      }
    } catch (error) {
      addNotification('An error occurred during registration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head>
        <title>Create Account - Best Garden Hotel</title>
        <meta name="description" content="Join BGH as a member and enjoy exclusive benefits" />
      </Head>
      
      
      
      <div className="bg-[#f0f0e0] p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Join BGH™ Member</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <p className="mb-6">*Indicates Required Field</p>
        
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Confirm Email */}
            <div>
              <label htmlFor="confirmEmail" className="block mb-2">
                Confirm Email Address *
              </label>
              <input
                type="email"
                id="confirmEmail"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.confirmEmail}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-2">
                Create Password *
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <p className="text-sm mt-1">
                Create a password with at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.
              </p>
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Street Address */}
            <div className="md:col-span-2">
              <label htmlFor="streetAddress" className="block mb-2">
                Street Address *
              </label>
              <input
                type="text"
                id="streetAddress"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.streetAddress}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* City */}
            <div>
              <label htmlFor="city" className="block mb-2">
                City / Town *
              </label>
              <input
                type="text"
                id="city"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Province/State */}
            <div>
              <label htmlFor="province" className="block mb-2">
                Province / State *
              </label>
              <input
                type="text"
                id="province"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.province}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Postal Code */}
            <div>
              <label htmlFor="postalCode" className="block mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                id="postalCode"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Country */}
            <div>
              <label htmlFor="country" className="block mb-2">
                Country *
              </label>
              <input
                type="text"
                id="country"
                className="w-full p-3 bg-[#e5e5e5] rounded"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {/* Terms and Conditions */}
          <div className="mt-6">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1"
              />
              <span>
                I certify that I am at least 18 years old and of lawful age, and I have read and accept the{' '}
                <Link href="/terms" className="underline">
                  terms and conditions
                </Link>
                .
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a2b3b] text-white py-3 rounded font-medium hover:bg-[#2c3e50] disabled:opacity-50"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-[#c8a750] mt-auto py-4 text-center">
        <p>© 2025 BGH. All rights reserved.</p>
      </div>
    </div>
  );
}
