import React, { useEffect, useState } from 'react';
import { BackHandler, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import EditScreen from './src/screens/EditScreen';
import DetailScreen from './src/screens/DetailScreen';
import { colors } from './src/theme';

// Simple state-based navigation: { name: 'home' | 'detail' | 'edit', id? }
export default function App() {
  const [route, setRoute] = useState({ name: 'home' });

  // Android hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home') return false; // let the OS exit the app
      if (route.name === 'edit' && route.id) setRoute({ name: 'detail', id: route.id });
      else setRoute({ name: 'home' });
      return true;
    });
    return () => sub.remove();
  }, [route]);

  let screen;
  if (route.name === 'edit') screen = <EditScreen recordId={route.id} navigate={setRoute} />;
  else if (route.name === 'detail') screen = <DetailScreen recordId={route.id} navigate={setRoute} />;
  else screen = <HomeScreen navigate={setRoute} />;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
        {screen}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
