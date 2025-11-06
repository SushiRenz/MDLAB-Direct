import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#9CEEBE', '#21AEA8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/mdlab-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      
      <TouchableOpacity 
        onPress={() => router.replace('/login')}
        activeOpacity={0.8}
        style={styles.button}
      >
        <ThemedText style={styles.buttonText}>Let's get started</ThemedText>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#21AEA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#21AEA8',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
