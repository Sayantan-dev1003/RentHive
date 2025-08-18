import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { toast } from 'react-toastify';

// Styles for pickup slot selection
const pickupSlotStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .slot-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .slot-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  .slot-card.selected {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
  }

  .slot-card.unavailable {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f9fafb;
  }

  .slot-card.unavailable:hover {
    transform: none;
    box-shadow: none;
    border-color: #e5e7eb;
  }

  .time-badge {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
    display: inline-block;
  }

  .capacity-indicator {
    background: #f0f9ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 8px 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #1e40af;
  }

  .confirm-button {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    padding: 16px 32px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .confirm-button:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  }

  .confirm-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .loading-spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .success-checkmark {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    animation: pulse 2s infinite;
  }

  .location-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
`;

const PickupSlotSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get order and payment data from navigation state
  const { order, paymentData, pickupSlots } = location.state || {};

  const [availableSlots, setAvailableSlots] = useState(pickupSlots?.available || []);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(false);
  const [groupedSlots, setGroupedSlots] = useState({});

  // Redirect if no order data
  useEffect(() => {
    if (!order) {
      navigate('/customer/customer-dashboard');
      return;
    }

    // If slots weren't passed, fetch them
    if (!pickupSlots?.available) {
      fetchAvailableSlots();
    } else {
      groupSlotsByDate(pickupSlots.available);
    }
  }, [order, pickupSlots]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      // Get available slots for the next 7 days
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);

      const response = await apiService.getAvailablePickupSlots({
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        minCapacity: 1
      });

      if (response.success) {
        setAvailableSlots(response.data.slots);
        groupSlotsByDate(response.data.slots);
      }
    } catch (error) {
      console.error('Error fetching pickup slots:', error);
      toast.error('Failed to load pickup slots');
    } finally {
      setLoading(false);
    }
  };

  const groupSlotsByDate = (slots) => {
    const grouped = slots.reduce((acc, slot) => {
      const date = new Date(slot.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {});

    setGroupedSlots(grouped);
  };

  const handleSlotSelection = (slot) => {
    if (slot.isAvailable && slot.remainingCapacity > 0) {
      setSelectedSlot(slot);
    }
  };

  const confirmPickupSlot = async () => {
    if (!selectedSlot || !order) {
      toast.error('Please select a pickup slot');
      return;
    }

    try {
      setBookingSlot(true);

      const response = await apiService.bookPickupSlot(selectedSlot._id, order._id);

      if (response.success) {
        toast.success('Pickup slot booked successfully!');
        
        // Navigate to order confirmation with pickup details
        navigate('/customer/order-confirmation', {
          state: {
            order: response.data.order,
            paymentData,
            pickupSlot: selectedSlot,
            isPickupScheduled: true
          }
        });
      }
    } catch (error) {
      console.error('Error booking pickup slot:', error);
      toast.error(error.response?.data?.message || 'Failed to book pickup slot');
    } finally {
      setBookingSlot(false);
    }
  };

  const formatTimeRange = (slot) => {
    return `${slot.timeSlot.startTime} - ${slot.timeSlot.endTime}`;
  };

  const getSlotStatus = (slot) => {
    if (!slot.isActive) return 'inactive';
    if (slot.remainingCapacity === 0) return 'full';
    if (slot.remainingCapacity <= 2) return 'filling';
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'filling': return '#f59e0b';
      case 'full': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Order Found</h2>
          <p className="text-gray-600 mb-6">Please complete your order first.</p>
          <button
            onClick={() => navigate('/customer/customer-dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Equipment Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <style>{pickupSlotStyles}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8 fade-in-up">
              <div className="success-checkmark">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Now please select a convenient pickup slot
              </p>
              <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium ml-2">{order._id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium ml-2 text-green-600">₹{order.totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="font-medium ml-2 text-green-600 capitalize">{order.paymentStatus}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium ml-2">{order.items?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner"></div>
                <span className="ml-3 text-gray-600">Loading available pickup slots...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pickup Slots Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg p-6 shadow-sm border fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Pickup Slots</h2>
                    
                    {Object.keys(groupedSlots).length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Slots Available</h3>
                        <p className="text-gray-600">Please contact our support team to schedule your pickup.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(groupedSlots).map(([date, slots]) => (
                          <div key={date} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">{date}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {slots.map((slot) => {
                                const status = getSlotStatus(slot);
                                const isUnavailable = status === 'full' || status === 'inactive';
                                const isSelected = selectedSlot?._id === slot._id;
                                
                                return (
                                  <div
                                    key={slot._id}
                                    className={`slot-card ${isSelected ? 'selected' : ''} ${isUnavailable ? 'unavailable' : ''}`}
                                    onClick={() => handleSlotSelection(slot)}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="time-badge">
                                        {formatTimeRange(slot)}
                                      </div>
                                      <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getStatusColor(status) }}
                                      ></div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="capacity-indicator">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                        <span>
                                          {isUnavailable 
                                            ? status === 'full' ? 'Fully Booked' : 'Unavailable'
                                            : `${slot.remainingCapacity} spots left`
                                          }
                                        </span>
                                      </div>
                                      
                                      <div className="text-sm text-gray-600">
                                        <strong>{slot.location.name}</strong>
                                      </div>
                                      
                                      {isSelected && (
                                        <div className="absolute top-3 right-3">
                                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg p-6 shadow-sm border fade-in-up sticky top-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Pickup Summary</h3>
                    
                    {selectedSlot ? (
                      <div className="space-y-4 mb-6">
                        <div className="location-card">
                          <h4 className="font-semibold text-gray-800 mb-2">📍 Pickup Location</h4>
                          <p className="text-sm text-gray-600 font-medium">{selectedSlot.location.name}</p>
                          <p className="text-sm text-gray-500">{selectedSlot.location.address}</p>
                        </div>
                        
                        <div className="location-card">
                          <h4 className="font-semibold text-gray-800 mb-2">🗓️ Date & Time</h4>
                          <p className="text-sm text-gray-600 font-medium">{selectedSlot.formattedDate}</p>
                          <p className="text-sm text-gray-500">{formatTimeRange(selectedSlot)}</p>
                        </div>

                        <div className="location-card">
                          <h4 className="font-semibold text-gray-800 mb-2">📋 Important Notes</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Please arrive on time for your slot</li>
                            <li>• Bring a valid ID for verification</li>
                            <li>• Contact support if you need to reschedule</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-gray-500">Select a pickup slot to continue</p>
                      </div>
                    )}

                    <button
                      onClick={confirmPickupSlot}
                      disabled={!selectedSlot || bookingSlot}
                      className="confirm-button w-full"
                    >
                      {bookingSlot ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="loading-spinner"></div>
                          <span>Booking Slot...</span>
                        </div>
                      ) : (
                        'Confirm Pickup Slot'
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      You can change your pickup slot by contacting our support team
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PickupSlotSelection;
