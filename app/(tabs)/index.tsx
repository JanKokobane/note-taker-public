import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { userAuth } from '@/contexts/AuthContext';

export default function TabsIndex() {
  const { logout } = userAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/'); // This triggers index.tsx to redirect to /auth/login
    } catch (err) {
      console.error('Logout failed:', err);
      Alert.alert('Logout Error', 'Something went wrong while logging out.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tabs!</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
  button: {
    backgroundColor: '#E3256B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
