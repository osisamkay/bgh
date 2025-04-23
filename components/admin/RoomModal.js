import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useQueryClient } from 'react-query';

const RoomModal = ({ isOpen, onClose, room = null }) => {
  const { addNotification } = useNotification();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'STANDARD',
    price: '',
    status: 'AVAILABLE',
    description: '',
    capacity: 2,
    amenities: [],
    image: '', // Changed to string for main image
    images: [] // Array for additional images
  });
  
  // State for new image URL input
  const [newImageUrl, setNewImageUrl] = useState('');

  // Room type options
  const roomTypes = [
    { value: 'STANDARD', label: 'Standard' },
    { value: 'DELUXE', label: 'Deluxe' },
    { value: 'SUITE', label: 'Suite' },
    { value: 'EXECUTIVE', label: 'Executive' },
    { value: 'PRESIDENTIAL', label: 'Presidential' }
  ];

  // Room status options
  const roomStatuses = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'OCCUPIED', label: 'Occupied' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'UNAVAILABLE', label: 'Unavailable' }
  ];

  // Common amenities
  const amenityOptions = [
    'Queen Bed',
    'King Bed',
    'Twin Beds',
    'Work Desk',
    'Free WiFi',
    'TV',
    'Air Conditioning',
    'Mini Bar',
    'Room Service',
    'Safe',
    'Balcony',
    'Ocean View',
    'Mountain View',
    'Jacuzzi',
    'Kitchenette',
    'Sofa Bed',
    'Coffee Maker',
    'Refrigerator'
  ];

  // Load room data if editing
  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        type: room.type || 'STANDARD',
        price: room.price ? String(room.price) : '',
        status: room.status || 'AVAILABLE',
        description: room.description || '',
        capacity: room.capacity || 2,
        amenities: room.amenities || [],
        image: room.image || '', // Single string for main image
        images: room.images || []  // Array for additional images
      });
    } else {
      // Reset form for new room
      setFormData({
        roomNumber: '',
        type: 'STANDARD',
        price: '',
        status: 'AVAILABLE',
        description: '',
        capacity: 2,
        amenities: [],
        image: '',  // Empty string for main image
        images: []  // Empty array for additional images
      });
    }
  }, [room, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (checked) {
        // Directly add to array without any string conversion
        setFormData(prev => ({
          ...prev,
          amenities: [...prev.amenities, value]
        }));
      } else {
        // Filter out the unchecked item
        setFormData(prev => ({
          ...prev,
          amenities: prev.amenities.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    if (!isNaN(value) || value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Prepare data for API
      // Make sure amenities are stored directly as an array, not stringified
      // Also ensure imageUrls are included in the request
      const roomData = {
        ...formData,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        // Ensure amenities are kept as an array
        amenities: formData.amenities,
        // Include the images with both keys
        image: formData.image,
        images: formData.images
      };

      console.log('Submitting room data:', roomData);

      const url = room
        ? `/api/admin/rooms/${room.id}`
        : '/api/admin/rooms';

      const method = room ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roomData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save room');
      }

      // Invalidate and refetch
      queryClient.invalidateQueries('rooms');

      addNotification(
        room ? 'Room updated successfully' : 'Room created successfully',
        'success'
      );

      onClose();
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Room Number</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                placeholder="101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Room Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              >
                {roomTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price Per Night</label>
              <div className="mt-1 relative rounded-md p-2 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleNumberChange}
                  required
                  className="pl-7 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                  placeholder="99.99"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              >
                {roomStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                name="capacity"
                min="1"
                max="10"
                value={formData.capacity}
                onChange={handleNumberChange}
                required
                className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Room Image</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              placeholder="https://example.com/main-room-image.jpg"
            />
            {formData.image && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Main room image" 
                  className="h-32 w-auto object-cover rounded-md" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/room-placeholder.jpg';
                    e.target.classList.add('border', 'border-red-300');
                  }}
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Room Images</label>
            <div className="flex items-center">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-grow rounded-l-md border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                placeholder="https://example.com/additional-image.jpg"
              />
              <button
                type="button"
                onClick={() => {
                  if (newImageUrl.trim()) {
                    setFormData(prev => ({
                      ...prev,
                      images: [...prev.images, newImageUrl.trim()]
                    }));
                    setNewImageUrl('');
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Add
              </button>
            </div>
            
            {formData.images.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-2">
                  {formData.images.length} additional {formData.images.length === 1 ? 'image' : 'images'} added
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Room image ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-md border border-gray-200" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/room-placeholder.jpg';
                          e.target.classList.add('border', 'border-red-300');
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                          className="p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              placeholder="Describe the room features and benefits..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenityOptions.map(amenity => (
                <div key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    name="amenities"
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`amenity-${amenity}`} className="ml-2 block text-sm text-gray-700">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md p-2 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md p-2 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (room ? 'Updating...' : 'Creating...') : (room ? 'Update Room' : 'Create Room')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;