import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function NotFound() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/Index'); 
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>404erro! This page doesn't exist. Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
    },
  text: { 
    fontSize: 16, 
    color: '#333' 
    },
});
