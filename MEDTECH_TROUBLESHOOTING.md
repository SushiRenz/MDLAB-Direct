# MedTech Authentication Troubleshooting

## 🔍 Steps to Debug the 403 Error:

### 1. **Check Current User Authentication**
Open your browser developer tools (F12) and go to the **Console** tab, then run:

```javascript
// Check if user is logged in
console.log('Stored token:', localStorage.getItem('token') || sessionStorage.getItem('token'));
console.log('Stored user:', JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'));
```

### 2. **Test Authentication API**
In the Console, test the debug auth endpoint:

```javascript
fetch('/api/test-results/debug/auth', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + (localStorage.getItem('token') || sessionStorage.getItem('token')),
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Auth status:', data))
.catch(err => console.error('Auth error:', err));
```

### 3. **Expected Results:**

✅ **If authentication is working:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": "user_id_here",
    "role": "medtech",
    "firstName": "User Name",
    "lastName": "Last Name",
    "email": "user@email.com",
    "isActive": true
  },
  "canAccessReviewResults": true,
  "timestamp": "2025-10-19T..."
}
```

❌ **If getting 401/403 errors:**
- Token might be expired or invalid
- User might not be logged in as MedTech
- Session might have been invalidated

### 4. **Solutions:**

#### **If token is missing or invalid:**
1. Logout and login again as a MedTech user
2. Check if the user role is exactly "medtech" (case-sensitive)

#### **If user role is wrong:**
- Make sure you're logged in with a MedTech account
- Only MedTech users can access Review Results now

#### **If still getting 403:**
1. Clear browser cache and cookies
2. Check Network tab for the exact error message
3. Verify the request is going to the right URL (should be port 5000, not 5173)

### 5. **Valid MedTech Users in Database:**
From our test, these MedTech users exist:
- Dr. Jennifer Cruz (jennifer.cruz@mdlab.com)
- Plus 2 other MedTech users

Try logging in with one of these accounts if needed.

## 🚀 **What Changed:**
- ✅ Only MedTech users can now approve/reject test results
- ✅ Other roles (pathologist, admin, receptionist) are blocked
- ✅ This makes Review Results exclusive to MedTech workflow

## 📞 **If Still Not Working:**
Run the debug command in browser console and share the output to identify the exact issue!