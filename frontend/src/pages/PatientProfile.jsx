import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { calculateAge, formatAge, formatDate } from '../utils/dateUtils';
import { API_ENDPOINTS } from '../config/api';
import '../design/PatientDashboard.css';

function PatientProfile({ user, onProfileUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).split('T')[0] : '',
    address: typeof user?.address === 'object' && user?.address ? 
      JSON.stringify(user.address) : 
      user?.address || '',
    profilePic: user?.profilePic || null,
  });
  const [previewPic, setPreviewPic] = useState(null);
  const fileInputRef = useRef(null);

  // Update profileData when user prop changes
  useEffect(() => {
    console.log('PatientProfile - useEffect triggered, user changed:', user);
    console.log('PatientProfile - user data available:', !!user);
    console.log('PatientProfile - user details:', {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      gender: user?.gender,
      dateOfBirth: user?.dateOfBirth,
      address: user?.address
    });
    
    if (user) {
      const newProfileData = {
        gender: user?.gender || '',
        dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).split('T')[0] : '',
        address: typeof user?.address === 'object' && user?.address ? 
          JSON.stringify(user.address) : 
          user?.address || '',
        profilePic: user?.profilePic || null,
      };
      
      console.log('PatientProfile - Setting profile data:', newProfileData);
      setProfileData(newProfileData);
    }
  }, [user]);

  // Only fetch fresh user data on initial mount if we don't have complete user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (token) {
          console.log('PatientProfile - Fetching fresh user data (initial mount)');
          const response = await axios.get(API_ENDPOINTS.ME, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success && response.data.user) {
            console.log('PatientProfile - Fresh user data received:', response.data.user);
            // Update parent component with fresh data
            if (onProfileUpdate) {
              onProfileUpdate(response.data.user);
            }
          }
        }
      } catch (error) {
        console.error('PatientProfile - Error fetching user data:', error);
      }
    };

    // Only fetch on initial mount if we don't have user data or if essential fields are missing
    if (!user || !user.id || !user.email) {
      fetchUserData();
    }
  }, []); // Remove dependencies to prevent infinite loop

  const handleEditClick = () => {
    // Update profile data when entering edit mode
    setProfileData({
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).split('T')[0] : '',
      address: typeof user?.address === 'object' && user?.address ? 
        JSON.stringify(user.address) : 
        user?.address || '',
      profilePic: user?.profilePic || null,
    });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setPreviewPic(null);
    // Reset to original user data
    setProfileData({
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).split('T')[0] : '',
      address: typeof user?.address === 'object' && user?.address ? 
        JSON.stringify(user.address) : 
        user?.address || '',
      profilePic: user?.profilePic || null,
    });
  };

  const handleChange = (e) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePicClick = () => {
    if (editMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profilePic: file }));
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const { gender, dateOfBirth, address, profilePic } = profileData;

      const formData = new FormData();
      formData.append('gender', gender || '');
      formData.append('dateOfBirth', dateOfBirth || '');
      formData.append('address', address || '');
      
      if (profilePic instanceof File) {
        formData.append('profilePic', profilePic);
      }

      const { data: updatedUser } = await axios.put('/api/users/me', 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type here - it will be set automatically for FormData
          }
        }
      );

      // Force browser to reload the image
      if (updatedUser.profilePic) {
        updatedUser.profilePic = `${updatedUser.profilePic}?t=${Date.now()}`;
      }

      console.log('PatientProfile - Profile update successful:', updatedUser);

      // Update parent state FIRST
      if (onProfileUpdate) {
        console.log('PatientProfile - Calling onProfileUpdate with:', updatedUser);
        onProfileUpdate(updatedUser);
      }

      // Update local state with new data
      const newProfileData = {
        gender: updatedUser.gender || '',
        dateOfBirth: updatedUser.dateOfBirth ? String(updatedUser.dateOfBirth).split('T')[0] : '',
        address: typeof updatedUser.address === 'object' && updatedUser.address ? 
          JSON.stringify(updatedUser.address) : 
          updatedUser.address || '',
        profilePic: updatedUser.profilePic || null
      };
      
      console.log('PatientProfile - Updating local profileData:', newProfileData);
      setProfileData(newProfileData);

      setPreviewPic(null);
      setEditMode(false);

      console.log('PatientProfile - Profile update completed successfully!');

    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile');
    }
  };

  const getInitials = (user) => {
    return user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'P';
  };

  // Debug logging
  console.log('PatientProfile - user prop:', user);
  console.log('PatientProfile - user exists:', !!user);
  console.log('PatientProfile - user.firstName:', user?.firstName, typeof user?.firstName);
  console.log('PatientProfile - user.lastName:', user?.lastName, typeof user?.lastName);
  console.log('PatientProfile - user.email:', user?.email, typeof user?.email);
  console.log('PatientProfile - user.dateOfBirth:', user?.dateOfBirth, typeof user?.dateOfBirth);
  console.log('PatientProfile - user.gender:', user?.gender, typeof user?.gender);
  console.log('PatientProfile - user.address:', user?.address, typeof user?.address);
  console.log('PatientProfile - profileData:', profileData);

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h2>My Profile</h2>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-content">
          <h2>My Profile</h2>
          <p>View and update your personal information</p>
        </div>
        {!editMode && (
          <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
            Edit
          </button>
        )}
      </div>
      
      <div className="profile-card">
        <div className="profile-info">
          <div
            className="profile-avatar"
            style={{
              width: 80,
              height: 80,
              fontSize: 32,
              cursor: editMode ? 'pointer' : 'default',
              overflow: 'hidden',
              background: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={editMode ? handlePicClick : undefined}
            title={editMode ? 'Click to change profile picture' : ''}
          >
            {previewPic ? (
              <img
                src={previewPic}
                alt="Profile Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : user?.profilePic ? (
              <img
                src={`http://localhost:5000${user.profilePic}?t=${Date.now()}`}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  console.error('Image failed to load:', user.profilePic);
                  e.target.src = ''; // Reset to show initials
                }}
              />
            ) : (
              <span>{getInitials(user)}</span>
            )}
            {editMode && (
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handlePicChange}
              />
            )}
          </div>
          <div className="profile-details">
            <h3>{user.firstName} {user.lastName}</h3>
            <p>{user.email}</p>
            <span className="profile-role">Patient</span>
          </div>
        </div>

        <div className="profile-fields">
          <div className="field-group">
            <div className="field-item">
              <label>Full Name</label>
              <div className="field-value">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not provided'}</div>
            </div>
            <div className="field-item">
              <label>Patient ID</label>
              <div className="field-value patient-id">{user?.patientId || 'Not assigned'}</div>
            </div>
            <div className="field-item">
              <label>Email Address</label>
              <div className="field-value">{user?.email || 'Not provided'}</div>
            </div>
          </div>

          <div className="field-group">
            <div className="field-item">
              <label>Gender</label>
              {editMode ? (
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="field-value">{profileData.gender || 'Not provided'}</div>
              )}
            </div>
            <div className="field-item">
              <label>Date of Birth</label>
              {editMode ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profileData.dateOfBirth}
                  onChange={handleChange}
                />
              ) : (
                <div className="field-value">
                  {profileData.dateOfBirth ? formatDate(profileData.dateOfBirth) : 'Not provided'}
                </div>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="field-item">
              <label>Age</label>
              <div className="field-value">
                {(() => {
                  // Try to use age from user object first, then calculate from dateOfBirth
                  const age = user?.age !== null && user?.age !== undefined 
                    ? user.age 
                    : calculateAge(user?.dateOfBirth);
                  return formatAge(age);
                })()}
              </div>
            </div>
          </div>

          <div className="field-group">
            <div className="field-item full-width">
              <label>Address</label>
              {editMode ? (
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                />
              ) : (
                <div className="field-value">
                  {profileData.address || 'Not provided'}
                </div>
              )}
            </div>
          </div>

          {editMode && (
            <div className="profile-actions">
              <button type="submit" className="save-profile-btn" onClick={handleSave}>
                Save Changes
              </button>
              <button type="button" className="cancel-profile-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;