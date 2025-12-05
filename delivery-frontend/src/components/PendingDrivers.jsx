import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export default function PendingDrivers() {
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: '', title: '' });

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const fetchPendingDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/admin/drivers/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setPendingDrivers(response.data);
    } catch (err) {
      console.error('Error fetching pending drivers:', err);
      setError('Failed to load pending drivers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_BASE_URL}/admin/drivers/${driverId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Remove the approved driver from the list
      setPendingDrivers(prevDrivers => 
        prevDrivers.filter(driver => driver.id !== driverId)
      );

      alert('Driver Approved Successfully!');
      setIsModalOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      console.error('Error approving driver:', err);
      alert('Failed to approve driver. Please try again.');
    }
  };

  const handleReject = async (driverId) => {
    if (!window.confirm('Are you sure you want to reject this driver? This will permanently delete their account.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_BASE_URL}/admin/drivers/${driverId}/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Remove the rejected driver from the list
      setPendingDrivers(prevDrivers => 
        prevDrivers.filter(driver => driver.id !== driverId)
      );

      alert('Driver Rejected and Removed Successfully!');
      setIsModalOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      console.error('Error rejecting driver:', err);
      alert('Failed to reject driver. Please try again.');
    }
  };

  const openImageModal = (imageUrl, title) => {
    setImageModal({ isOpen: true, imageUrl, title });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageUrl: '', title: '' });
  };

  const openDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const closeDriverDetails = () => {
    setSelectedDriver(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pending Driver Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve driver registration requests</p>
      </div>

      {pendingDrivers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No pending approvals</h3>
          <p className="text-gray-500">All driver registrations have been processed</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{driver.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{driver.vehiclePlateNumber}</div>
                      <div className="text-xs text-gray-500">{driver.vehicleType}</div>
                      <div className="text-xs text-gray-500">Lic: {driver.licenseNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{driver.bankName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">Acc: {driver.accountNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {driver.profilePhotoUrl && (
                          <img
                            src={`http://localhost:8080/uploads/${driver.profilePhotoUrl}`}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => openImageModal(`http://localhost:8080/uploads/${driver.profilePhotoUrl}`, 'Profile Photo')}
                            onError={(e) => {
                              console.error('Failed to load profile image:', driver.profilePhotoUrl);
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        {driver.licensePhotoUrl && (
                          <img
                            src={`http://localhost:8080/uploads/${driver.licensePhotoUrl}`}
                            alt="License"
                            className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => openImageModal(`http://localhost:8080/uploads/${driver.licensePhotoUrl}`, 'License Photo')}
                            onError={(e) => {
                              console.error('Failed to load license image:', driver.licensePhotoUrl);
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openDriverDetails(driver)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleApprove(driver.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(driver.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingDrivers.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {pendingDrivers.length} pending {pendingDrivers.length === 1 ? 'driver' : 'drivers'}
        </div>
      )}

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-screen" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-white text-lg font-semibold mb-2">{imageModal.title}</h3>
            <img
              src={imageModal.imageUrl}
              alt={imageModal.title}
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {isModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={closeDriverDetails}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Driver Details</h2>
              <button
                onClick={closeDriverDetails}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900 font-medium">{selectedDriver.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedDriver.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                    <p className="text-gray-900">{selectedDriver.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vehicle Type</label>
                    <p className="text-gray-900">{selectedDriver.vehicleType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plate Number</label>
                    <p className="text-gray-900">{selectedDriver.vehiclePlateNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Number</label>
                    <p className="text-gray-900">{selectedDriver.licenseNumber}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bank Name</label>
                    <p className="text-gray-900">{selectedDriver.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Branch Name</label>
                    <p className="text-gray-900">{selectedDriver.branchName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Number</label>
                    <p className="text-gray-900">{selectedDriver.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Holder Name</label>
                    <p className="text-gray-900">{selectedDriver.accountHolderName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Documents</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Profile Photo</label>
                    {selectedDriver.profilePhotoUrl ? (
                      <div className="relative group">
                        <img
                          src={`http://localhost:8080/uploads/${selectedDriver.profilePhotoUrl}`}
                          alt="Profile"
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            console.error('Failed to load profile image:', selectedDriver.profilePhotoUrl);
                            e.target.parentElement.innerHTML = '<div class="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">Failed to load image</div>';
                          }}
                        />
                        <button
                          onClick={() => openImageModal(`http://localhost:8080/uploads/${selectedDriver.profilePhotoUrl}`, 'Profile Photo')}
                          className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                        >
                          View Full Size
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        No image uploaded
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">License Photo</label>
                    {selectedDriver.licensePhotoUrl ? (
                      <div className="relative group">
                        <img
                          src={`http://localhost:8080/uploads/${selectedDriver.licensePhotoUrl}`}
                          alt="License"
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            console.error('Failed to load license image:', selectedDriver.licensePhotoUrl);
                            e.target.parentElement.innerHTML = '<div class="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">Failed to load image</div>';
                          }}
                        />
                        <button
                          onClick={() => openImageModal(`http://localhost:8080/uploads/${selectedDriver.licensePhotoUrl}`, 'License Photo')}
                          className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                        >
                          View Full Size
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        No image uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-4 border-t">
                <button
                  onClick={closeDriverDetails}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleReject(selectedDriver.id)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  Reject Driver
                </button>
                <button
                  onClick={() => handleApprove(selectedDriver.id)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  Approve Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
