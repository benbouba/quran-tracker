import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const GoalSetupScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Goal Setup</Text>
      <Text variant="bodyMedium">Set your Quran reading goal</Text>
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

export default GoalSetupScreen;
