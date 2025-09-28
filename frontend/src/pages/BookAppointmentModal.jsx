import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../design/BookAppointmentModal.css';

function BookAppointmentModal({ isOpen, onClose, onSubmit, availableServices = [], initialData = null, isRescheduling = false }) {
  const [selectedDate, setSelectedDate] = useState(initialData ? new Date(initialData.date) : null);
  const [selectedTime, setSelectedTime] = useState(initialData ? initialData.time : '');
  const [testType, setTestType] = useState(initialData ? initialData.testType : '');
  const [location, setLocation] = useState(initialData ? initialData.location : 'main');

  const timeSlots = [
    { value: '7:00 AM - 10:00 AM', label: '7:00 AM - 10:00 AM (Morning - Fasting Tests)', description: 'Recommended for tests requiring fasting' },
    { value: '1:00 PM - 4:00 PM', label: '1:00 PM - 4:00 PM (Afternoon - After Lunch)', description: 'For non-fasting tests or after meal' }
  ];

  const testTypes = [
    'Complete Blood Count (CBC)',
    'Blood Sugar Test',
    'Lipid Profile',
    'Urinalysis',
    'X-Ray Chest',
    'ECG/EKG'
  ];

  // Use real services if available, otherwise fallback to hardcoded
  const serviceOptions = availableServices.length > 0 
    ? availableServices.map(service => ({
        value: service.serviceName,
        label: `${service.serviceName} - ₱${service.price}`,
        price: service.price
      }))
    : testTypes.map(test => ({ value: test, label: test, price: 0 }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      date: selectedDate,
      time: selectedTime,
      testType,
      location
    });
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
            <label>Test Type</label>
            {isRescheduling ? (
              <input type="text" value={testType} disabled />
            ) : (
              <select 
                value={testType} 
                onChange={(e) => setTestType(e.target.value)}
                required
              >
                <option value="">Choose a test...</option>
                {serviceOptions.map(service => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
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
            <label>Select Time Schedule</label>
            <select 
              value={selectedTime} 
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="">Choose a schedule...</option>
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value} title={slot.description}>
                  {slot.label}
                </option>
              ))}
            </select>
            <small className="time-info">
              Morning schedule is recommended for fasting blood tests. Afternoon schedule is for non-fasting tests or after meals.
            </small>
          </div>

          <div className="form-group">
            <label>Select Location</label>
            <select 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="main">MDLAB Direct - Main Branch</option>
              <option value="mobile">Mobile Lab Service</option>
            </select>
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
    </div>
  );
}

export default BookAppointmentModal;