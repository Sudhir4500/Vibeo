import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '@/types/navigation';
import LoginScreen from '@/screens/Auth/LoginScreen'
import RegisterScreen from '@/screens/Auth/RegisterScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);