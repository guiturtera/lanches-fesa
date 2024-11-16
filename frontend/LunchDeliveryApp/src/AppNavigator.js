import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importar as telas existentes
import StudentScreen from './screens/StudentScreen';
import LunchPermissionScreen from './screens/LunchPermissionScreen';
import DeliveryScreen from './screens/DeliveryScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Estudantes') {
              iconName = 'people';
            } else if (route.name === 'Permissões') {
              iconName = 'clipboard';
            } else if (route.name === 'Entregas') {
              iconName = 'cube';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4caf50',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: '#121212', borderTopWidth: 0 },
          headerStyle: { backgroundColor: '#121212' },
          headerTitleStyle: { color: '#fff' },
        })}
      >
        <Tab.Screen name="Estudantes" component={StudentScreen} />
        <Tab.Screen name="Permissões" component={LunchPermissionScreen} />
        {/* <Tab.Screen name="Entregas" component={DeliveryScreen} /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
