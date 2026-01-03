import { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch balance
      const balanceResponse = await axios.get(
        'http://localhost:8080/api/wallet/balance',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBalance(balanceResponse.data);

      // Fetch transactions
      const transactionsResponse = await axios.get(
        'http://localhost:8080/api/wallet/transactions',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Sort by date, newest first
      const sortedTransactions = transactionsResponse.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTransactions(sortedTransactions);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setTopUpLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/wallet/top-up',
        null,
        {
          params: { amount },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success - refresh wallet data
      await fetchWalletData();
      setShowTopUpModal(false);
      setTopUpAmount('');
      alert(`✅ Successfully added Rs. ${amount.toFixed(2)} to your wallet!`);
    } catch (err) {
      console.error('Error topping up wallet:', err);
      alert('Failed to top up wallet. Please try again.');
    } finally {
      setTopUpLoading(false);
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

  const getTransactionIcon = (type) => {
    return type === 'CREDIT' ? '💰' : '💸';
  };

  const TopUpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
              💰
            </span>
            Top Up Wallet
          </h2>
          <button
            onClick={() => {
              setShowTopUpModal(false);
              setTopUpAmount('');
            }}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Enter Amount (Rs.)
          </label>
          <input
            type="number"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            placeholder="1000"
            min="0"
            step="100"
            className="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Quick Select:</p>
          <div className="grid grid-cols-3 gap-3">
            {[500, 1000, 2000, 5000, 10000, 20000].map((amount) => (
              <button
                key={amount}
                onClick={() => setTopUpAmount(amount.toString())}
                className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-800 font-semibold rounded-lg transition-colors border-2 border-transparent hover:border-blue-500"
              >
                Rs. {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Simulate Payment Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This is a simulated payment. No actual transaction will occur.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleTopUp}
            disabled={topUpLoading}
            className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
              topUpLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {topUpLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              '🚀 Simulate Payment'
            )}
          </button>
          <button
            onClick={() => {
              setShowTopUpModal(false);
              setTopUpAmount('');
            }}
            disabled={topUpLoading}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 font-semibold">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center">
          <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          My Wallet
        </h1>
        <p className="text-green-100 mt-2">Manage your balance and transactions</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-green-500 via-green-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-green-100 text-lg font-medium mb-2">Current Balance</p>
              <p className="text-5xl font-bold tracking-tight">
                Rs. {balance.toFixed(2)}
              </p>
            </div>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-5xl">💰</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowTopUpModal(true)}
            className="w-full md:w-auto px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-xl hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
          >
            ➕ Top Up Wallet
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Credits</p>
              <p className="text-2xl font-bold text-green-600">
                Rs. {transactions
                  .filter(t => t.type === 'CREDIT')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Debits</p>
              <p className="text-2xl font-bold text-red-600">
                Rs. {transactions
                  .filter(t => t.type === 'DEBIT')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Transaction History
          </h2>
          <p className="text-sm text-gray-600 mt-1">View all your wallet transactions</p>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg font-semibold">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">Your wallet transactions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      transaction.type === 'CREDIT' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          transaction.type === 'CREDIT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                        <p className="text-sm font-semibold text-gray-800">
                          {transaction.description || `${transaction.type} Transaction`}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      transaction.type === 'CREDIT' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}Rs. {transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && <TopUpModal />}
    </div>
  );
};

export default CustomerWallet;
