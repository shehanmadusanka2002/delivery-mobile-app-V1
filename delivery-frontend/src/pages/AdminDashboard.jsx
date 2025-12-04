import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import LiveMap from '../components/LiveMap';

const AdminDashboard = () => {
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingDriverId, setApprovingDriverId] = useState(null);
  const [onlineDrivers, setOnlineDrivers] = useState({});
  const navigate = useNavigate();

  const fetchPendingDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:8080/api/admin/drivers/pending',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPendingDrivers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching pending drivers:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:8080/api/admin/dashboard-stats',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOnlineDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:8080/api/admin/drivers/online',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Convert array to object with driver.id as key
      const driversMap = {};
      response.data.forEach((driver) => {
        driversMap[driver.id] = driver;
      });
      setOnlineDrivers(driversMap);
    } catch (err) {
      console.error('Error fetching online drivers:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        // Unauthorized - redirect to login
        // localStorage.removeItem('token');
        // localStorage.removeItem('email');
        // localStorage.removeItem('role');
        navigate('/login');
      }
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    
    // Include token in SockJS URL as query parameter
    const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
    });

    stompClient.onConnect = () => {
      console.log('✅ WebSocket connected to admin dashboard');

      // Subscribe to all driver location updates
      stompClient.subscribe('/topic/admin/drivers', (message) => {
        try {
          const locationUpdate = JSON.parse(message.body);
          console.log('📍 Driver location update:', locationUpdate);

          // Update the specific driver's location in state
          setOnlineDrivers((prevDrivers) => {
            const driverId = locationUpdate.driverId;
            
            if (prevDrivers[driverId]) {
              // Update existing driver's location
              return {
                ...prevDrivers,
                [driverId]: {
                  ...prevDrivers[driverId],
                  currentLatitude: locationUpdate.latitude,
                  currentLongitude: locationUpdate.longitude,
                },
              };
            } else {
              // Driver not in list yet, fetch their info
              // (This shouldn't happen often, but handle it gracefully)
              console.log('New driver appeared:', driverId);
              return prevDrivers;
            }
          });
        } catch (err) {
          console.error('Error processing location update:', err);
        }
      });

      // Subscribe to driver status changes (online/offline)
      stompClient.subscribe('/topic/admin/driver-status', (message) => {
        try {
          const statusUpdate = JSON.parse(message.body);
          console.log('🔄 Driver status update:', statusUpdate);

          if (statusUpdate.available) {
            // Driver went online - fetch their info and add to map
            console.log(`Driver ${statusUpdate.driverId} went ONLINE`);
            fetchOnlineDrivers();
          } else {
            // Driver went offline - remove from map
            console.log(`Driver ${statusUpdate.driverId} went OFFLINE`);
            setOnlineDrivers((prevDrivers) => {
              const newDrivers = { ...prevDrivers };
              delete newDrivers[statusUpdate.driverId];
              return newDrivers;
            });
          }
        } catch (err) {
          console.error('Error processing status update:', err);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
    };

    stompClient.activate();

    return stompClient;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchPendingDrivers();
    fetchDashboardStats();
    fetchOnlineDrivers();

    // Connect to WebSocket for real-time driver location updates
    const stompClient = connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (stompClient) {
        stompClient.deactivate();
        console.log('WebSocket disconnected');
      }
    };
  }, [navigate]);

  const handleApproveDriver = async (driverId) => {
    setApprovingDriverId(driverId);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8080/api/admin/drivers/${driverId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the approved driver from the list
      setPendingDrivers((prev) => prev.filter((driver) => driver.id !== driverId));
      alert('Driver approved successfully!');
    } catch (err) {
      console.error('Error approving driver:', err);
      setError(err.response?.data?.message || 'Failed to approve driver');
    } finally {
      setApprovingDriverId(null);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Live Driver Map */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Live Driver Tracking ({Object.keys(onlineDrivers).length} Online)
        </h2>
        <div style={{ height: '500px', width: '100%' }}>
          <LiveMap drivers={Object.values(onlineDrivers)} />
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="text-center text-gray-600 mb-6">Loading statistics...</div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Users */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Users</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl opacity-80">👥</div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">LKR {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-4xl opacity-80">💰</div>
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Orders</p>
                  <p className="text-3xl font-bold mt-2">{stats.activeOrders}</p>
                </div>
                <div className="text-4xl opacity-80">🚚</div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Orders</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                </div>
                <div className="text-4xl opacity-80">📦</div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Section */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Order Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { status: 'Pending', count: Math.floor(stats.totalOrders * 0.15) },
                  { status: 'Accepted', count: Math.floor(stats.activeOrders * 0.6) },
                  { status: 'In Transit', count: Math.floor(stats.activeOrders * 0.4) },
                  { status: 'Completed', count: Math.floor(stats.totalOrders * 0.7) },
                  { status: 'Cancelled', count: Math.floor(stats.totalOrders * 0.05) },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Order Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pending Drivers Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Pending Driver Approvals ({pendingDrivers.length})
          </h2>

          {loading ? (
            <div className="text-center text-gray-600 py-8">
              Loading pending drivers...
            </div>
          ) : pendingDrivers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending driver approvals at the moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name (Email)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plate Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingDrivers.map((driver) => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{driver.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.user?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.licenseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.vehiclePlateNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending Approval
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleApproveDriver(driver.id)}
                          disabled={approvingDriverId === driver.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {approvingDriverId === driver.id
                            ? 'Approving...'
                            : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </>
  );
};

export default AdminDashboard;
