// Debug route to check current user authentication
// Add this temporarily to testResults.js for debugging

router.get('/debug/auth', auth.protect, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email
    },
    timestamp: new Date().toISOString()
  });
});