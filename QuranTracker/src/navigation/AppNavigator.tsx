/**
 * App Navigator
 * 
 * Main navigation structure with Bottom Tab Navigator and nested Stack Navigator
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import DashboardScreen from '@/screens/DashboardScreen';
import GoalSetupScreen from '@/screens/GoalSetupScreen';
import CalendarScreen from '@/screens/CalendarScreen';
import SettingsScreen from '@/screens/SettingsScreen';

// Navigation types
export type RootTabParamList = {
  Dashboard: undefined;
  Plan: undefined;
  Settings: undefined;
};

export type PlanStackParamList = {
  GoalSetup: undefined;
  CalendarView: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const PlanStack = createStackNavigator<PlanStackParamList>();

/**
 * Plan Stack Navigator
 * Nested inside the Plan tab
 */
const PlanStackNavigator = () => {
  const theme = useTheme();
  
  return (
    <PlanStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <PlanStack.Screen
        name="GoalSetup"
        component={GoalSetupScreen}
        options={{ title: 'Set Goal' }}
      />
      <PlanStack.Screen
        name="CalendarView"
        component={CalendarScreen}
        options={{ title: 'Reading Plan' }}
      />
    </PlanStack.Navigator>
  );
};

/**
 * Bottom Tab Navigator
 * Main app navigation
 */
const TabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanStackNavigator}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book-open-page-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * App Navigator
 * Root navigation component
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
