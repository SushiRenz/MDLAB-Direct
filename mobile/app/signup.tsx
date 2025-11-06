import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { login } = useAuth(); // Get login function from AuthContext
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation errors state
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Validation functions
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'First name can only contain letters';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Last name can only contain letters';
        return '';
      
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.trim().length < 3) return 'Username must be at least 3 characters';
        if (value.trim().length > 20) return 'Username must be less than 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) return 'Username can only contain letters, numbers, and underscore';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
        return '';
      
      case 'phone':
        if (value.trim() && value.trim().length < 10) return 'Phone number must be at least 10 digits';
        if (value.trim() && !/^[\d\s\-\+\(\)]+$/.test(value.trim())) return 'Please enter a valid phone number';
        return '';
      
      case 'address':
        if (!value.trim()) return 'Complete address is required';
        if (value.trim().length < 5) return 'Please provide a complete address';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        // Match backend validation requirements
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      
      case 'gender':
        if (!value) return 'Please select your gender';
        return '';
      
      default:
        return '';
    }
  };

  const validateAge = (): string => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    // Check for valid date (not in future, not too old)
    if (birthDate > today) {
      return 'Birth date cannot be in the future';
    }
    
    // Calculate actual age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age = age - 1;
    }
    
    if (age < 0) {
      return 'Please enter a valid birth date';
    }
    
    if (age > 120) {
      return 'Please enter a valid birth date';
    }
    
    // Match backend requirement: minimum age 13
    if (age < 13) {
      return 'You must be at least 13 years old to create an account';
    }
    
    return '';
  };

  const handleFieldChange = (field: string, value: string) => {
    // Update the field value
    switch (field) {
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'username': setUsername(value); break;
      case 'email': setEmail(value); break;
      case 'phone': setPhone(value); break;
      case 'address': setAddress(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
    }

    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate field
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));

    // Also revalidate confirm password if password changed
    if (field === 'password' && confirmPassword) {
      const confirmError = validateField('confirmPassword', confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Get current value and validate
    let currentValue = '';
    switch (field) {
      case 'firstName': currentValue = firstName; break;
      case 'lastName': currentValue = lastName; break;
      case 'username': currentValue = username; break;
      case 'email': currentValue = email; break;
      case 'phone': currentValue = phone; break;
      case 'address': currentValue = address; break;
      case 'password': currentValue = password; break;
      case 'confirmPassword': currentValue = confirmPassword; break;
      case 'gender': currentValue = gender; break;
    }
    
    const error = validateField(field, currentValue);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate all fields
    newErrors.firstName = validateField('firstName', firstName);
    newErrors.lastName = validateField('lastName', lastName);
    newErrors.username = validateField('username', username);
    newErrors.email = validateField('email', email);
    newErrors.phone = validateField('phone', phone);
    newErrors.address = validateField('address', address);
    newErrors.password = validateField('password', password);
    newErrors.confirmPassword = validateField('confirmPassword', confirmPassword);
    newErrors.gender = validateField('gender', gender);
    
    // Validate age
    const ageError = validateAge();
    if (ageError) newErrors.dateOfBirth = ageError;
    
    setErrors(newErrors);
    
    // Debug: Log validation errors
    const errorFields = Object.entries(newErrors).filter(([_, error]) => error !== '');
    if (errorFields.length > 0) {
      console.log('🚫 Signup Validation Errors:');
      errorFields.forEach(([field, error]) => {
        console.log(`   ${field}: ${error}`);
      });
    }
    
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      phone: true,
      address: true,
      password: true,
      confirmPassword: true,
      gender: true,
      dateOfBirth: true,
    });
    
    // Check if there are any errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSignUp = async () => {
    // Validate the entire form
    if (!validateForm()) {
      // Count the number of errors for better user feedback
      const errorCount = Object.values(errors).filter(error => error !== '').length;
      Alert.alert(
        'Validation Error', 
        `Please fix the ${errorCount} error${errorCount !== 1 ? 's' : ''} highlighted in red below before submitting.`
      );
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Signup: Attempting to register user...');
      
      // Import authAPI locally for registration
      const { authAPI } = await import('../services/api');
      
      const response = await authAPI.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password: password, // Backend expects 'password', not 'passwordHash'
        phone: phone.trim() || undefined,
        address: address.trim(),
        dateOfBirth: formatDateForAPI(dateOfBirth),
        gender: gender, // Already lowercase from picker values
      });

      if (response.success && response.data?.user) {
        console.log('📝 Signup: Registration successful, now logging in...');
        
        // Automatically log in the user after successful registration
        const loginResponse = await login(email.trim().toLowerCase(), password);
        
        if (loginResponse.success) {
          Alert.alert(
            'Welcome!',
            'Your account has been created and you are now logged in.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to dashboard since user is now authenticated
                  router.replace('/(drawer)/dashboard');
                }
              }
            ]
          );
        } else {
          // Registration succeeded but login failed - redirect to login page
          Alert.alert(
            'Registration Successful',
            'Your account has been created! Please log in with your credentials.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/login')
              }
            ]
          );
        }
      } else {
        console.error('📝 Signup: Registration failed:', response.message);
        Alert.alert(
          'Registration Failed', 
          response.message || 'Unable to create account. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('📝 Signup: Registration error:', error);
      Alert.alert(
        'Registration Error',
        'Unable to connect to server. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Component to display field errors
  const FieldError = ({ field }: { field: string }) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={16} color="#FF4444" />
        <ThemedText style={styles.errorText}>{errors[field]}</ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Centered Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/mdlab-navbar.png')}
              style={styles.centerLogo}
              contentFit="contain"
            />
          </View>

          {/* Sign Up Form */}
          <View style={styles.signUpForm}>
            <ThemedText style={styles.title}>Create Patient Account</ThemedText>

            {/* Name Row */}
            <View style={styles.nameRow}>
              <View style={styles.halfInputContainer}>
                <TextInput
                  style={[styles.input, styles.halfInput, touched.firstName && errors.firstName ? styles.inputError : null]}
                  placeholder="First Name"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={(value) => handleFieldChange('firstName', value)}
                  onBlur={() => handleBlur('firstName')}
                  autoCapitalize="words"
                />
                <FieldError field="firstName" />
              </View>
              <View style={styles.halfInputContainer}>
                <TextInput
                  style={[styles.input, styles.halfInput, touched.lastName && errors.lastName ? styles.inputError : null]}
                  placeholder="Last Name"
                  placeholderTextColor="#999"
                  value={lastName}
                  onChangeText={(value) => handleFieldChange('lastName', value)}
                  onBlur={() => handleBlur('lastName')}
                  autoCapitalize="words"
                />
                <FieldError field="lastName" />
              </View>
            </View>

            {/* Username Input */}
            <TextInput
              style={[styles.input, touched.username && errors.username ? styles.inputError : null]}
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={(value) => handleFieldChange('username', value)}
              onBlur={() => handleBlur('username')}
              autoCapitalize="none"
            />
            <FieldError field="username" />

            {/* Email Input */}
            <TextInput
              style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(value) => handleFieldChange('email', value)}
              onBlur={() => handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FieldError field="email" />

            {/* Phone Number Input */}
            <TextInput
              style={[styles.input, touched.phone && errors.phone ? styles.inputError : null]}
              placeholder="Phone Number (Optional)"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={(value) => handleFieldChange('phone', value)}
              onBlur={() => handleBlur('phone')}
              keyboardType="phone-pad"
            />
            <FieldError field="phone" />

            {/* Date of Birth */}
            <TouchableOpacity 
              style={[styles.dateInput, touched.dateOfBirth && errors.dateOfBirth ? styles.inputError : null]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={styles.dateText}>
                {dateOfBirth.toLocaleDateString('en-US', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  year: 'numeric' 
                })}
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color="#21AEA8" />
            </TouchableOpacity>
            <FieldError field="dateOfBirth" />

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateOfBirth(selectedDate);
                    setTouched(prev => ({ ...prev, dateOfBirth: true }));
                    // Validate age when date changes
                    const ageError = validateAge();
                    setErrors(prev => ({ ...prev, dateOfBirth: ageError }));
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            {/* Gender Picker */}
            <View style={[styles.pickerContainer, touched.gender && errors.gender ? styles.inputError : null]}>
              <Picker
                selectedValue={gender}
                style={styles.picker}
                onValueChange={(itemValue) => {
                  setGender(itemValue);
                  setTouched(prev => ({ ...prev, gender: true }));
                  const error = validateField('gender', itemValue);
                  setErrors(prev => ({ ...prev, gender: error }));
                }}
                dropdownIconColor="#21AEA8"
              >
                <Picker.Item label="Select Gender" value="" color="#999" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
            <FieldError field="gender" />

            {/* Address Input */}
            <TextInput
              style={[styles.input, styles.addressInput, touched.address && errors.address ? styles.inputError : null]}
              placeholder="Complete Address *"
              placeholderTextColor="#999"
              value={address}
              onChangeText={(value) => handleFieldChange('address', value)}
              onBlur={() => handleBlur('address')}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
            <FieldError field="address" />

            {/* Password Input */}
            <View style={[styles.passwordContainer, touched.password && errors.password ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(value) => handleFieldChange('password', value)}
                onBlur={() => handleBlur('password')}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <ThemedText style={styles.showText}>
                  {showPassword ? 'HIDE' : 'SHOW'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            <FieldError field="password" />

            {/* Confirm Password Input */}
            <View style={[styles.passwordContainer, touched.confirmPassword && errors.confirmPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(value) => handleFieldChange('confirmPassword', value)}
                onBlur={() => handleBlur('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <ThemedText style={styles.showText}>
                  {showConfirmPassword ? 'HIDE' : 'SHOW'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            <FieldError field="confirmPassword" />

            {/* Create Account Button */}
            <TouchableOpacity 
              style={[styles.signUpButton, isLoading && styles.disabledButton]} 
              activeOpacity={0.8}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.signUpButtonText}>CREATE PATIENT ACCOUNT</ThemedText>
              )}
            </TouchableOpacity>

            {/* Debug: Show form state (remove in production) */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.debugButton} 
                onPress={() => {
                  console.log('📝 Form State Debug:');
                  console.log('  firstName:', firstName);
                  console.log('  lastName:', lastName);
                  console.log('  username:', username);
                  console.log('  email:', email);
                  console.log('  phone:', phone);
                  console.log('  address:', address);
                  console.log('  gender:', gender);
                  console.log('  dateOfBirth:', formatDateForAPI(dateOfBirth));
                  console.log('  password length:', password.length);
                  console.log('  confirmPassword matches:', password === confirmPassword);
                  
                  // Test validation
                  validateForm();
                }}
              >
                <ThemedText style={styles.debugButtonText}>🐛 Debug Form State</ThemedText>
              </TouchableOpacity>
            )}

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <ThemedText style={styles.signInText}>Already have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <ThemedText style={styles.signInLink}>Sign In</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#21AEA8', // Teal gradient background like web
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  centerLogo: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  signUpForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    letterSpacing: 0.5,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInputContainer: {
    width: '48%',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  halfInput: {
    width: '100%',
    marginBottom: 0,
  },
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginLeft: 4,
    flex: 1,
  },
  dateInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  showText: {
    color: '#21AEA8',
    fontSize: 12,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#21AEA8',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 25,
    shadowColor: '#21AEA8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  debugButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#666',
    fontSize: 14,
  },
  signInLink: {
    color: '#21AEA8',
    fontSize: 14,
    fontWeight: '600',
  },
});
