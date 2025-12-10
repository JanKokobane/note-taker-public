// app/logout.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { userAuth } from '@/contexts/AuthContext';

export default function LogoutScreen() {
  const { logout } = userAuth();
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logout();
        router.replace('/(auth)/login'); 
      } catch (error) {
        console.log('Logout error:', error);
      }
    };
    doLogout();
  }, []);

  return null; 
}
