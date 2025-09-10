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
              <div className="location-status active">🟢 Now Serving</div>
              <h4>{currentLocation.location}</h4>
              <p>⏰ {currentLocation.time}</p>
              <div className="location-info">
                <span>📍 GPS: {currentLocation.coordinates.lat}° N, {currentLocation.coordinates.lng}° E</span>
                <button 
                  className="directions-btn"
                  onClick={handleGetDirections}
                >
                  🗺️ Get Directions
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
                    <p>⏰ {schedule.time}</p>
                  </div>
                  <div className={`schedule-status ${schedule.status.toLowerCase().replace(' ', '-')}`}>
                    {schedule.status === 'Active' && '🟢'}
                    {schedule.status === 'Next Location' && '🔵'}
                    {schedule.status === 'Scheduled' && '⚪'}
                    {schedule.status === 'On Call' && '🟡'}
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