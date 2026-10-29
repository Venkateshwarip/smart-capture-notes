import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, ScrollView, Share, Text,
  TouchableOpacity, View,
} from 'react-native';
import * as Sharing from 'expo-sharing';

import { deleteRecord, getRecord } from '../db/database';
import { deleteImage, getImageUri, imageExists } from '../services/imageService';
import SafeImage from '../components/SafeImage';
import Header from '../components/Header';
import { colors, shared } from '../theme';

export default function DetailScreen({ recordId, navigate }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(false);

  const goHome = () => navigate({ name: 'home' });

  useEffect(() => {
    getRecord(recordId)
      .then((r) => (r ? setRecord(r) : goHome()))
      .catch(() => setError('Could not load this record.'))
      .finally(() => setLoading(false));
  }, [recordId]);

  const remove = () =>
    Alert.alert('Delete record?', `"${record.title}" and its image will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(record.id);
            deleteImage(record.image_file);
            goHome();
          } catch {
            Alert.alert('Error', 'Could not delete the record.');
          }
        },
      },
    ]);

  const shareImage = async () => {
    try {
      if (!imageExists(record.image_file)) return Alert.alert('Export', 'The image file is missing.');
      if (!(await Sharing.isAvailableAsync())) return Alert.alert('Export', 'Sharing is not available on this device.');
      await Sharing.shareAsync(getImageUri(record.image_file));
    } catch {
      Alert.alert('Error', 'Could not share the image.');
    }
  };

  const shareText = async () => {
    try {
      await Share.share({
        title: record.title,
        message: `${record.title}\nCategory: ${record.category}\n\n${record.notes}`,
      });
    } catch {
      Alert.alert('Error', 'Could not share the notes.');
    }
  };

  const exportRecord = () =>
    Alert.alert('Export record', 'What would you like to share?', [
      { text: 'Image', onPress: shareImage },
      { text: 'Title + notes', onPress: shareText },
      { text: 'Cancel', style: 'cancel' },
    ]);

  if (loading || error || !record) {
    return (
      <View style={shared.screen}>
        <Header title="Record" onBack={goHome} />
        <View style={shared.center}>
          {error ? <Text>{error}</Text> : <ActivityIndicator size="large" color={colors.primary} />}
        </View>
      </View>
    );
  }

  return (
    <View style={shared.screen}>
      <Header
        title="Record"
        onBack={goHome}
        actions={[
          { label: 'Export', onPress: exportRecord },
          { label: 'Edit', onPress: () => navigate({ name: 'edit', id: record.id }) },
          { label: 'Delete', onPress: remove },
        ]}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={shared.content}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setZoom(true)}>
            <SafeImage
              fileName={record.image_file}
              style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 12 }}
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 16, color: colors.text }}>
            {record.title}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>
            {record.category} • Updated {new Date(record.updated_at).toLocaleString()}
          </Text>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
          <Text style={{ fontSize: 16, lineHeight: 23, color: colors.text }}>
            {record.notes ? record.notes : 'No notes.'}
          </Text>
        </View>
      </ScrollView>

      <Modal visible={zoom} transparent animationType="fade" onRequestClose={() => setZoom(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setZoom(false)}
          style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
          <SafeImage fileName={record.image_file} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
