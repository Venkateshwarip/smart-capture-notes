import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';

import { getRecord, insertRecord, updateRecord } from '../db/database';
import { deleteImage, pickImage } from '../services/imageService';
import SafeImage from '../components/SafeImage';
import CategoryChips from '../components/CategoryChips';
import Header from '../components/Header';
import { CATEGORIES, colors, shared } from '../theme';

// Used for both creating (no recordId) and editing (recordId set).
export default function EditScreen({ recordId, navigate }) {
  const editing = !!recordId;
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const originalImage = useRef(null);
  const pendingImage = useRef(null); // picked but not saved yet
  const saved = useRef(false);

  const goBack = () =>
    navigate(editing ? { name: 'detail', id: recordId } : { name: 'home' });

  useEffect(() => {
    if (editing) {
      getRecord(recordId)
        .then((r) => {
          if (!r) return navigate({ name: 'home' });
          setTitle(r.title);
          setNotes(r.notes);
          setCategory(r.category);
          setImageFile(r.image_file);
          originalImage.current = r.image_file;
          setLoading(false);
        })
        .catch(() => {
          Alert.alert('Error', 'Could not load this record.');
          navigate({ name: 'home' });
        });
    }
    // Remove an image that was picked but never saved
    return () => {
      if (!saved.current) deleteImage(pendingImage.current);
    };
  }, []);

  const choose = async (source) => {
    setBusy(true);
    try {
      const name = await pickImage(source);
      if (name) {
        deleteImage(pendingImage.current); // replace earlier unsaved pick
        pendingImage.current = name;
        setImageFile(name);
        setErrors((e) => ({ ...e, image: null }));
      }
    } catch (e) {
      Alert.alert('Image error', e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length > 100) errs.title = 'Title must be 100 characters or less';
    if (!imageFile) errs.image = 'Please add an image';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const data = { title: title.trim(), notes: notes.trim(), category, imageFile };
      if (editing) {
        await updateRecord(recordId, data);
        if (originalImage.current && originalImage.current !== imageFile) {
          deleteImage(originalImage.current);
        }
      } else {
        await insertRecord(data);
      }
      saved.current = true;
      goBack();
    } catch {
      Alert.alert('Error', 'Could not save the record. Please try again.');
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={shared.screen}>
        <Header title="Edit record" onBack={goBack} />
        <View style={shared.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </View>
    );
  }

  return (
    <View style={shared.screen}>
      <Header title={editing ? 'Edit record' : 'New record'} onBack={goBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View style={shared.content}>
            <View style={{ aspectRatio: 4 / 3, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E3E7E7' }}>
              {imageFile ? (
                <SafeImage fileName={imageFile} style={{ width: '100%', height: '100%' }} />
              ) : (
                <View style={shared.center}>
                  <Text style={{ fontSize: 36 }}>📷</Text>
                  <Text style={{ color: colors.muted }}>Add a photo below</Text>
                </View>
              )}
            </View>
            {errors.image ? <Text style={shared.errorText}>{errors.image}</Text> : null}

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity disabled={busy} style={[shared.button, { flex: 1, marginRight: 6 }]} onPress={() => choose('camera')}>
                <Text style={shared.buttonText}>📷 Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={busy} style={[shared.button, { flex: 1, marginLeft: 6 }]} onPress={() => choose('gallery')}>
                <Text style={shared.buttonText}>🖼️ Gallery</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ marginTop: 16, marginBottom: 4, fontWeight: '600' }}>Title *</Text>
            <TextInput
              style={shared.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Electricity bill"
              maxLength={100}
            />
            {errors.title ? <Text style={shared.errorText}>{errors.title}</Text> : null}

            <Text style={{ marginTop: 16, marginBottom: 4, fontWeight: '600' }}>Category</Text>
            <View style={{ marginHorizontal: -12 }}>
              <CategoryChips options={CATEGORIES} selected={category} onSelect={setCategory} />
            </View>

            <Text style={{ marginTop: 12, marginBottom: 4, fontWeight: '600' }}>Notes</Text>
            <TextInput
              style={[shared.input, { minHeight: 110, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              multiline
              maxLength={2000}
            />

            <TouchableOpacity disabled={busy} style={[shared.button, { marginTop: 20, opacity: busy ? 0.6 : 1 }]} onPress={save}>
              {busy ? <ActivityIndicator color="#fff" /> : (
                <Text style={shared.buttonText}>{editing ? 'Save changes' : 'Save record'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
