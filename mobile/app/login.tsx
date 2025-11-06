import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth(); // ✅ USE AUTH CONTEXT LIKE WEB
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = async () => {
    // Basic validation
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      // ✅ USE AUTH CONTEXT LOGIN - THIS STORES USER STATE PROPERLY
      const response = await login(username.trim(), password);

      if (response.success) {
        console.log('✅ Login successful, navigating to dashboard');
        // Navigate to dashboard - AuthContext already updated
        router.replace('/(drawer)/dashboard');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid username or password');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      Alert.alert(
        'Connection Error', 
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

          {/* Login Form */}
          <View style={styles.loginForm}>
            <ThemedText style={styles.title}>LOGIN</ThemedText>

            {/* Username Input */}
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me and Forgot Password */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <ThemedText style={styles.rememberMeText}>Remember me</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => {/* Handle forgot password */}}>
                <ThemedText style={styles.forgotPasswordText}>Forgot password?</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.disabledButton]} 
              activeOpacity={0.8}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.signInButtonText}>LOGIN</ThemedText>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <ThemedText style={styles.signUpText}>Don't have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.replace('/signup')}>
                <ThemedText style={styles.signUpLink}>Sign Up</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#21AEA8', // Teal gradient background like web
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
    marginBottom: 60,
  },
  centerLogo: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 75,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  loginForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#21AEA8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#21AEA8',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#21AEA8',
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#21AEA8',
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#21AEA8',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
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
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#666',
    fontSize: 14,
  },
  signUpLink: {
    color: '#21AEA8',
    fontSize: 14,
    fontWeight: '600',
  },
});
