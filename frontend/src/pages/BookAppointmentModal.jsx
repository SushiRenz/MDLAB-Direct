import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import TestSelectionModal from './TestSelectionModal';
import '../design/BookAppointmentModal.css';

function BookAppointmentModal({ isOpen, onClose, onSubmit, availableServices = [], initialData = null, isRescheduling = false }) {
  const [selectedDate, setSelectedDate] = useState(initialData ? new Date(initialData.date) : null);
  const [selectedTests, setSelectedTests] = useState(initialData ? [{ serviceName: initialData.testType }] : []);
  const [isTestSelectionOpen, setIsTestSelectionOpen] = useState(false);

  // Reset form state when modal opens/closes or when not rescheduling
  useEffect(() => {
    if (isOpen && !isRescheduling) {
      // Reset state when opening for new appointment
      setSelectedDate(null);
      setSelectedTests([]);
      setIsTestSelectionOpen(false);
    } else if (!isOpen) {
      // Reset state when modal closes
      setSelectedDate(null);
      setSelectedTests([]);
      setIsTestSelectionOpen(false);
    } else if (isOpen && isRescheduling && initialData) {
      // Set initial data for rescheduling
      setSelectedDate(new Date(initialData.date));
      setSelectedTests([{ serviceName: initialData.testType }]);
    }
  }, [isOpen, isRescheduling, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedTests.length === 0) {
      alert('Please select at least one test.');
      return;
    }

    // For single test appointment (current implementation)
    // In the future, this could be modified to handle multiple tests
    const testType = selectedTests.map(test => test.serviceName).join(', ');
    
    onSubmit({
      date: selectedDate,
      time: 'Any time during clinic hours', // Default time since owner said patients can come anytime
      testType,
      location: 'main', // Always main location
      selectedTests // Pass the full test details for future use
    });
  };

  const handleTestSelection = (tests) => {
    setSelectedTests(tests);
    setIsTestSelectionOpen(false);
  };

  const calculateTotalPrice = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0);
  };

  const removeTest = (testId) => {
    setSelectedTests(prev => prev.filter(test => test._id !== testId));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isRescheduling ? 'Reschedule Appointment' : 'Book an Appointment'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label>Test Selection</label>
            {isRescheduling ? (
              <input type="text" value={selectedTests.map(t => t.serviceName).join(', ')} disabled />
            ) : (
              <>
                <button 
                  type="button" 
                  className="test-selection-button"
                  onClick={() => setIsTestSelectionOpen(true)}
                >
                  {selectedTests.length === 0 
                    ? 'Select Laboratory Tests...' 
                    : `${selectedTests.length} test${selectedTests.length > 1 ? 's' : ''} selected`
                  }
                </button>
                
                {selectedTests.length > 0 && (
                  <div className="selected-tests-preview">
                    <h4>Selected Tests:</h4>
                    <div className="tests-list">
                      {selectedTests.map(test => (
                        <div key={test._id} className="test-item-preview">
                          <span className="test-name">{test.serviceName}</span>
                          <span className="test-price">₱{test.price.toFixed(2)}</span>
                          <button 
                            type="button"
                            className="remove-test-preview"
                            onClick={() => removeTest(test._id)}
                            title="Remove test"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="total-price-preview">
                      <strong>Total: ₱{calculateTotalPrice().toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="form-group calendar-group">
            <label>Select Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              required
              inline
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <div className="location-display">
              <div className="location-info">
                <div className="location-name">MDLAB Direct - Main Branch</div>
                <div className="location-details">You can visit anytime during clinic hours</div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isRescheduling ? 'Reschedule' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>

      {/* Test Selection Modal */}
      <TestSelectionModal
        isOpen={isTestSelectionOpen}
        onClose={() => setIsTestSelectionOpen(false)}
        onConfirm={handleTestSelection}
        availableServices={availableServices}
      />
    </div>
  );
}

export default BookAppointmentModal;