import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { shared } from '../theme';

export default function Header({ title, onBack, actions = [] }) {
  return (
    <View style={shared.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={shared.headerBtn}>
          <Text style={shared.headerBtnText}>← Back</Text>
        </TouchableOpacity>
      )}
      <Text style={shared.headerTitle} numberOfLines={1}>{title}</Text>
      {actions.map((a) => (
        <TouchableOpacity key={a.label} onPress={a.onPress} style={shared.headerBtn}>
          <Text style={shared.headerBtnText}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
