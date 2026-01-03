import { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8080/api/orders/my-orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Sort by date, newest first
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load trip history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ARRIVED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'IN_TRANSIT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('✅ Order cancelled successfully!');
      
      // Refresh orders list
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const InvoiceModal = () => {
    if (!selectedOrder) return null;

    const baseFare = selectedOrder.vehicleType?.baseFare || 0;
    const pricePerKm = selectedOrder.vehicleType?.pricePerKm || 0;
    const distance = selectedOrder.distance || 0;
    const distanceCharge = distance * pricePerKm;
    const total = selectedOrder.totalPrice || selectedOrder.estimatedPrice || (baseFare + distanceCharge);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden">
            <h2 className="text-2xl font-bold text-gray-800">Trip Invoice</h2>
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Invoice Content */}
          <div className="p-8" id="invoice-content">
            {/* Company Header */}
            <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">QuickRide</h1>
              <p className="text-gray-600 mt-1">Your Trusted Ride Partner</p>
              <p className="text-sm text-gray-500 mt-2">Colombo, Sri Lanka | +94 123 456 789</p>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">INVOICE TO</h3>
                <p className="font-semibold text-gray-800">
                  {selectedOrder.customer?.name || selectedOrder.customer?.fullName || 'Customer'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.customer?.email || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.customer?.phone || selectedOrder.customer?.phoneNumber || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">INVOICE DETAILS</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Invoice #:</span> ORD-{selectedOrder.id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Date:</span> {formatDate(selectedOrder.createdAt)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Trip Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">📍</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold">PICKUP LOCATION</p>
                    <p className="text-sm text-gray-800">{selectedOrder.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-red-600 font-bold mr-3">📌</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold">DROP-OFF LOCATION</p>
                    <p className="text-sm text-gray-800">{selectedOrder.dropoffLocation}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-blue-200">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">DISTANCE</p>
                    <p className="text-sm font-bold text-gray-800">{distance} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">VEHICLE</p>
                    <p className="text-sm font-bold text-gray-800">{selectedOrder.vehicleType?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">DRIVER</p>
                    <p className="text-sm font-bold text-gray-800">
                      {selectedOrder.driver?.user?.name || selectedOrder.driver?.user?.fullName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Details (if available) */}
            {selectedOrder.driver && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">DRIVER INFORMATION</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Driver Name:</p>
                    <p className="font-semibold text-gray-800">
                      {selectedOrder.driver.user?.name || selectedOrder.driver.user?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Vehicle No:</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.driver.vehiclePlateNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Contact:</p>
                    <p className="font-semibold text-gray-800">
                      {selectedOrder.driver.user?.phone || selectedOrder.driver.user?.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">License:</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.driver.licenseNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="border-t-2 border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Base Fare</span>
                  <span className="font-semibold">Rs. {baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Distance Charge ({distance} km × Rs.{pricePerKm}/km)</span>
                  <span className="font-semibold">Rs. {distanceCharge.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-green-600">Rs. {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-bold text-lg">Paid via Wallet</span>
              </div>
              <p className="text-center text-sm text-green-700 mt-1">Payment processed successfully</p>
            </div>

            {/* Footer */}
            <div className="text-center border-t-2 border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-2">Thank you for riding with QuickRide!</p>
              <p className="text-xs text-gray-500">
                For any queries, contact us at support@quickride.lk or call +94 123 456 789
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-4 p-6 border-t border-gray-200 print:hidden">
            <button
              onClick={handlePrintInvoice}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              🖨️ Print Invoice
            </button>
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 font-semibold">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center">
          <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          My Trip History
        </h1>
        <p className="text-blue-100 mt-2">View all your past and current rides</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Trips</p>
              <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚗</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {orders.filter(o => o.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Spent</p>
              <p className="text-3xl font-bold text-purple-600">
                Rs. {orders.reduce((sum, o) => sum + (o.totalPrice || o.estimatedPrice || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Pickup Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Drop Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 text-lg font-semibold">No trips yet</p>
                      <p className="text-gray-400 text-sm mt-1">Book your first ride to see it here!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={order.pickupLocation}>
                        📍 {order.pickupLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={order.dropoffLocation}>
                        📌 {order.dropoffLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.driver?.user?.fullName || 'Not Assigned'}
                      </div>
                      {order.driver?.vehiclePlateNumber && (
                        <div className="text-xs text-gray-500">
                          {order.driver.vehiclePlateNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.vehicleType?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        Rs. {(order.totalPrice || order.estimatedPrice || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewInvoice(order)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          📄 View Invoice
                        </button>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            🚫 Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && <InvoiceModal />}
    </div>
  );
};

export default CustomerHistory;
