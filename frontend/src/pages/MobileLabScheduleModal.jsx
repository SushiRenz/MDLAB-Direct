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
          {/* Schedule Details Section */}
          <div className="schedule-details-section">
            <h3>Schedule Information</h3>
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
                  <div key={schedule._id} className="schedule-item-detailed">
                    <div className="schedule-header-detailed">
                      <div className="schedule-day-badge">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek]}
                      </div>
                      <h4>{schedule.location?.name}</h4>
                    </div>
                    
                    <div className="schedule-info-grid">
                      <div className="info-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px'}}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <div>
                          <label>Time</label>
                          <p>{schedule.timeSlot?.startTime} - {schedule.timeSlot?.endTime}</p>
                        </div>
                      </div>

                      <div className="info-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px'}}>
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <div>
                          <label>Location</label>
                          <p>{schedule.location?.barangay}, {schedule.location?.municipality}</p>
                        </div>
                      </div>

                      {schedule.location?.coordinates && (
                        <div className="info-item">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px'}}>
                            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <div>
                            <label>Coordinates</label>
                            <p>{schedule.location.coordinates.lat.toFixed(4)}°N, {schedule.location.coordinates.lng.toFixed(4)}°E</p>
                          </div>
                        </div>
                      )}

                      {schedule.contactInfo?.phone && (
                        <div className="info-item">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px'}}>
                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <div>
                            <label>Contact Phone</label>
                            <p>{schedule.contactInfo.phone}</p>
                          </div>
                        </div>
                      )}

                      {schedule.contactInfo?.contactPerson && (
                        <div className="info-item">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px'}}>
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <div>
                            <label>Contact Person</label>
                            <p>{schedule.contactInfo.contactPerson}</p>
                          </div>
                        </div>
                      )}

                      {schedule.notes && (
                        <div className="info-item full-width">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '18px', height: '18px'}}>
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <div>
                            <label>Notes</label>
                            <p>{schedule.notes}</p>
                          </div>
                        </div>
                      )}
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