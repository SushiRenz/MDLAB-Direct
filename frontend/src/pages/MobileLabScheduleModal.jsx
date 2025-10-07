import React, { useState, useEffect } from 'react';
import '../design/MobileLabScheduleModal.css';

function MobileLabScheduleModal({ 
  isOpen, 
  onClose, 
  schedules = [], 
  currentActiveLocation = null, 
  nextLocation = null, 
  loading = false, 
  error = '' 
}) {
  const [currentLocation, setCurrentLocation] = useState(null);

  // Update current location when data changes
  useEffect(() => {
    if (currentActiveLocation) {
      setCurrentLocation({
        location: currentActiveLocation.location?.name || 'No active location',
        time: currentActiveLocation.timeSlot ? 
          `${currentActiveLocation.timeSlot.startTime} - ${currentActiveLocation.timeSlot.endTime}` : 
          'Time not specified',
        status: currentActiveLocation.status || 'Unknown',
        coordinates: currentActiveLocation.location?.coordinates || { lat: 0, lng: 0 }
      });
    } else if (nextLocation) {
      setCurrentLocation({
        location: `Next: ${nextLocation.location?.name || 'Location TBD'}`,
        time: nextLocation.timeSlot ? 
          `${nextLocation.timeSlot.startTime} - ${nextLocation.timeSlot.endTime}` : 
          'Time TBD',
        status: 'Next Location',
        coordinates: nextLocation.location?.coordinates || { lat: 0, lng: 0 }
      });
    } else {
      setCurrentLocation({
        location: 'No active location',
        time: 'Check schedule below',
        status: 'Inactive',
        coordinates: { lat: 0, lng: 0 }
      });
    }
  }, [currentActiveLocation, nextLocation]);

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
            <h3>Current Status</h3>
            <div className="current-location-card">
              <div className={`location-status ${currentLocation?.status?.toLowerCase().replace(' ', '-')}`}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '16px', height: '16px', marginRight: '6px'}}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill={currentLocation?.status === 'Active' ? '#10b981' : '#6b7280'}/>
                </svg>
                {currentLocation?.status === 'Active' ? 'Now Serving' : 
                 currentLocation?.status === 'Next Location' ? 'Next Location' : 'No Active Service'}
              </div>
              <h4>{currentLocation?.location}</h4>
              <p>Time: {currentLocation?.time}</p>
              {currentLocation?.coordinates && currentLocation.coordinates.lat !== 0 && (
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
              )}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="schedule-section">
            <h3>Mobile Lab Schedule</h3>
            {loading ? (
              <div className="loading-state">Loading schedule...</div>
            ) : error ? (
              <div className="error-state">
                <p>Unable to load schedule: {error}</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="empty-state">
                <p>No mobile lab schedules are currently available.</p>
                <p>Please contact us for more information about upcoming visits.</p>
              </div>
            ) : (
              <div className="schedule-list">
                {schedules.map((schedule) => (
                  <div key={schedule._id} className="schedule-item">
                    <div className="schedule-day">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek]}
                    </div>
                    <div className="schedule-details">
                      <h4>{schedule.location?.name}</h4>
                      <p>Time: {schedule.timeSlot?.startTime} - {schedule.timeSlot?.endTime}</p>
                      <p className="schedule-address">
                        {schedule.location?.barangay}
                        {schedule.location?.municipality && `, ${schedule.location?.municipality}`}
                      </p>
                      {schedule.notes && (
                        <p className="schedule-notes">{schedule.notes}</p>
                      )}
                    </div>
                    <div className={`schedule-status ${schedule.status?.toLowerCase().replace(' ', '-')}`}>
                      {schedule.status === 'Active' && <span className="status-indicator active"></span>}
                      {schedule.status === 'Next Location' && <span className="status-indicator next"></span>}
                      {schedule.status === 'Scheduled' && <span className="status-indicator scheduled"></span>}
                      {schedule.status === 'On Call' && <span className="status-indicator on-call"></span>}
                      {schedule.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileLabScheduleModal;