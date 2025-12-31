import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const CalendarScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Calendar</Text>
      <Text variant="bodyMedium">View your reading plan</Text>
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

export default CalendarScreen;
