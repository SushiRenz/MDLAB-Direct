import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    console.log('🔐 Drawer Layout - Auth Status:', { isAuthenticated, isLoading, hasUser: !!user });
  }, [isAuthenticated, isLoading, user]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#21AEA8' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔐 Drawer Layout - Not authenticated, redirecting to login');
    return <Redirect href="/login" />;
  }

  console.log('🔐 Drawer Layout - User authenticated, rendering drawer');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerActiveTintColor: '#21AEA8',
          drawerInactiveTintColor: '#666',
          drawerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShown: false,
          headerStyle: {
            backgroundColor: '#21AEA8',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            drawerLabel: 'Dashboard',
            title: 'Dashboard',
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="appointments"
          options={{
            drawerLabel: 'Appointments',
            title: 'Appointments',
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="results"
          options={{
            drawerLabel: 'Results',
            title: 'Results',
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="mobile-lab"
          options={{
            drawerLabel: 'Mobile Lab',
            title: 'Mobile Lab',
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="car" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Profile',
            title: 'Profile',
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
