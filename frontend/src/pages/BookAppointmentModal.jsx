import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../design/BookAppointmentModal.css';

function BookAppointmentModal({ isOpen, onClose, onSubmit, initialData = null, isRescheduling = false }) {
  const [selectedDate, setSelectedDate] = useState(initialData ? new Date(initialData.date) : null);
  const [selectedTime, setSelectedTime] = useState(initialData ? initialData.time : '');
  const [testType, setTestType] = useState(initialData ? initialData.testType : '');
  const [location, setLocation] = useState(initialData ? initialData.location : 'main');
  const [selectedDoctor, setSelectedDoctor] = useState(initialData ? initialData.doctor : '');

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '02:00 PM', '03:00 PM'
  ];

  const testTypes = [
    'Complete Blood Count (CBC)',
    'Blood Sugar Test',
    'Lipid Profile',
    'Urinalysis',
    'X-Ray Chest',
    'ECG/EKG'
  ];

  const doctors = [
    'Dr. Maria Santos',
    'Dr. Juan Rodriguez',
    'Dr. Ana Cruz',
    'Dr. Roberto Kim'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      date: selectedDate,
      time: selectedTime,
      testType,
      location,
      doctor: selectedDoctor
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
                {testTypes.map(test => (
                  <option key={test} value={test}>{test}</option>
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
            <label>Select Time</label>
            <select 
              value={selectedTime} 
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="">Choose a time...</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
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

          <div className="form-group">
            <label>Select Doctor</label>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
            >
              <option value="">Choose a doctor...</option>
              {doctors.map(doctor => (
                <option key={doctor} value={doctor}>{doctor}</option>
              ))}
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