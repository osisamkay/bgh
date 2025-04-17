import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const AdminControls = () => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleSave = async (updatedUser) => {
    try {
      const response = await fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      showNotification('User updated successfully', 'success');
      setUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleLock = async (userId, locked) => {
    try {
      const response = await fetch(`/api/users/${userId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user lock status');
      }

      showNotification(
        `User ${locked ? 'locked' : 'unlocked'} successfully`,
        'success'
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, locked } : user
        )
      );
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleVerify = async (userId, verified) => {
    try {
      const response = await fetch(`/api/users/${userId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user verification status');
      }

      showNotification(
        `User ${verified ? 'verified' : 'unverified'} successfully`,
        'success'
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, verified } : user
        )
      );
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSave(selectedUser);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, name: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={selectedUser.phone}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, phone: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.locked}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, locked: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Lock Account
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.verified}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, verified: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Verified
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedUser(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.phone}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.locked
                        ? 'bg-red-100 text-red-800'
                        : user.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.locked
                      ? 'Locked'
                      : user.verified
                      ? 'Verified'
                      : 'Unverified'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-amber-500 hover:text-amber-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleLock(user.id, !user.locked)}
                      className={`${
                        user.locked
                          ? 'text-green-500 hover:text-green-600'
                          : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      {user.locked ? 'Unlock' : 'Lock'}
                    </button>
                    <button
                      onClick={() => handleVerify(user.id, !user.verified)}
                      className={`${
                        user.verified
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-green-500 hover:text-green-600'
                      }`}
                    >
                      {user.verified ? 'Unverify' : 'Verify'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminControls; 