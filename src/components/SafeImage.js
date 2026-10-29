import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { getImageUri, imageExists } from '../services/imageService';
import { colors } from '../theme';

// Shows a placeholder instead of crashing when the image file is missing/corrupt.
export default function SafeImage({ fileName, style, resizeMode = 'cover' }) {
  const [failed, setFailed] = useState(false);

  if (!fileName || failed || !imageExists(fileName)) {
    return (
      <View
        style={[
          { backgroundColor: '#E3E7E7', alignItems: 'center', justifyContent: 'center' },
          style,
        ]}
      >
        <Text style={{ fontSize: 22 }}>🖼️</Text>
        <Text style={{ fontSize: 11, color: colors.muted }}>Image missing</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: getImageUri(fileName) }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
