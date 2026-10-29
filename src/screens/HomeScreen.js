import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';

import { deleteRecord, getCategoryCounts, getRecords } from '../db/database';
import { deleteImage } from '../services/imageService';
import SafeImage from '../components/SafeImage';
import CategoryChips from '../components/CategoryChips';
import Header from '../components/Header';
import { CATEGORIES, colors, shared } from '../theme';

export default function HomeScreen({ navigate }) {
  const [records, setRecords] = useState([]);
  const [counts, setCounts] = useState({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  const load = useCallback(async (q, c) => {
    try {
      const [rows, cnt] = await Promise.all([
        getRecords({ query: q, category: c }),
        getCategoryCounts(),
      ]);
      setRecords(rows);
      setCounts(cnt);
      setError(null);
    } catch {
      setError('Could not load records. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Debounced reload when search text or category changes
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(query, category), 250);
    return () => clearTimeout(timer.current);
  }, [query, category, load]);

  const confirmDelete = (r) =>
    Alert.alert('Delete record?', `"${r.title}" and its image will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(r.id);
            deleteImage(r.image_file);
            load(query, category);
          } catch {
            Alert.alert('Error', 'Could not delete the record.');
          }
        },
      },
    ]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row', backgroundColor: colors.card, marginHorizontal: 12,
        marginVertical: 5, padding: 10, borderRadius: 12, alignItems: 'center',
      }}
      onPress={() => navigate({ name: 'detail', id: item.id })}
      onLongPress={() => confirmDelete(item)}
    >
      <SafeImage fileName={item.image_file} style={{ width: 60, height: 60, borderRadius: 8 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: colors.muted, marginTop: 2 }}>
          {item.category} • {new Date(item.updated_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  let body;
  if (loading) {
    body = <View style={shared.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  } else if (error) {
    body = (
      <View style={shared.center}>
        <Text>{error}</Text>
        <TouchableOpacity style={[shared.button, { marginTop: 12, paddingHorizontal: 24 }]} onPress={() => load(query, category)}>
          <Text style={shared.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    body = (
      <FlatList
        data={records}
        keyExtractor={(r) => String(r.id)}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(query, category); }}
        contentContainerStyle={{ paddingBottom: 90, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={shared.center}>
            <Text style={{ textAlign: 'center', color: colors.muted }}>
              {query || category
                ? 'No records match your search.'
                : 'No records yet.\nTap "+ New" to capture your first photo.'}
            </Text>
          </View>
        }
      />
    );
  }

  return (
    <View style={shared.screen}>
      <Header title="Smart Capture" />
      <View style={shared.content}>
        <TextInput
          style={[shared.input, { margin: 12, marginBottom: 4 }]}
          placeholder="Search title or notes"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        <CategoryChips
          options={CATEGORIES}
          selected={category}
          onSelect={setCategory}
          counts={counts}
          allLabel="All"
        />
        {body}
        <TouchableOpacity
          onPress={() => navigate({ name: 'edit' })}
          style={{
            position: 'absolute', right: 16, bottom: 20, backgroundColor: colors.primary,
            paddingHorizontal: 22, paddingVertical: 14, borderRadius: 30, elevation: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>+ New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
