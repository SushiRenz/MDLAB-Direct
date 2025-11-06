import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface AppHeaderProps {
  title?: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.navbarLeft}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user?.username || 'Patient'
            }
          </ThemedText>
          <ThemedText style={styles.userRole}>Patient</ThemedText>
        </View>
      </View>
      <View style={styles.navbarRight}>
        <View style={styles.userAvatar}>
          <ThemedText style={styles.avatarText}>
            {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'P'}
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#21AEA8',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  navbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 16,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#21AEA8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  logoutButton: {
    padding: 6,
  },
});