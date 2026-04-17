import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ClientsScreen from '../screens/ClientsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import AdminScreen from '../screens/AdminScreen';
import { RootStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#16324f',
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#16324f',
        tabBarInactiveTintColor: '#7b8794',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIconStyle: {
          display: 'none',
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'Produkty' }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{ title: 'Klienci' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Zamówienia' }}
      />
      <Tab.Screen
        name="Admin"
        component={AdminScreen}
        options={{ title: 'Admin' }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#16324f',
          },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
          options={{ title: 'Szczegóły zamówienia' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
