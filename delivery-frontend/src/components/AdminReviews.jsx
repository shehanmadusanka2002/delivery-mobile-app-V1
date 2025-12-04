import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [reviews, ratingFilter]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:8080/api/admin/reviews',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to fetch reviews');
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (ratingFilter === 'low') {
      setFilteredReviews(reviews.filter(review => review.rating < 3));
    } else if (ratingFilter === 'high') {
      setFilteredReviews(reviews.filter(review => review.rating >= 4));
    } else {
      setFilteredReviews(reviews);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="text-yellow-400">⭐</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">☆</span>);
      }
    }
    return stars;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'border-l-4 border-green-500';
    if (rating === 3) return 'border-l-4 border-yellow-500';
    return 'border-l-4 border-red-500';
  };

  const getRatingBadge = (rating) => {
    if (rating >= 4) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Excellent</span>;
    } else if (rating === 3) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Average</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Poor</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAverageRating = () => {
    if (filteredReviews.length === 0) return 0;
    const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / filteredReviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-8">
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              ⭐ Customer Reviews
            </h2>
            <div className="mt-2 flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Total Reviews: <span className="font-bold text-gray-900">{reviews.length}</span>
              </p>
              <p className="text-sm text-gray-600">
                Showing: <span className="font-bold text-gray-900">{filteredReviews.length}</span>
              </p>
              <p className="text-sm text-gray-600">
                Average Rating: <span className="font-bold text-yellow-600">{calculateAverageRating()} / 5.0</span>
              </p>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="ratingFilter" className="text-sm font-medium text-gray-700">
              Filter:
            </label>
            <select
              id="ratingFilter"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="high">High Ratings (4-5 ⭐)</option>
              <option value="low">Low Ratings (&lt; 3 ⭐)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          {ratingFilter === 'low' 
            ? '🎉 No low-rated reviews found!' 
            : 'No reviews available.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.reviewId}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 ${getRatingColor(review.rating)}`}
            >
              {/* Rating Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="text-2xl">
                  {renderStars(review.rating)}
                </div>
                {getRatingBadge(review.rating)}
              </div>

              {/* Driver and Customer Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-20">Driver:</span>
                  <span className="text-sm text-gray-900 font-medium flex-1">
                    {review.driverName}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-gray-500 w-20">Customer:</span>
                  <span className="text-sm text-gray-600 flex-1">
                    {review.customerName}
                  </span>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded-md">
                    "{review.comment}"
                  </p>
                </div>
              )}

              {/* Date */}
              <div className="text-xs text-gray-500 border-t pt-2">
                📅 {formatDate(review.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Distribution */}
      {filteredReviews.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = filteredReviews.filter(r => r.rating === star).length;
              const percentage = (count / filteredReviews.length) * 100;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {star} ⭐
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${
                        star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-16 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
