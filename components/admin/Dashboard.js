import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({
    status: 'ALL',
    type: 'ALL',
    date: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState({
    decision: '',
    comment: '',
    discount: 0
  });

  useEffect(() => {
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchRequests();
  }, [session, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/requests?status=${filters.status}&type=${filters.type}&date=${filters.date}`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      showNotification('Error fetching requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleApproveRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          adminId: session.user.id
        }),
      });

      if (response.ok) {
        showNotification('Request approved successfully', 'success');
        setShowApprovalModal(false);
        fetchRequests();
      } else {
        throw new Error('Failed to approve request');
      }
    } catch (error) {
      showNotification('Error approving request', 'error');
    }
  };

  const handleRejectRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          adminId: session.user.id
        }),
      });

      if (response.ok) {
        showNotification('Request rejected successfully', 'success');
        setShowApprovalModal(false);
        fetchRequests();
      } else {
        throw new Error('Failed to reject request');
      }
    } catch (error) {
      showNotification('Error rejecting request', 'error');
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      const response = await fetch(`/api/admin/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          adminId: session.user.id
        }),
      });

      if (response.ok) {
        showNotification('Status updated successfully', 'success');
        fetchRequests();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      showNotification('Error updating status', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="ALL">All</option>
            <option value="DISCOUNT">Discount</option>
            <option value="ESCALATION">Escalation</option>
            <option value="OVERRIDE">Override</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-4">Loading...</li>
          ) : requests.length === 0 ? (
            <li className="px-4 py-4">No requests found</li>
          ) : (
            requests.map((request) => (
              <li key={request.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Request #{request.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Type: {request.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {request.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      Requested by: {request.requestedBy.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {format(new Date(request.createdAt), 'MMM d, yyyy HH:mm')}
                    </p>
                    {request.details && (
                      <p className="text-sm text-gray-500">
                        Details: {JSON.stringify(request.details)}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setFormData({
                              decision: 'APPROVE',
                              comment: '',
                              discount: 0
                            });
                            setShowApprovalModal(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setFormData({
                              decision: 'REJECT',
                              comment: '',
                              discount: 0
                            });
                            setShowApprovalModal(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <select
                      value={request.status}
                      onChange={(e) => handleUpdateStatus(request.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_INVESTIGATION">Under Investigation</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">
              {formData.decision === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
            </h2>
            <form onSubmit={formData.decision === 'APPROVE' ? handleApproveRequest : handleRejectRequest}>
              <div className="grid grid-cols-1 gap-4 mb-4">
                {formData.decision === 'APPROVE' && selectedRequest?.type === 'DISCOUNT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      min={0}
                      max={100}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comment</label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md ${
                    formData.decision === 'APPROVE'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {formData.decision === 'APPROVE' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 