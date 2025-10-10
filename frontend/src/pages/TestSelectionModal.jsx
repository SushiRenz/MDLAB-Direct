import React, { useState, useEffect, useMemo } from 'react';
import '../design/TestSelectionModal.css';

function TestSelectionModal({ isOpen, onClose, onConfirm, availableServices = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({
    clinical_chemistry: true,
    hematology: true,
    clinical_microscopy: true,
    serology_immunology: true
  });

  // Category display names
  const categoryDisplayNames = {
    clinical_chemistry: 'Clinical Chemistry',
    hematology: 'Hematology',
    clinical_microscopy: 'Clinical Microscopy',
    serology_immunology: 'Serology / Immunology'
  };

  // Reset selected tests when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTests([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter and group services by category
  const groupedServices = useMemo(() => {
    const filtered = availableServices.filter(service =>
      service.isActive && 
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((groups, service) => {
      const category = service.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
      return groups;
    }, {});
  }, [availableServices, searchTerm]);

  // Handle test selection
  const handleTestSelection = (service, isChecked) => {
    if (isChecked) {
      setSelectedTests(prev => [...prev, service]);
    } else {
      setSelectedTests(prev => prev.filter(test => test._id !== service._id));
    }
  };

  // Handle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Calculate total price
  const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0);

  // Handle confirmation
  const handleConfirm = () => {
    if (selectedTests.length > 0) {
      onConfirm(selectedTests);
      onClose();
    }
  };

  // Remove selected test
  const removeSelectedTest = (testId) => {
    setSelectedTests(prev => prev.filter(test => test._id !== testId));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content test-selection-modal">
        <div className="modal-header">
          <h2>Select Laboratory Tests</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search for tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Selected Tests Summary */}
          {selectedTests.length > 0 && (
            <div className="selected-tests-summary">
              <h3>Selected Tests ({selectedTests.length})</h3>
              <div className="selected-tests-list">
                {selectedTests.map(test => (
                  <div key={test._id} className="selected-test-item">
                    <span className="test-name">{test.serviceName}</span>
                    <span className="test-price">₱{test.price.toFixed(2)}</span>
                    <button 
                      className="remove-test-btn"
                      onClick={() => removeSelectedTest(test._id)}
                      aria-label={`Remove ${test.serviceName}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="total-price">
                <strong>Total: ₱{totalPrice.toFixed(2)}</strong>
              </div>
            </div>
          )}

          {/* Test Categories */}
          <div className="test-categories">
            {Object.entries(groupedServices).map(([category, services]) => (
              <div key={category} className="category-section">
                <div 
                  className="category-header"
                  onClick={() => toggleCategory(category)}
                >
                  <h3>
                    <span className={`category-toggle ${expandedCategories[category] ? 'expanded' : ''}`}>
                      ▶
                    </span>
                    {categoryDisplayNames[category]} ({services.length})
                  </h3>
                </div>
                
                {expandedCategories[category] && (
                  <div className="category-content">
                    <div className="tests-grid">
                      {services.map(service => {
                        const isSelected = selectedTests.some(test => test._id === service._id);
                        return (
                          <div key={service._id} className="test-item">
                            <label className="test-checkbox">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleTestSelection(service, e.target.checked)}
                              />
                              <span className="checkmark"></span>
                              <div className="test-details">
                                <div className="test-name">{service.serviceName}</div>
                                <div className="test-price">₱{service.price.toFixed(2)}</div>
                                {service.preparationInstructions && (
                                  <div className="test-preparation">
                                    {service.preparationInstructions}
                                  </div>
                                )}
                                {service.duration && (
                                  <div className="test-duration">
                                    Duration: {service.duration}
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {Object.keys(groupedServices).length === 0 && (
            <div className="no-results">
              <p>No tests found matching "{searchTerm}". Try adjusting your search.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={selectedTests.length === 0}
          >
            Confirm Selection ({selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestSelectionModal;