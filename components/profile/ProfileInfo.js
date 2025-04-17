import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '../../contexts/NotificationContext';

const ProfileInfo = () => {
  const { data: session, update } = useSession();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        phone: session.user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPreviewUrl(session.user.image || '');
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      
      if (profilePhoto) {
        formData.append('photo', profilePhoto);
      }

      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        formData.append('currentPassword', profileData.currentPassword);
        formData.append('newPassword', profileData.newPassword);
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      await update(updatedUser);
      
      showNotification('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4">
            <img
              src={previewUrl || '/default-avatar.png'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-amber-500 text-white p-2 rounded-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {isEditing && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={profileData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={profileData.newPassword}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={profileData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileInfo; 