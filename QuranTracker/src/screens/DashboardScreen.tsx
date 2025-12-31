import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Dashboard</Text>
      <Text variant="bodyMedium">Welcome to Quran Tracker!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default DashboardScreen;
