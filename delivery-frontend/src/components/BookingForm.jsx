import { useState, useEffect } from 'react';
import axios from 'axios';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    vehicleTypeId: '',
    distance: '',
  });
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch vehicle types on component mount
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/vehicle-types');
        setVehicleTypes(response.data);
      } catch (err) {
        console.error('Error fetching vehicle types:', err);
        setError('Failed to load vehicle types');
      }
    };

    fetchVehicleTypes();
  }, []);

  // Calculate estimated price whenever vehicleTypeId or distance changes
  useEffect(() => {
    if (formData.vehicleTypeId && formData.distance) {
      const selectedVehicle = vehicleTypes.find(
        (vt) => vt.id === parseInt(formData.vehicleTypeId)
      );
      if (selectedVehicle) {
        const distance = parseFloat(formData.distance);
        const calculatedPrice = 
          parseFloat(selectedVehicle.baseFare) + 
          (distance * parseFloat(selectedVehicle.pricePerKm));
        setEstimatedPrice(calculatedPrice.toFixed(2));
      }
    } else {
      setEstimatedPrice(0);
    }
  }, [formData.vehicleTypeId, formData.distance, vehicleTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      await axios.post(
        'http://localhost:8080/api/orders',
        {
          pickupLocation: formData.pickupLocation,
          dropLocation: formData.dropLocation,
          vehicleTypeId: parseInt(formData.vehicleTypeId),
          distance: parseFloat(formData.distance),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Order Placed Successfully!');
      setFormData({
        pickupLocation: '',
        dropLocation: '',
        vehicleTypeId: '',
        distance: '',
      });
      setEstimatedPrice(0);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Book a Ride</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location
          </label>
          <input
            type="text"
            id="pickupLocation"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter pickup location"
          />
        </div>

        <div>
          <label htmlFor="dropLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Drop Location
          </label>
          <input
            type="text"
            id="dropLocation"
            name="dropLocation"
            value={formData.dropLocation}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter drop location"
          />
        </div>

        <div>
          <label htmlFor="vehicleTypeId" className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Type
          </label>
          <select
            id="vehicleTypeId"
            name="vehicleTypeId"
            value={formData.vehicleTypeId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select vehicle type</option>
            {vehicleTypes.map((vt) => (
              <option key={vt.id} value={vt.id}>
                {vt.name} (Base: LKR {vt.baseFare}, Rate: LKR {vt.pricePerKm}/km)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Distance (KM)
          </label>
          <input
            type="number"
            id="distance"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            required
            step="0.1"
            min="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter distance in kilometers"
          />
        </div>

        {estimatedPrice > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Estimated Price:</span>
              <span className="text-2xl font-bold text-green-600">LKR {estimatedPrice}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
