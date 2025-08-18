import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { toast } from 'react-toastify';

// Modern admin styles for pickup slot management
const adminPickupSlotStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .admin-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .admin-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .slot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .slot-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    transition: all 0.3s ease;
  }

  .slot-card.available {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .slot-card.filling {
    border-color: #f59e0b;
    background: #fffbeb;
  }

  .slot-card.full {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    padding: 12px 24px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    color: #374151;
    font-weight: 500;
    padding: 12px 24px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .btn-danger {
    background: #ef4444;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-danger:hover {
    background: #dc2626;
  }

  .input-field {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    width: 100%;
    transition: all 0.2s ease;
  }

  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-available {
    background: #dcfce7;
    color: #166534;
  }

  .status-filling {
    background: #fef3c7;
    color: #92400e;
  }

  .status-full {
    background: #fee2e2;
    color: #991b1b;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
`;

const PickupSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [groupedSlots, setGroupedSlots] = useState({});

  // Create slots form data
  const [createForm, setCreateForm] = useState({
    startDate: '',
    endDate: '',
    location: {
      name: 'RentHive Warehouse',
      address: 'Plot No. 123, Industrial Area, Mumbai - 400001'
    },
    maxCapacity: 5,
    notes: ''
  });

  // Default time slots
  const defaultTimeSlots = [
    { startTime: '09:00', endTime: '11:00' },
    { startTime: '11:00', endTime: '13:00' },
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '18:00' }
  ];

  useEffect(() => {
    fetchPickupSlots();
  }, []);

  const fetchPickupSlots = async () => {
    try {
      setLoading(true);
      
      // Get slots for the next 30 days
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);

      const response = await apiService.getAllPickupSlots({
        startDate: today.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0],
        sortBy: 'date',
        sortOrder: 'asc',
        limit: 100
      });

      if (response.success) {
        setSlots(response.data.slots);
        groupSlotsByDate(response.data.slots);
      }
    } catch (error) {
      console.error('Error fetching pickup slots:', error);
      toast.error('Failed to fetch pickup slots');
    } finally {
      setLoading(false);
    }
  };

  const groupSlotsByDate = (slotsData) => {
    const grouped = slotsData.reduce((acc, slot) => {
      const date = new Date(slot.date).toLocaleDateString('en-IN');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {});

    setGroupedSlots(grouped);
  };

  const handleCreateSlots = async (e) => {
    e.preventDefault();
    
    if (!createForm.startDate || !createForm.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    try {
      setCreateLoading(true);

      const response = await apiService.createPickupSlots({
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        timeSlots: defaultTimeSlots,
        location: createForm.location,
        maxCapacity: parseInt(createForm.maxCapacity),
        notes: createForm.notes
      });

      if (response.success) {
        toast.success(`Created ${response.data.summary.totalSlots} pickup slots successfully!`);
        setShowCreateModal(false);
        setCreateForm({
          startDate: '',
          endDate: '',
          location: {
            name: 'RentHive Warehouse',
            address: 'Plot No. 123, Industrial Area, Mumbai - 400001'
          },
          maxCapacity: 5,
          notes: ''
        });
        fetchPickupSlots();
      }
    } catch (error) {
      console.error('Error creating pickup slots:', error);
      toast.error(error.message || 'Failed to create pickup slots');
    } finally {
      setCreateLoading(false);
    }
  };

  const deleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this pickup slot?')) {
      return;
    }

    try {
      const response = await apiService.deletePickupSlot(slotId);
      if (response.success) {
        toast.success('Pickup slot deleted successfully');
        fetchPickupSlots();
      }
    } catch (error) {
      console.error('Error deleting pickup slot:', error);
      toast.error(error.message || 'Failed to delete pickup slot');
    }
  };

  const getSlotStatus = (slot) => {
    if (!slot.isActive) return 'inactive';
    if (slot.remainingCapacity === 0) return 'full';
    if (slot.remainingCapacity <= 2) return 'filling';
    return 'available';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="status-badge status-available">Available</span>;
      case 'filling':
        return <span className="status-badge status-filling">Filling Fast</span>;
      case 'full':
        return <span className="status-badge status-full">Full</span>;
      default:
        return <span className="status-badge">Inactive</span>;
    }
  };

  const formatTimeRange = (slot) => {
    return `${slot.timeSlot.startTime} - ${slot.timeSlot.endTime}`;
  };

  const getTodaysSlots = () => {
    const today = new Date().toLocaleDateString('en-IN');
    return groupedSlots[today] || [];
  };

  const getUpcomingSlots = () => {
    const today = new Date().toLocaleDateString('en-IN');
    const upcoming = {};
    Object.keys(groupedSlots).forEach(date => {
      if (date !== today) {
        upcoming[date] = groupedSlots[date];
      }
    });
    return upcoming;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pickup slots...</p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <style>{adminPickupSlotStyles}</style>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pickup Slot Management</h1>
                <p className="text-gray-600 mt-2">Manage customer pickup appointments and availability</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                + Create Pickup Slots
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-in">
            <div className="admin-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Slots</h3>
              <p className="text-3xl font-bold text-blue-600">{slots.length}</p>
            </div>
            <div className="admin-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Today</h3>
              <p className="text-3xl font-bold text-green-600">
                {getTodaysSlots().filter(slot => slot.isAvailable).length}
              </p>
            </div>
            <div className="admin-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Bookings</h3>
              <p className="text-3xl font-bold text-orange-600">
                {slots.reduce((sum, slot) => sum + slot.currentBookings, 0)}
              </p>
            </div>
            <div className="admin-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Capacity Utilization</h3>
              <p className="text-3xl font-bold text-purple-600">
                {slots.length > 0 
                  ? Math.round((slots.reduce((sum, slot) => sum + slot.currentBookings, 0) / 
                     slots.reduce((sum, slot) => sum + slot.maxCapacity, 0)) * 100)
                  : 0
                }%
              </p>
            </div>
          </div>

          {/* Today's Slots */}
          {getTodaysSlots().length > 0 && (
            <div className="mb-8 fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Pickup Slots</h2>
              <div className="slot-grid">
                {getTodaysSlots().map((slot) => {
                  const status = getSlotStatus(slot);
                  return (
                    <div key={slot._id} className={`slot-card ${status}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-gray-800">
                          {formatTimeRange(slot)}
                        </div>
                        {getStatusBadge(status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium ml-2">
                            {slot.currentBookings}/{slot.maxCapacity}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium ml-2">{slot.location.name}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => deleteSlot(slot._id)}
                          className="btn-danger text-xs"
                          disabled={slot.currentBookings > 0}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Slots */}
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Pickup Slots</h2>
            {Object.keys(getUpcomingSlots()).length === 0 ? (
              <div className="admin-card text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Slots</h3>
                <p className="text-gray-600 mb-4">Create pickup slots to allow customers to schedule their pickups.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Pickup Slots
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(getUpcomingSlots()).map(([date, daySlots]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{date}</h3>
                    <div className="slot-grid">
                      {daySlots.map((slot) => {
                        const status = getSlotStatus(slot);
                        return (
                          <div key={slot._id} className={`slot-card ${status}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-semibold text-gray-800">
                                {formatTimeRange(slot)}
                              </div>
                              {getStatusBadge(status)}
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">Capacity:</span>
                                <span className="font-medium ml-2">
                                  {slot.currentBookings}/{slot.maxCapacity}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium ml-2">{slot.location.name}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => deleteSlot(slot._id)}
                                className="btn-danger text-xs"
                                disabled={slot.currentBookings > 0}
                              >
                                Delete
                              </button>
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

        {/* Create Slots Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Pickup Slots</h2>
              
              <form onSubmit={handleCreateSlots} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                  <input
                    type="text"
                    value={createForm.location.name}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, name: e.target.value }
                    }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location Address</label>
                  <textarea
                    value={createForm.location.address}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    className="input-field"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity per Slot</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={createForm.maxCapacity}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, maxCapacity: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field"
                    rows="2"
                    placeholder="Special instructions or notes..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Default Time Slots:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {defaultTimeSlots.map((slot, index) => (
                      <div key={index}>{slot.startTime} - {slot.endTime}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">4 slots will be created for each day (excluding Sundays)</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="btn-primary flex-1"
                  >
                    {createLoading ? 'Creating...' : 'Create Slots'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default PickupSlots;
