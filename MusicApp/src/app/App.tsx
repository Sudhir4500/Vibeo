import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar, StyleSheet, Text } from 'react-native';
import { TabNavigator } from '@/navigation/TabNavigator';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { COLORS } from '@/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';

const AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: COLORS.background,
    },
};

const App = () => {
    // Logic: If token is null, show Auth. If token exists, show Tabs.
    const token = useAuthStore((state) => state.token);

    return (
        <SafeAreaProvider style={{ flex: 1, }}>
            <NavigationContainer theme={AppTheme}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                {token ? (
                    <TabNavigator />
                ) : (
                    <AuthNavigator />
                )}
            </NavigationContainer>
        </SafeAreaProvider>
    );
};

export default App;