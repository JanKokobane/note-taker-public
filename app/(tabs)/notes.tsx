import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,ActivityIndicator,ImageBackground,} from 'react-native';
import { useRouter } from 'expo-router';
import { userAuth } from "@/contexts/AuthContext"; 
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Search, SquarePen, CopyX } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import BgImage from '@/assets/images/red-colored-stationeries-potted-plant-white-background.jpg';

interface Note {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  category?: string;
  created_at: string;
  edited_at?: string;
}

// helper to safely parse JSON
const safeParse = <T = any>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export default function Notes() {
  const { user } = userAuth(); 
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    if (!user?.email) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const storageKey = `notes:${user.email}`;
      const storedNotes = await AsyncStorage.getItem(storageKey);
      const allNotes: Note[] = safeParse<Note[]>(storedNotes, []);
      const sorted = allNotes.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotes(sorted);
    } catch (error) {
      console.error('Failed to fetch notes', error);
      alert('Failed to fetch notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!user?.email) return;
    try {
      const storageKey = `notes:${user.email}`;
      const storedNotes = await AsyncStorage.getItem(storageKey);
      const allNotes: Note[] = safeParse<Note[]>(storedNotes, []);
      const updatedNotes = allNotes.filter(n => n.id !== id);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedNotes));
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete note', error);
      alert('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.content.toLowerCase().includes(searchLower) ||
      (note.title && note.title.toLowerCase().includes(searchLower))
    );
  });

  return (
    <ImageBackground source={BgImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>All Notes</Text>
              <Text style={styles.subtitle}>{filteredNotes.length} notes</Text>
            </View>

            <Button size="icon" onPress={() => router.push('/notes/new' as any)}>
              <Plus size={20} color="#ffffff" />
            </Button>
          </View>

          <View style={styles.searchContainer}>
            <Search size={16} color="#9ca3af" style={styles.searchIcon} />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : filteredNotes.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No notes yet</Text>
              <Button
                onPress={() => router.push('/notes/new' as any)}
                style={styles.createButton}
              >
                <View style={styles.buttonContent}>
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>Create your first note</Text>
                </View>
              </Button>
            </Card>
          ) : (
            <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
              {filteredNotes.map(note => (
                <Card key={note.id} style={styles.noteCard}>
                  <View style={styles.noteContent}>
                    <View style={styles.noteBody}>
                      {note.title && (
                        <Text style={styles.noteTitle} numberOfLines={1}>
                          {note.title}
                        </Text>
                      )}
                      <Text style={styles.noteText} numberOfLines={2}>
                        {note.content}
                      </Text>

                      <View style={styles.noteMeta}>
                        {note.category && (
                          <Badge variant="secondary">{note.category}</Badge>
                        )}
                        <Text style={styles.noteDate}>
                          {formatDistanceToNow(new Date(note.created_at), {
                            addSuffix: true,
                          })}
                        </Text>
                        {note.edited_at && (
                          <Text style={styles.noteEdited}>(edited)</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: '/notes/edit/[id]',
                            params: { id: note.id },
                          })
                        }
                        style={styles.actionButton}
                      >
                        <SquarePen size={20} color="#6b7280" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(note.id)}
                        style={styles.actionButton}
                      >
                        <CopyX size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    
                  </View>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>
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
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 100,
    color: 'gray',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 36,
    borderRadius: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    marginBottom: 16,
    fontSize: 14,
  },
  createButton: {
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  notesList: {
    flex: 1,
  },
  noteCard: {
    marginBottom: 12,
    padding: 16,
  },
  noteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  noteBody: {
    flex: 1,
    gap: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  noteText: {
    fontSize: 14,
    color: '#6b7280',
    maxWidth: '95%',
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  noteDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noteEdited: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
});
