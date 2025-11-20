import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { userAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  BriefcaseBusiness,
  NotebookPen,
  FileUser,
  Heart,
} from 'lucide-react-native';
import { NoteCategory } from '@/types/note';
import BgImage from '@/assets/images/red-colored-stationeries-potted-plant-white-background.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const categoryConfig: Record<
  NoteCategory,
  { icon: any; gradient: string; label: string }
> = {
  work: { icon: BriefcaseBusiness, gradient: '#ef4444', label: 'Work' },
  study: { icon: NotebookPen, gradient: '#3b82f6', label: 'Study' },
  personal: { icon: FileUser, gradient: '#8b5cf6', label: 'Personal' },
  finance: { icon: FileText, gradient: '#ef4444', label: 'Finance' },
  health: { icon: Heart, gradient: '#3b82f6', label: 'Health' },
  learning: { icon: FileText, gradient: '#8b5cf6', label: 'Learning' },
  other: { icon: FileText, gradient: '#ef4444', label: 'Other' },
};

export default function Dashboard() {
  const { user, logout } = userAuth();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || '');

  // Fetch updated profile from AsyncStorage whenever Dashboard comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        if (!user?.email) return;
        try {
          const stored = await AsyncStorage.getItem(`profile:${user.email}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            setUsername(parsed.username || user?.username || '');
          }
        } catch (error) {
          console.log('Failed to load profile:', error);
        }
      };
      fetchProfile();
    }, [user?.email])
  );

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const mainCategories: NoteCategory[] = ['work', 'study', 'personal'];

  return (
    <ImageBackground source={BgImage} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Notes Journal</Text>
              <Text style={styles.subtitle}>
                Hi {username || 'Guest'} Welcome back!
              </Text>
            </View>
          </View>

          <View style={styles.categoriesContainer}>
            {mainCategories.map((category) => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => router.push(`/notes/category/${category}` as any)}
                >
                  <Card
                    style={[
                      styles.categoryCard,
                      { backgroundColor: config.gradient },
                    ]}
                  >
                    <View style={styles.categoryContent}>
                      <View style={styles.iconContainer}>
                        <Icon size={24} color="#ffffff" />
                      </View>
                      <View>
                        <Text style={styles.categoryLabel}>{config.label}</Text>
                        <Text style={styles.categorySubtext}>View all notes</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            onPress={() => router.push('/notes' as any)}
            size="lg"
            style={styles.allNotesButton}
          >
            <View style={styles.buttonContent}>
              <FileText size={20} color="#ffffff" />
              <Text style={styles.buttonText}>View All Notes</Text>
            </View>
          </Button>

          <Button
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  scrollContent: { flex: 1 },
  overlay: {
    flex: 1,
    padding: 16,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  title: { fontSize: 26, fontWeight: '100', color: 'gray' },
  subtitle: { fontSize: 16, color: 'gray', marginTop: 4 },
  categoriesContainer: { gap: 16, marginBottom: 32 },
  categoryCard: { padding: 24 },
  categoryContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 50,
  },
  categoryLabel: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  categorySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  allNotesButton: { marginBottom: 16 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600', borderRadius: 50 },
  logoutButton: { marginBottom: 32 },
});
