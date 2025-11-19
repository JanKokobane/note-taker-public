import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import BgImage from '../assets/images/rm435-019.jpg';

export default function NotFound() {
  return (
    <ImageBackground source={BgImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>

      <TouchableOpacity 
      style={styles.backButton} 
      onPress={() => router.replace('/(auth)/login')} 
    >
      <ArrowLeft size={26} color="#fff" />
    </TouchableOpacity>


        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>
          This page doesn't exist. Tap the arrow to return.
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
  },
  errorCode: {
    fontSize: 80,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    maxWidth: 280,
  },
});
