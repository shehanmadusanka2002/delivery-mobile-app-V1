import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import MapComponent from '../components/MapComponent';
import BookingForm from '../components/BookingForm';
import OrderList from '../components/OrderList';
import axios from 'axios';

const Dashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const navigate = useNavigate();

  const fetchNearbyDrivers = useCallback(async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/drivers/nearby',
        {
          params: {
            lat: 6.9271,
            lng: 79.8612,
          },
        }
      );
      setDrivers(response.data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to fetch nearby drivers');
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8080/api/wallet/balance',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBalance(response.data);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError('Failed to fetch wallet balance');
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    // Check for JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch initial nearby drivers
    fetchNearbyDrivers();
    
    // Fetch wallet balance
    fetchBalance();

    // Setup WebSocket connection
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // expose client via ref so other functions (simulate) can use it
    stompClientRef.current = client;

    client.onConnect = () => {
      console.log('Connected to WebSocket');
      setConnected(true);

      // Subscribe to driver tracking (for now, tracking driver ID 1)
      client.subscribe('/topic/tracking/1', (message) => {
        const locationUpdate = JSON.parse(message.body);
        console.log('Received location update:', locationUpdate);

        // Update driver location in state
        setDrivers((prevDrivers) => {
          return prevDrivers.map((driver) => {
            if (driver.id === locationUpdate.driverId) {
              return {
                ...driver,
                currentLatitude: locationUpdate.latitude,
                currentLongitude: locationUpdate.longitude,
              };
            }
            return driver;
          });
        });
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setError('WebSocket connection error');
      setConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log('WebSocket closed');
      setConnected(false);
    };

    client.activate();

    // Cleanup on unmount
    return () => {
      if (client.active) {
        client.deactivate();
      }
      stompClientRef.current = null;
    };
  }, [navigate, fetchNearbyDrivers, fetchBalance]);

  // ref to hold STOMP client for publishing from other functions
  const stompClientRef = useRef(null);

  // Handle wallet top-up
  const handleTopUp = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/wallet/top-up',
        null,
        {
          params: { amount: 1000 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh balance after top-up
      fetchBalance();
      alert('Top-up successful! Added 1000 LKR to your wallet.');
    } catch (err) {
      console.error('Error topping up wallet:', err);
      setError('Failed to top up wallet');
    }
  };

  // Simulate driver movement by publishing a message to /app/driver-location
  const simulateDriverMovement = () => {
    const client = stompClientRef.current;
    if (!client || !client.connected) {
      setError('WebSocket not connected');
      return;
    }

    const baseLat = 6.9271;
    const baseLng = 79.8612;
    // small random offset ~ +/- 0.005
    const lat = baseLat + (Math.random() - 0.5) * 0.01;
    const lng = baseLng + (Math.random() - 0.5) * 0.01;

    const payload = {
      driverId: 1,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    };

    try {
      // publish using stomp client API
      client.publish({ destination: '/app/driver-location', body: JSON.stringify(payload) });
      // optimistic update for immediate UI feedback
      setDrivers((prev) => prev.map((d) => (d.id === 1 ? { ...d, currentLatitude: payload.latitude, currentLongitude: payload.longitude } : d)));
    } catch (e) {
      console.error('Publish error', e);
      setError('Failed to publish simulated location');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Delivery Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></span>
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={simulateDriverMovement}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              title="Simulate driver movement"
            >
              Move Driver 🚗
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Wallet Balance Card */}
        <div className="mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium opacity-90">Wallet Balance</h3>
              <p className="text-4xl font-bold mt-2">
                {loadingBalance ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `LKR ${balance.toFixed(2)}`
                )}
              </p>
            </div>
            <button
              onClick={handleTopUp}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md"
            >
              💰 Top Up
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Drivers</h3>
            <p className="text-3xl font-bold text-gray-900">{drivers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Available Drivers</h3>
            <p className="text-3xl font-bold text-green-600">
              {drivers.filter((d) => d.isAvailable).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Connection Status</h3>
            <p className="text-3xl font-bold text-blue-600">
              {connected ? 'Live' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Booking Form and Order List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BookingForm />
          <OrderList />
        </div>

        {/* Map */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Real-Time Driver Tracking
          </h2>
          <MapComponent drivers={drivers} />
        </div>

        {/* Driver List */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Available Drivers
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {driver.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.vehiclePlateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          driver.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {driver.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.currentLatitude && driver.currentLongitude
                        ? `${driver.currentLatitude.toFixed(4)}, ${driver.currentLongitude.toFixed(4)}`
                        : 'No location'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
