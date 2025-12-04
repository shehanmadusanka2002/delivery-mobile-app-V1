import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VehiclePricingSettings = () => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  // Local state for editing prices
  const [editedPrices, setEditedPrices] = useState({});

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/vehicle-types');
      setVehicleTypes(response.data);
      
      // Initialize edited prices with current values
      const initialPrices = {};
      response.data.forEach(vehicle => {
        initialPrices[vehicle.id] = {
          baseFare: vehicle.baseFare || 0,
          pricePerKm: vehicle.pricePerKm || 0,
        };
      });
      setEditedPrices(initialPrices);
      setError('');
    } catch (err) {
      console.error('Error fetching vehicle types:', err);
      setError('Failed to fetch vehicle types');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (vehicleId, field, value) => {
    setEditedPrices(prev => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [field]: value,
      },
    }));
  };

  const handleUpdatePricing = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setUpdatingId(vehicleId);
      setError('');
      setSuccessMessage('');

      const pricing = editedPrices[vehicleId];
      
      await axios.put(
        `http://localhost:8080/api/vehicle-types/${vehicleId}`,
        {
          baseFare: parseFloat(pricing.baseFare),
          pricePerKm: parseFloat(pricing.pricePerKm),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage('Pricing Updated!');
      
      // Refresh vehicle types to show updated values
      await fetchVehicleTypes();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating pricing:', err);
      setError(err.response?.data?.message || 'Failed to update pricing');
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Unauthorized. Admin access required.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-8">
        Loading vehicle pricing settings...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        🚗 Vehicle Pricing Settings
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {successMessage}
        </div>
      )}

      {vehicleTypes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No vehicle types found in the system.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicleTypes.map((vehicle) => (
            <div
              key={vehicle.id}
              className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Vehicle Header */}
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-3">🚗</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {vehicle.name}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {vehicle.id}</p>
                </div>
              </div>

              {/* Current Pricing Display */}
              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Current Pricing</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Base Fare:</span>
                  <span className="font-semibold text-gray-900">
                    LKR {vehicle.baseFare?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-700">Per KM:</span>
                  <span className="font-semibold text-gray-900">
                    LKR {vehicle.pricePerKm?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Fare (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedPrices[vehicle.id]?.baseFare || 0}
                    onChange={(e) =>
                      handlePriceChange(vehicle.id, 'baseFare', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter base fare"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per KM (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedPrices[vehicle.id]?.pricePerKm || 0}
                    onChange={(e) =>
                      handlePriceChange(vehicle.id, 'pricePerKm', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price per km"
                  />
                </div>
              </div>

              {/* Update Button */}
              <button
                onClick={() => handleUpdatePricing(vehicle.id)}
                disabled={updatingId === vehicle.id}
                className={`w-full py-2 px-4 rounded-md font-semibold text-white transition-colors ${
                  updatingId === vehicle.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {updatingId === vehicle.id ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  '💾 Update Pricing'
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehiclePricingSettings;
