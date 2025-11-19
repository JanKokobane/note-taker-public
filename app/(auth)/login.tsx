import { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,ImageBackground,} from 'react-native';
import { router } from 'expo-router';
import { Loader2, Mail, User, Lock, Eye, EyeOff } from 'lucide-react-native';
import { userAuth } from '@/contexts/AuthContext';
import React from 'react';
import BgImage from '../../assets/images/rm435-019.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, register } = userAuth();

  const isValidEmail = (email: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('All fields are required');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setSuccessMessage('Login successful!');
      router.replace('/(tabs)');
    } catch (error: any) {
      setErrorMessage(error.message || 'User not found or wrong password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password || !username) {
      setErrorMessage('All fields are required');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    const register = async (email: string, username: string, password: string) => {
      const usersString = await AsyncStorage.getItem("users");
      let users = usersString ? JSON.parse(usersString) : [];
    
      const exists = users.find((u: any) => u.email === email);
      if (exists) throw new Error("Email already registered");
    
      const newUser = { email, username, password };
      users.push(newUser);
    
      await AsyncStorage.setItem("users", JSON.stringify(users));

      return true;
    };
    
  };

  return (
    <ImageBackground source={BgImage} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Notes Journal</Text>
              <Text style={styles.subtitle}>Your personal note-taking companion</Text>
            </View>

            {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, !isSignUp && styles.tabActive]}
                onPress={() => setIsSignUp(false)}
              >
                <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, isSignUp && styles.tabActive]}
                onPress={() => setIsSignUp(true)}
              >
                <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color="#666" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your username"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                  {!username && <Text style={styles.errorText}>Username is required</Text>}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#666" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {email && !isValidEmail(email) && (
                  <Text style={styles.errorText}>Invalid email format</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#666" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={18} color="#666" style={styles.iconRight} />
                    ) : (
                      <Eye size={18} color="#666" style={styles.iconRight} />
                    )}
                  </TouchableOpacity>
                </View>
                {password && password.length < 8 && (
                  <Text style={styles.errorText}>Password must be at least 8 characters</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={isSignUp ? handleSignUp : handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={20} color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isSignUp ? 'Sign Up' : 'Login'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    width: '100%', 
    height: '100%' 
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(245,245,245,0.8)' 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 32, 
    width: '100%' 
  },
  title: { 
    fontSize: 30, 
    fontWeight: '300', 
    marginBottom: 8, 
    color: 'gray' 
  },
  subtitle: { 
    fontSize: 12, 
    color: '#666' 
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabs: { 
    flexDirection: 'row', 
    marginBottom: 24, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 50, 
    padding: 4 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 50 
  },
  tabActive: { 
    backgroundColor: '#fff' 
  },
  tabText: { 
    fontSize: 12, 
    color: '#666' 
  },
  tabTextActive: { 
    color: 'gray', 
    fontWeight: '600' 
  },
  form: { 
    gap: 16 
  },
  inputGroup: { 
    gap: 8 
  },
  label: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: 'gray' 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: { 
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  icon: { 
    marginRight: 8,
  },
  iconRight: { 
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#E3256B',
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: 'green',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});
