import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FinanceManager = () => {
  const [driverWallets, setDriverWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriverWallets();
  }, []);

  const fetchDriverWallets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:8080/api/admin/finance/wallets',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDriverWallets(response.data);
      
      // Calculate total balance
      const total = response.data.reduce(
        (sum, driver) => sum + (driver.currentBalance || 0),
        0
      );
      setTotalBalance(total);
      
      setError('');
    } catch (err) {
      console.error('Error fetching driver wallets:', err);
      setError(err.response?.data?.message || 'Failed to fetch wallet data');
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getBalanceColor = (balance) => {
    if (balance < 0) {
      return 'text-red-600 font-bold';
    } else if (balance < 500) {
      return 'text-red-500';
    }
    return 'text-green-600 font-semibold';
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-8">
        Loading finance data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm uppercase tracking-wide mb-1">
              Total Money Held by Drivers
            </p>
            <p className="text-4xl font-bold">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-blue-100 text-sm mt-2">
              {driverWallets.length} Driver{driverWallets.length !== 1 ? 's' : ''} 
              {' '}with Active Wallets
            </p>
          </div>
          <div className="text-6xl opacity-20">
            💰
          </div>
        </div>
      </div>

      {/* Finance Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          💳 Driver Wallet Balances
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {driverWallets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No driver wallets found in the system.
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
                    Driver Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {driverWallets.map((driver) => (
                  <tr key={driver.driverId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{driver.driverId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.driverName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.email}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getBalanceColor(driver.currentBalance)}`}>
                      {formatCurrency(driver.currentBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {driver.currentBalance < 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          🚨 Negative
                        </span>
                      ) : driver.currentBalance < 500 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          ⚠️ Low Balance
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          ✅ Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    Total Balance:
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">
                    {formatCurrency(totalBalance)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Balance Status Legend:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-gray-600">Below 0 (Negative)</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              <span className="text-gray-600">Below 500 (Low Balance)</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-gray-600">500 and Above (Healthy)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceManager;
