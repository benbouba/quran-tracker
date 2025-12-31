/**
 * Quran Tracker - Main App Component
 * 
 * This is the entry point of the application.
 * Sets up theming, navigation, and global providers.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from '@/navigation/AppNavigator';

// Custom theme with primary color #1a5e1a
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1a5e1a',
    primaryContainer: '#a5d6a7',
    secondary: '#4a7c59',
    secondaryContainer: '#c8e6c9',
  },
};

function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
