import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/pending-drivers', icon: '⏳', label: 'Pending Drivers' },
    { path: '/admin/drivers', icon: '🚗', label: 'All Drivers' },
    { path: '/admin/orders', icon: '📦', label: 'Orders' },
    { path: '/admin/pricing', icon: '💵', label: 'Pricing' },
    { path: '/admin/finance', icon: '💰', label: 'Finance' },
    { path: '/admin/reviews', icon: '⭐', label: 'Reviews' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen && (
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {isSidebarOpen && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-2xl">🚪</span>
            {isSidebarOpen && (
              <span className="ml-3 font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {navigationItems.find(item => isActive(item.path))?.label || 'Admin Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {localStorage.getItem('email')}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
