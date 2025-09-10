import React, { useState, useEffect } from 'react';
import '../design/MobileLabScheduleModal.css';

function MobileLabScheduleModal({ isOpen, onClose }) {
  const [currentLocation, setCurrentLocation] = useState({
    location: 'Bayombong Public Plaza',
    time: '8:00 AM - 12:00 PM',
    status: 'Active',
    coordinates: {
      lat: 16.4833,
      lng: 121.1500
    }
  });

  const weeklySchedule = [
    {
      day: 'Monday',
      location: 'Bayombong Public Plaza',
      time: '8:00 AM - 12:00 PM',
      status: 'Next Location'
    },
    {
      day: 'Tuesday',
      location: 'Solano Town Center',
      time: '8:00 AM - 12:00 PM',
      status: 'Scheduled'
    },
    {
      day: 'Wednesday',
      location: 'Bambang Barangay Hall',
      time: '8:00 AM - 12:00 PM',
      status: 'Scheduled'
    },
    {
      day: 'Thursday',
      location: 'Dupax Community Center',
      time: '8:00 AM - 12:00 PM',
      status: 'Scheduled'
    },
    {
      day: 'Friday',
      location: 'Kasibu Municipal Hall',
      time: '8:00 AM - 12:00 PM',
      status: 'Scheduled'
    },
    {
      day: 'Saturday',
      location: 'Special Community Events',
      time: 'By Schedule',
      status: 'On Call'
    }
  ];

  // Add event listener for escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle clicking outside the modal
  const handleOverlayClick = (event) => {
    if (event.target.className === 'modal-overlay') {
      onClose();
    }
  };

  const handleGetDirections = () => {
    const { coordinates, location } = currentLocation;
    const query = encodeURIComponent(location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}&query_place_id=${query}`;
    window.open(mapsUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content mobile-schedule-modal">
        <div className="modal-header">
          <h2>Mobile Lab Schedule</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Current Location Section */}
          <div className="current-location-section">
            <h3>Current Location</h3>
            <div className="current-location-card">
              <div className="location-status active">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '16px', height: '16px', marginRight: '6px'}}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#10b981"/>
                </svg>
                Now Serving
              </div>
              <h4>{currentLocation.location}</h4>
              <p>Time: {currentLocation.time}</p>
              <div className="location-info">
                <span>GPS: {currentLocation.coordinates.lat}° N, {currentLocation.coordinates.lng}° E</span>
                <button 
                  className="directions-btn"
                  onClick={handleGetDirections}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '16px', height: '16px', marginRight: '6px'}}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Get Directions
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Schedule Section */}
          <div className="schedule-section">
            <h3>Weekly Schedule</h3>
            <div className="schedule-list">
              {weeklySchedule.map((schedule) => (
                <div key={schedule.day} className="schedule-item">
                  <div className="schedule-day">{schedule.day}</div>
                  <div className="schedule-details">
                    <h4>{schedule.location}</h4>
                    <p>Time: {schedule.time}</p>
                  </div>
                  <div className={`schedule-status ${schedule.status.toLowerCase().replace(' ', '-')}`}>
                    {schedule.status === 'Active' && <span className="status-indicator active"></span>}
                    {schedule.status === 'Next Location' && <span className="status-indicator next"></span>}
                    {schedule.status === 'Scheduled' && <span className="status-indicator scheduled"></span>}
                    {schedule.status === 'On Call' && <span className="status-indicator on-call"></span>}
                    {schedule.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileLabScheduleModal;