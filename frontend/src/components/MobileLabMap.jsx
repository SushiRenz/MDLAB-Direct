import React, { useEffect, useState } from 'react';
import '../design/MobileLabMap.css';

const MobileLabMap = ({ schedules = [] }) => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  // Center map on Nueva Vizcaya
  const mapCenter = {
    lat: 16.3791,
    lng: 121.1503
  };

  // Generate Google Maps URL
  const generateMapUrl = () => {
    const validSchedules = schedules?.filter(schedule => 
      schedule.location?.coordinates?.lat && 
      schedule.location?.coordinates?.lng
    ) || [];

    if (validSchedules.length === 0) {
      return `https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&t=&z=11&ie=UTF8&iwloc=&output=embed`;
    }

    if (validSchedules.length === 1) {
      const schedule = validSchedules[0];
      const lat = schedule.location.coordinates.lat;
      const lng = schedule.location.coordinates.lng;
      return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    }

    const avgLat = validSchedules.reduce((sum, s) => sum + s.location.coordinates.lat, 0) / validSchedules.length;
    const avgLng = validSchedules.reduce((sum, s) => sum + s.location.coordinates.lng, 0) / validSchedules.length;
    return `https://maps.google.com/maps?q=${avgLat},${avgLng}&t=&z=11&ie=UTF8&iwloc=&output=embed`;
  };

  const mapUrl = generateMapUrl();

  // Open Google Maps with directions
  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="mobile-lab-map-wrapper">
      {schedules && schedules.length > 0 && (
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-marker scheduled"></div>
            <span>Click location cards for details and directions</span>
          </div>
        </div>
      )}
      
      {/* Embedded Google Map */}
      <div className="google-map-container">
        <iframe
          src={mapUrl}
          width="100%"
          height="500"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mobile Lab Locations - Nueva Vizcaya"
        ></iframe>
      </div>

      {/* Interactive Location Cards */}
      {schedules && schedules.length > 0 && (
        <div className="location-info-overlay">
          {schedules
            .filter(schedule => 
              schedule.location?.coordinates?.lat && 
              schedule.location?.coordinates?.lng
            )
            .map((schedule, index) => (
              <div 
                key={schedule._id || index} 
                className={`location-card ${selectedSchedule === schedule._id ? 'expanded' : ''}`}
                onClick={() => setSelectedSchedule(selectedSchedule === schedule._id ? null : schedule._id)}
              >
                <div className="location-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill="#21AEA8" stroke="#21AEA8" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" fill="white"/>
                  </svg>
                  <span className="marker-label">{String.fromCharCode(65 + index)}</span>
                </div>
                <div className="location-details">
                  <h4>{schedule.location.name}</h4>
                  <p>📍 {schedule.location.barangay}, {schedule.location.municipality}</p>
                  {schedule.timeSlot && (
                    <p className="schedule-time">
                      🕒 {schedule.timeSlot.startTime} - {schedule.timeSlot.endTime}
                    </p>
                  )}
                  <p className="schedule-day">
                    📅 {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek]}
                  </p>
                  
                  {selectedSchedule === schedule._id && (
                    <div className="expanded-details">
                      {schedule.contactInfo?.phone && (
                        <p className="contact-info">
                          📞 {schedule.contactInfo.phone}
                        </p>
                      )}
                      {schedule.notes && (
                        <p className="schedule-notes">
                          💡 {schedule.notes}
                        </p>
                      )}
                      <button
                        className="directions-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDirections(schedule.location.coordinates.lat, schedule.location.coordinates.lng);
                        }}
                      >
                        🗺️ Get Directions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}
      
      {(!schedules || schedules.length === 0) && (
        <div className="no-schedules-message">
          <p>📍 No mobile lab schedules at this time. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default MobileLabMap;
