import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,ActivityIndicator,FlatList,ImageBackground,} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { userAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Note } from '../../../types/notes';
import { toast } from '@/lib/toast';
import { Plus, Search, SquarePen, CopyX, ArrowLeft } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BgImage from '@/assets/images/red-colored-stationeries-potted-plant-white-background.jpg';

const safeParse = <T = any>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export default function CategoryNotes() {
  const { user } = userAuth();
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'desc' | 'asc'>('desc');

  const storageKey = user ? `notes:${user.email}` : 'notes:guest';

  useEffect(() => {
    if (user?.email) {
      fetchNotes();
    }
  }, [category, user?.email, sortBy]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const storedNotes = await AsyncStorage.getItem(storageKey);
      const allNotes: Note[] = safeParse<Note[]>(storedNotes, []);

      let filtered = [...allNotes];
      if (category && category !== 'all') {
        filtered = filtered.filter((n) => n.category === String(category));
      }

      filtered.sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return sortBy === 'asc' ? aDate - bDate : bDate - aDate;
      });

      setNotes(filtered);
    } catch (error) {
      toast.error('Failed to fetch notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const storedNotes = await AsyncStorage.getItem(storageKey);
      const allNotes: Note[] = safeParse<Note[]>(storedNotes, []);
      const updatedNotes = allNotes.filter((n) => n.id !== id);

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);

      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    const title = note.title?.toLowerCase() ?? '';
    const content = note.content?.toLowerCase() ?? '';
    return title.includes(query) || content.includes(query);
  });

  const getCategoryTitle = () => {
    if (!category || category === 'all') return 'All Notes';
    return String(category)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const renderNoteItem = ({ item: note }: { item: Note }) => (
    <Card style={styles.noteCard}>
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
            <Badge variant="secondary">{note.category}</Badge>
            <Text style={styles.noteDate}>
              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
            </Text>
            {note.edited_at && <Text style={styles.noteEdited}>(edited)</Text>}
          </View>
        </View>

        <View style={styles.noteActions}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/notes/edit/[id]' as const,
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
  );

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ImageBackground source={BgImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>{getCategoryTitle()}</Text>
            <Text style={styles.subtitle}>{filteredNotes.length} notes</Text>
          </View>

          <Button
            size="icon"
            onPress={() => router.push('/notes/new')}
            style={styles.addButton}
          >
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

        <View style={styles.sortContainer}>
          <TouchableOpacity
            onPress={() => setSortBy('desc')}
            style={[styles.sortButton, sortBy === 'desc' && styles.sortButtonActive]}
          >
            <Text style={[styles.sortText, sortBy === 'desc' && styles.sortTextActive]}>
              Newest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('asc')}
            style={[styles.sortButton, sortBy === 'asc' && styles.sortButtonActive]}
          >
            <Text style={[styles.sortText, sortBy === 'asc' && styles.sortTextActive]}>
              Oldest
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No notes yet</Text>
              <Button
                onPress={() => router.push('/notes/new')}
                style={styles.createButton}
              >
                <View style={styles.buttonContent}>
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>Create your first note</Text>
                </View>
              </Button>
            </Card>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            renderItem={renderNoteItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    width: '100%', 
    height: '100%' },
  overlay: { 
    flex: 1, 
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { padding: 8, marginRight: 8 },
  headerContent: { flex: 1 },
  title: { fontSize: 24, fontWeight: 100, color: 'gray' },
  subtitle: { fontSize: 12, color: 'gray', marginTop: 2 },
  addButton: { marginLeft: 8 },

  searchContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 12,
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

  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  sortButtonActive: {
    backgroundColor: '#E3256B',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  sortTextActive: {
    color: '#ffffff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyCard: {
    width: '100%',
    padding: 32,
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

  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  noteCard: {
    marginBottom: 12,
    padding: 16,
  },
  noteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
});
