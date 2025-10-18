import React, { useState } from 'react';
import ReviewResults from './ReviewResults';

function TestReviewWorkflow() {
  const [currentUser] = useState({
    _id: 'test-pathologist-id',
    role: 'pathologist',
    firstName: 'Dr. Test',
    lastName: 'Pathologist',
    email: 'pathologist@mdlab.com'
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        background: '#21AEA8', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>Test Review Results Workflow</h1>
        <p style={{ margin: '0', opacity: 0.9 }}>
          This is a standalone test page for the Review Results functionality.
          It simulates a pathologist user reviewing completed test results.
        </p>
      </div>

      <ReviewResults currentUser={currentUser} />
    </div>
  );
}

export default TestReviewWorkflow;