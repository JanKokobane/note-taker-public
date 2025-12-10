import React, { useState } from 'react';
import {View,Text,StyleSheet,ScrollView,KeyboardAvoidingView,Platform,ActivityIndicator,TouchableOpacity,ImageBackground,} from 'react-native';
import { useRouter } from 'expo-router';
import { userAuth } from '@/contexts/AuthContext'; 
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { NoteCategory } from '../../types/notes';
import { toast } from '@/lib/toast';
import { ArrowLeft, Save } from 'lucide-react-native';
import { z } from 'zod';
import BgImage from '@/assets/images/red-colored-stationeries-potted-plant-white-background.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const noteSchema = z.object({
  title: z.string().max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be less than 10000 characters'),
  category: z.enum(['work','study','personal','finance','health','learning','other']),
});

const categories: { label: string; value: NoteCategory }[] = [
  { label: 'Work', value: 'work' },
  { label: 'Study', value: 'study' },
  { label: 'Personal', value: 'personal' },
  { label: 'Finance', value: 'finance' },
  { label: 'Health', value: 'health' },
  { label: 'Learning', value: 'learning' },
  { label: 'Other', value: 'other' },
];

// helper to safely parse JSON
const safeParse = <T = any>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export default function NoteForm() {
  const { user } = userAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'other' as NoteCategory,
  });

  const handleSubmit = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      noteSchema.parse(formData);

      const newNote = {
        id: uuidv4(),
        user_id: user.email,
        title: formData.title || '',
        content: formData.content,
        category: formData.category,
        created_at: new Date().toISOString(),
        edited_at: null,
      };
  
      const storageKey = `notes:${user.email}`;
      const storedNotes = await AsyncStorage.getItem(storageKey);
      const allNotes = safeParse<any[]>(storedNotes, []);
      const updatedNotes = [...allNotes, newNote];
  
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedNotes));
  
      toast.success('Note created successfully');
      router.back();
    } catch (err: any) {
      if (err.errors) {
        toast.error(err.errors[0].message);
      } else {
        toast.error('Failed to create note');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ImageBackground source={BgImage} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>New Note</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <View style={styles.form}>
              <View style={styles.field}>
                <Label style={styles.label}>Title (Optional)</Label>
                <Input
                  placeholder="Give your note a title..."
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.field}>
                <Label style={styles.label}>Category</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => setFormData({ ...formData, category: cat.value })}
                      style={[
                        styles.categoryButton,
                        formData.category === cat.value && styles.categoryButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          formData.category === cat.value && styles.categoryTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.field}>
                <Label style={styles.label}>Content</Label>
                <Input
                  placeholder="Write your note here..."
                  value={formData.content}
                  onChangeText={(text) => setFormData({ ...formData, content: text })}
                  multiline
                  numberOfLines={12}
                  style={styles.textarea}
                />
              </View>

              <Button onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Save size={16} color="#ffffff" />
                    <Text style={styles.buttonText}>Create Note</Text>
                  </View>
                )}
              </Button>
            </View>
          </Card>
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
    backgroundColor: 'rgba(255,255,255,0.85)' 
},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { 
    padding: 8 
},
  title: { 
    fontSize: 24, 
    fontWeight: '100', 
    color: 'gray' 
},
  label: { 
    color: 'gray' 
},
  placeholder: { 
    width: 36 
},
  scrollView: { 
    flex: 1 
},
  card: { 
    margin: 16, 
    padding: 24 
},
  form: { 
    gap: 24 
},
  field: { 
    gap: 8 
},
  categoryScroll: { 
    flexDirection: 'row' 
},
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    backgroundColor: '#ffffff',
  },
  categoryButtonActive: { 
    backgroundColor: '#E3256B' 
},
  categoryText: { 
    fontSize: 14, 
    color: 'gray', 
    fontWeight: '500' 
},
  categoryTextActive: { 
    color: '#ffffff' 
},
  textarea: { 
    height: 200, 
    textAlignVertical: 'top', 
    paddingTop: 12 
},
  submitButton: { 
    marginTop: 8 
},
  buttonContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
},
  buttonText: { 
    color: '#ffffff', 
    fontSize: 14, 
    fontWeight: '600' 
},
});
