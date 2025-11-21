import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { userAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from '@/lib/toast';
import { Save } from 'lucide-react-native';

export default function Profile() {
  const { user, setUser } = userAuth(); 
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user?.email]);

  const fetchProfile = async () => {
    if (!user?.email) return;
    try {
      const usersString = await AsyncStorage.getItem("users");
      const users = usersString ? JSON.parse(usersString) : [];
      const found = users.find((u: any) => u.email === user.email);
      if (found) {
        setUsername(found.username || '');
      } else {
        setUsername('');
      }
    } catch {
      toast.error('Failed to load profile');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.email) return;
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const usersString = await AsyncStorage.getItem("users");
      let users = usersString ? JSON.parse(usersString) : [];

      users = users.map((u: any) =>
        u.email === user.email ? { ...u, username: username.trim() } : u
      );

      await AsyncStorage.setItem("users", JSON.stringify(users));
      await AsyncStorage.setItem("currentUser", JSON.stringify({ email: user.email, username }));

      setUser({ ...user, username: username.trim() });

      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user?.email) return;
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const usersString = await AsyncStorage.getItem("users");
      let users = usersString ? JSON.parse(usersString) : [];

      const found = users.find((u: any) => u.email === user.email);
      if (!found) {
        toast.error('User not found');
        setLoading(false);
        return;
      }

      if (found.password) {
        if (!currentPassword.trim()) {
          toast.error('Please enter your current password');
          setLoading(false);
          return;
        }
        if (found.password !== currentPassword) {
          toast.error('Current password is incorrect');
          setLoading(false);
          return;
        }
        if (found.password === newPassword) {
          toast.error('New password cannot be the same as the old password');
          setLoading(false);
          return;
        }
      }

      users = users.map((u: any) =>
        u.email === user.email ? { ...u, password: newPassword } : u
      );

      await AsyncStorage.setItem("users", JSON.stringify(users));
      await AsyncStorage.setItem("currentUser", JSON.stringify({ email: user.email, username: found.username }));

      // Force logout
      setUser(null);
      toast.success('Password updated successfully. Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      router.replace('/login');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile Settings</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <View style={styles.form}>
            <View style={styles.field}>
              <Label>Email</Label>
              <Input value={user?.email || ''} editable={false} />
            </View>
            <View style={styles.field}>
              <Label>Username</Label>
              <Input value={username} onChangeText={setUsername} />
            </View>
            <Button
              onPress={handleUpdateProfile}
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Save size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>Update Profile</Text>
                </View>
              )}
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <View style={styles.form}>
            <View style={styles.field}>
              <Label>Current Password</Label>
              <Input
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.field}>
              <Label>New Password</Label>
              <Input
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.field}>
              <Label>Confirm Password</Label>
              <Input
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            <Button
              onPress={handleUpdatePassword}
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Save size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>Update Password</Text>
                </View>
              )}
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: {
    padding: 16,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: { marginBottom: 24, marginTop: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  card: { marginBottom: 24, padding: 24 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  form: { gap: 16 },
  field: { gap: 8 },
  submitButton: { marginTop: 8 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});
