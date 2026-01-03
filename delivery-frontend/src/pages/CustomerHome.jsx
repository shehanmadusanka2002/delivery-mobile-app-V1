import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import { API_URL, WS_URL } from '../config/api.config';

// Fix for default marker icon issue in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Create custom vehicle icons
const carIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDAwMDAwIj48cGF0aCBkPSJNMTguOTIgNi4wMUMxOC43MiA1LjQyIDE4LjE2IDUgMTcuNSA1aC0xMWMtLjY2IDAtMS4yMS40Mi0xLjQyIDEuMDFMMyAxMnY4YzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi0xaDEydi0xYzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi04bC0yLjA4LTUuOTl6TTYuNSAxNmMtLjgzIDAtMS41LS42Ny0xLjUtMS41UzUuNjcgMTMgNi41IDEzczEuNS42NyAxLjUgMS41UzcuMzMgMTYgNi41IDE2em0xMSAwYy0uODMgMC0xLjUtLjY3LTEuNS0xLjVzLjY3LTEuNSAxLjUtMS41IDEuNS42NyAxLjUgMS41LS42NyAxLjUtMS41IDEuNXpNNSAxMWwxLjUtNC41aDExTDE5IDExSDV6Ii8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const bikeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDAwMDAwIj48cGF0aCBkPSJNMTUuNSA1LjVjMS4xIDAgMi0uOSAyLTJzLS45LTItMi0yLTIgLjktMiAyIC45IDIgMiAyek01IDEwLjVjLTIuOCAwLTUgMi4yLTUgNXMyLjIgNSA1IDUgNS0yLjIgNS01LTIuMi01LTUtNXptMCA4LjVjLTEuOSAwLTMuNS0xLjYtMy41LTMuNXMxLjYtMy41IDMuNS0zLjUgMy41IDEuNiAzLjUgMy41LTEuNiAzLjUtMy41IDMuNXptMTAuOC0xMC41Yy0uNC0uNC0xLS40LTEuNCAwbC0yLjEgMi4xLTEuNS0xLjUtLjgtLjhjLS40LS40LTEtLjQtMS40IDBzLS40IDEgMCAxLjRsLjguOCAxLjUgMS41LTIuMSAyLjFjLS40LjQtLjQgMSAwIDEuNHMxIC40IDEuNCAwbDIuMS0yLjEgMS41IDEuNS44LjhjLjQuNCAxIC40IDEuNCAwcy40LTEgMC0xLjRsLS44LS44LTEuNS0xLjUgMi4xLTIuMWMuNC0uNC40LTEgMC0xLjR6TTE5IDEwLjVjLTIuOCAwLTUgMi4yLTUgNXMyLjIgNSA1IDUgNS0yLjIgNS01LTIuMi01LTUtNXptMCA4LjVjLTEuOSAwLTMuNS0xLjYtMy41LTMuNXMxLjYtMy41IDMuNS0zLjUgMy41IDEuNiAzLjUgMy41LTEuNiAzLjUtMy41IDMuNXoiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const tukTukIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDAwMDAwIj48cGF0aCBkPSJNMTcgNWgtMlYzSDl2Mkg3Yy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDIgMiAyaDEwYzEuMSAwIDItLjkgMi0yVjdjMC0xLjEtLjktMi0yLTJ6bS02IDE0Yy0xLjEgMC0yLS45LTItMnMyLS45IDItMiAyIC45IDIgMi0uOSAyLTIgMnptNiAwYy0xLjEgMC0yLS45LTItMnMyLS45IDItMiAyIC45IDIgMi0uOSAyLTIgMnpNNyA3aDEwdjZIN3Y2aC0yVjdjMC0xLjEuOS0yIDItMnptMCAwaDF2Nmg4VjdIOXYtMmg2djJoMWMxLjEgMCAyIC45IDIgMnY2SDd6Ii8+PHBhdGggZD0iTTEyIDEwYy44MyAwIDEuNS0uNjcgMS41LTEuNVMxMi44MyA3IDEyIDcgMTAuNSA3LjY3IDEwLjUgOC41IDExLjE3IDEwIDEyIDEweiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const getVehicleIconForMap = (vehicleType) => {
  if (!vehicleType) return carIcon;
  const type = vehicleType.toLowerCase();
  if (type.includes('tuk')) return tukTukIcon;
  if (type.includes('bike') || type.includes('motorcycle')) return bikeIcon;
  if (type.includes('car')) return carIcon;
  return carIcon;
};

const CustomerHome = () => {
  const colomboPosition = [6.9271, 79.8612];
  const stompClientRef = useRef(null);

  // State
  const [drivers, setDrivers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Active order state
  const [activeOrder, setActiveOrder] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // User location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(true);

  // Get user's current location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setUserLocation({ lat: colomboPosition[0], lng: colomboPosition[1] });
      setGettingLocation(false);
      return;
    }

    setGettingLocation(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGettingLocation(false);
        setLocationError('');
        console.log('✅ User location:', position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('❌ Error getting location:', error);
        let errorMessage = 'Unable to get your precise location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Request timed out. Using approximate location.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        
        setLocationError(errorMessage);
        // Use default Colombo location as fallback
        setUserLocation({ lat: colomboPosition[0], lng: colomboPosition[1] });
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true, // Enable GPS for accurate location
        timeout: 15000, // 15 seconds timeout
        maximumAge: 0, // Don't use cached location
      }
    );
  };

  // Calculate actual road distance using OSRM API
  const calculateRoadDistance = async (lat1, lon1, lat2, lon2) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
      );
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const distanceInMeters = data.routes[0].distance;
        const distanceInKm = distanceInMeters / 1000;
        return distanceInKm;
      }
      
      // Fallback to Haversine with realistic multiplier if OSRM fails
      const straightLineDistance = calculateDistance(lat1, lon1, lat2, lon2);
      return straightLineDistance * 1.3; // Add 30% for roads
    } catch (error) {
      console.error('OSRM error, using fallback:', error);
      // Fallback to Haversine with realistic multiplier
      const straightLineDistance = calculateDistance(lat1, lon1, lat2, lon2);
      return straightLineDistance * 1.3; // Add 30% for roads
    }
  };

  // Calculate distance between two coordinates using Haversine formula (straight line)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Geocode location name to coordinates (simplified - using Nominatim)
  const geocodeLocation = async (locationName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName + ', Sri Lanka')}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Check for active order on mount
  useEffect(() => {
    checkActiveOrder();
  }, []);

  // Fetch available drivers only when no active order
  useEffect(() => {
    if (!activeOrder) {
      fetchAvailableDrivers();
      
      // Set up interval to fetch drivers every 5 seconds
      const interval = setInterval(() => {
        fetchAvailableDrivers();
      }, 5000);
      
      return () => clearInterval(interval);
    } else {
      // Clear drivers when there's an active order
      setDrivers([]);
    }
  }, [activeOrder]);

  // Fetch vehicle types
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  // Setup WebSocket connection when there's an active order
  useEffect(() => {
    if (activeOrder && activeOrder.driver?.id) {
      setupWebSocket(activeOrder.driver.id);
    }
    
    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
    };
  }, [activeOrder]);

  // Calculate estimated cost when vehicle type or distance changes
  useEffect(() => {
    if (selectedVehicleType && distance) {
      const baseFare = parseFloat(selectedVehicleType.baseFare) || 0;
      const pricePerKm = parseFloat(selectedVehicleType.pricePerKm) || 0;
      const dist = parseFloat(distance) || 0;
      const cost = baseFare + (dist * pricePerKm);
      console.log('💰 Calculating price:', { baseFare, pricePerKm, dist, cost });
      setEstimatedCost(cost);
    } else {
      console.log('⏭️ Skipping price calculation:', { hasVehicle: !!selectedVehicleType, distance });
      setEstimatedCost(0);
    }
  }, [selectedVehicleType, distance]);

  // Auto-calculate distance when both pickup and drop locations are entered
  useEffect(() => {
    const calculateDistanceAutomatically = async () => {
      if (pickupLocation.trim() && dropLocation.trim()) {
        setLoading(true);
        setError('');
        try {
          const pickupCoords = await geocodeLocation(pickupLocation);
          const dropCoords = await geocodeLocation(dropLocation);
          
          if (pickupCoords && dropCoords) {
            // Use OSRM API for actual road distance
            const roadDistance = await calculateRoadDistance(
              pickupCoords.lat,
              pickupCoords.lng,
              dropCoords.lat,
              dropCoords.lng
            );
            setDistance(roadDistance.toFixed(2));
          } else {
            setError('Could not find one or both locations. Please check the spelling.');
          }
        } catch (err) {
          console.error('Error calculating distance:', err);
          setError('Failed to calculate distance. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        setDistance('');
      }
    };

    // Debounce the calculation to avoid too many API calls
    const timeoutId = setTimeout(() => {
      calculateDistanceAutomatically();
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [pickupLocation, dropLocation]);

  const checkActiveOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Find active order (PENDING, ACCEPTED, IN_TRANSIT, ARRIVED)
      const active = response.data.find(
        order => ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'ARRIVED'].includes(order.status)
      );
      
      if (active) {
        setActiveOrder(active);
      }
    } catch (err) {
      console.error('Error checking active order:', err);
    }
  };

  const setupWebSocket = (driverId) => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClientRef.current = client;

    client.onConnect = () => {
      console.log('Connected to WebSocket for driver tracking');
      setWsConnected(true);

      // Subscribe to driver's location updates
      client.subscribe(`/topic/tracking/${driverId}`, (message) => {
        const locationUpdate = JSON.parse(message.body);
        console.log('Driver location update:', locationUpdate);

        // Update driver location in active order
        setActiveOrder((prevOrder) => {
          if (prevOrder && prevOrder.driver) {
            return {
              ...prevOrder,
              driver: {
                ...prevOrder.driver,
                currentLatitude: locationUpdate.latitude,
                currentLongitude: locationUpdate.longitude,
              },
            };
          }
          return prevOrder;
        });
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setWsConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log('WebSocket closed');
      setWsConnected(false);
    };

    client.activate();
  };

  const setupOrderWebSocket = (orderId) => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClientRef.current = client;

    client.onConnect = () => {
      console.log(`Connected to WebSocket for order ${orderId}`);
      setWsConnected(true);

      // Subscribe to order status updates
      client.subscribe(`/topic/order/${orderId}`, (message) => {
        const orderUpdate = JSON.parse(message.body);
        console.log('Order status update:', orderUpdate);

        if (orderUpdate.status === 'ACCEPTED') {
          alert(`🚗 Driver Accepted!\n\nDriver: ${orderUpdate.driverName}\nVehicle: ${orderUpdate.vehicleType} (${orderUpdate.vehicleNumber})\n\nDriver is on the way!`);
          
          // Refresh active order to get full details
          checkActiveOrder();
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setWsConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log('WebSocket closed');
      setWsConnected(false);
    };

    client.activate();
  };

  const fetchAvailableDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/drivers/available`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDrivers(response.data);
    } catch (err) {
      console.error('Error fetching available drivers:', err);
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/vehicle-types`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✅ Vehicle types loaded:', response.data);
      setVehicleTypes(response.data);
    } catch (err) {
      console.error('❌ Error fetching vehicle types:', err);
      setError('Failed to load vehicle types');
    }
  };

  const handleBookNow = async () => {
    // Validation
    if (!pickupLocation || !dropLocation) {
      setError('Please enter pickup and drop locations');
      return;
    }
    if (!distance || parseFloat(distance) <= 0) {
      setError('Please enter a valid distance');
      return;
    }
    if (!selectedVehicleType) {
      setError('Please select a vehicle type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        pickupLocation: pickupLocation,
        dropLocation: dropLocation,
        distance: parseFloat(distance),
        vehicleTypeId: selectedVehicleType.id,
        estimatedPrice: estimatedCost,
      };

      console.log('📦 Booking order:', orderData);
      const response = await axios.post(
        `${API_URL}/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Success
      const orderId = response.data.id;
      alert(`✅ Booking Successful! Order ID: ${orderId}\nEstimated Cost: Rs. ${estimatedCost.toFixed(2)}\n\nWaiting for driver to accept...`);
      
      // Setup WebSocket to listen for order updates
      setupOrderWebSocket(orderId);
      
      // Check for active order again
      await checkActiveOrder();
      
      // Reset form
      setPickupLocation('');
      setDropLocation('');
      setDistance('');
      setSelectedVehicleType(null);
      setEstimatedCost(0);
    } catch (err) {
      console.error('Error booking ride:', err);
      setError(err.response?.data?.message || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('✅ Order cancelled successfully!');
      
      // Refresh active order status
      setActiveOrder(null);
      checkActiveOrder();
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    }
  };

  const getVehicleIcon = (typeName) => {
    const name = typeName.toLowerCase();
    if (name.includes('tuk')) return '🛺';
    if (name.includes('bike')) return '🏍️';
    if (name.includes('car')) return '🚗';
    if (name.includes('van')) return '🚐';
    return '🚗';
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'PENDING':
        return 25;
      case 'ACCEPTED':
        return 50;
      case 'ARRIVED':
        return 75;
      case 'IN_TRANSIT':
        return 90;
      case 'COMPLETED':
        return 100;
      default:
        return 0;
    }
  };

  const renderActiveRideCard = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
            🚗
          </span>
          Active Ride
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
          <span className="text-xs font-semibold">{wsConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`mb-6 px-4 py-2 rounded-lg border-2 text-center font-semibold ${getStatusColor(activeOrder.status)}`}>
        {activeOrder.status.replace('_', ' ')}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span className={activeOrder.status === 'PENDING' ? 'font-bold text-yellow-600' : ''}>Pending</span>
          <span className={activeOrder.status === 'ACCEPTED' ? 'font-bold text-blue-600' : ''}>Accepted</span>
          <span className={activeOrder.status === 'ARRIVED' ? 'font-bold text-purple-600' : ''}>Arrived</span>
          <span className={activeOrder.status === 'IN_TRANSIT' ? 'font-bold text-green-600' : ''}>In Transit</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${getProgressPercentage(activeOrder.status)}%` }}
          ></div>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">📍 Pickup</div>
          <div className="font-semibold text-gray-800">{activeOrder.pickupLocation}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">📌 Drop-off</div>
          <div className="font-semibold text-gray-800">{activeOrder.dropoffLocation}</div>
        </div>
      </div>

      {/* Driver Info */}
      {activeOrder.driver && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 mb-6">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
              {activeOrder.driver.user?.fullName?.charAt(0) || 'D'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">
                {activeOrder.driver.user?.name || activeOrder.driver.user?.fullName || 'Driver'}
              </div>
              <div className="text-sm text-gray-600">
                {activeOrder.driver.vehiclePlateNumber || 'Vehicle Info'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-2 rounded-lg">
              <div className="text-gray-600 text-xs">Vehicle Type</div>
              <div className="font-semibold">{activeOrder.vehicleType?.name || 'N/A'}</div>
            </div>
            <div className="bg-white p-2 rounded-lg">
              <div className="text-gray-600 text-xs">Contact</div>
              <div className="font-semibold text-blue-600">
                {activeOrder.driver.user?.phone || activeOrder.driver.user?.phoneNumber || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-200 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">💰 Total Price:</span>
          <span className="text-2xl font-bold text-green-600">
            Rs. {(activeOrder.price || activeOrder.totalPrice || activeOrder.estimatedPrice || 0).toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Distance: {activeOrder.distance} km
        </div>
      </div>

      {/* Cancel Button (only for PENDING status) */}
      {activeOrder.status === 'PENDING' && (
        <button
          onClick={() => handleCancelOrder(activeOrder.id)}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
        >
          🚫 Cancel Order
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Left Side - Booking Form or Active Ride Card */}
      <div className="w-[30%] flex flex-col">
        {activeOrder ? renderActiveRideCard() : (
        <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col h-full overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
              🚀
            </span>
            Book Your Ride
          </h2>

          {/* Location Status Card */}
          {gettingLocation ? (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700 font-medium">📍 Getting your location...</span>
              </div>
            </div>
          ) : locationError ? (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 text-sm mb-2">⚠️ {locationError}</p>
              <button
                onClick={getUserLocation}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                🔄 Retry Location
              </button>
            </div>
          ) : userLocation ? (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium mb-1">✅ Location Active</p>
              <p className="text-green-700 text-xs">
                Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
              </p>
              <button
                onClick={getUserLocation}
                className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
              >
                🔄 Update Location
              </button>
            </div>
          ) : null}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Pickup Location */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📍 Pickup Location
            </label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Enter pickup location"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Drop Location */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📌 Drop Location
            </label>
            <input
              type="text"
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
              placeholder="Enter drop location"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Distance */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📏 Distance {distance && `(${distance} km)`}
            </label>
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              {loading ? (
                <span className="text-blue-600">Calculating distance...</span>
              ) : distance ? (
                <span className="font-semibold">{distance} km</span>
              ) : (
                <span className="text-gray-400">Enter pickup and drop locations to calculate distance</span>
              )}
            </div>
          </div>

          {/* Vehicle Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🚗 Select Vehicle Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {vehicleTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedVehicleType(type)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedVehicleType?.id === type.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{getVehicleIcon(type.name)}</div>
                  <div className="text-sm font-semibold text-gray-800">{type.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Base: Rs.{type.baseFare}
                  </div>
                  <div className="text-xs text-gray-500">
                    Rs.{type.pricePerKm}/km
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Price Estimation */}
          {estimatedCost > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">💰 Estimated Cost:</span>
                <span className="text-2xl font-bold text-green-600">
                  Rs. {estimatedCost.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Base Fare: Rs.{selectedVehicleType?.baseFare} + ({distance}km × Rs.{selectedVehicleType?.pricePerKm}/km)
              </div>
            </div>
          )}

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Booking...
              </span>
            ) : (
              '🚀 Book Now'
            )}
          </button>

          {/* Available Drivers Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available Drivers:</span>
              <span className="text-lg font-bold text-green-600">{drivers.length}</span>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Right Side - Map */}
      <div className="w-[70%]">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {activeOrder ? 'Live Driver Tracking' : 'Available Drivers Near You'}
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              {activeOrder 
                ? `Tracking ${activeOrder.driver?.user?.fullName || 'your driver'} - ${activeOrder.status.replace('_', ' ')}`
                : `${drivers.length} driver${drivers.length !== 1 ? 's' : ''} online and ready to serve`
              }
            </p>
            {locationError && (
              <div className="mt-2 flex items-center justify-between bg-yellow-500 bg-opacity-20 rounded-lg px-3 py-2">
                <p className="text-xs text-yellow-100 flex-1">⚠️ {locationError}</p>
                <button
                  onClick={getUserLocation}
                  className="ml-3 px-3 py-1 bg-white text-blue-600 text-xs font-semibold rounded-md hover:bg-blue-50 transition-colors"
                >
                  🔄 Retry
                </button>
              </div>
            )}
            {gettingLocation && (
              <p className="text-xs text-blue-100 mt-2">📍 Getting your location...</p>
            )}
            {userLocation && !locationError && (
              <p className="text-xs text-green-200 mt-2">
                ✅ Your location: {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
              </p>
            )}
          </div>
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : colomboPosition}
            zoom={13}
            style={{ height: 'calc(100% - 80px)', width: '100%' }}
            key={userLocation ? `${userLocation.lat}-${userLocation.lng}` : 'default'}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Current Location Marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-blue-600">📍 Your Current Location</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Lat: {userLocation.lat.toFixed(6)}<br/>
                      Lng: {userLocation.lng.toFixed(6)}
                    </p>
                    <p className="text-xs text-green-600 mt-2 font-semibold">
                      ✅ Location Active
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Active Driver Marker (if active order exists) */}
            {activeOrder && activeOrder.driver?.currentLatitude && activeOrder.driver?.currentLongitude && (
              <Marker
                position={[activeOrder.driver.currentLatitude, activeOrder.driver.currentLongitude]}
                icon={getVehicleIconForMap(activeOrder.vehicleType?.name)}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-green-600 flex items-center justify-center gap-2">
                      <span className="animate-pulse">🚗</span> Your Driver
                    </p>
                    <p className="text-sm text-gray-800 mt-1 font-semibold">
                      {activeOrder.driver.user?.fullName || 'Driver'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activeOrder.driver.vehiclePlateNumber}
                    </p>
                    <p className="text-xs mt-2 text-blue-600 font-semibold">
                      Status: {activeOrder.status.replace('_', ' ')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Available Driver Markers (only if no active order) */}
            {!activeOrder && drivers.map((driver) => {
              if (driver.currentLatitude && driver.currentLongitude) {
                const vehicleIcon = getVehicleIconForMap(driver.vehicleType);
                return (
                  <Marker
                    key={driver.id}
                    position={[driver.currentLatitude, driver.currentLongitude]}
                    icon={vehicleIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">
                          {driver.vehicleType === 'Tuk' ? '🛺' : driver.vehicleType === 'Bike' ? '🏍️' : '🚗'} Driver #{driver.id}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Vehicle: {driver.vehicleType || 'N/A'}
                        </p>
                        <p className="text-xs mt-2 text-green-600 font-semibold">
                          ✅ Available
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
