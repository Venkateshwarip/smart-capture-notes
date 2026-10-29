import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

// Horizontal chips. `counts` is optional (used as the simple dashboard).
export default function CategoryChips({ options, selected, onSelect, counts, allLabel }) {
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;
  const items = allLabel ? [{ value: null, label: allLabel + (total !== null ? ` (${total})` : '') }] : [];
  options.forEach((c) =>
    items.push({ value: c, label: c + (counts ? ` (${counts[c] || 0})` : '') })
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 6 }}
    >
      {items.map((it) => {
        const active = selected === it.value;
        return (
          <TouchableOpacity
            key={String(it.value)}
            onPress={() => onSelect(it.value)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: active ? colors.primary : '#fff',
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: active ? '#fff' : colors.text }}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
