import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/screens/HomeScreen';
import SearchScreen from '@/screens/Home/SearchScreen';
import LibraryScreen from '@/screens/LibraryScreen';
import { COLORS } from '@/constants/theme';
import { BottomTabParamList } from '@/types/navigation';
import {
    HomeIcon, HomeIconFilled,
    SearchIcon, SearchIconFilled,
    LibraryIcon, LibraryIconFilled
} from '../components/icons';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopWidth: 0,
                    height: 65,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarIcon: ({ focused, color, size }) => {
                    switch (route.name) {
                        case 'Home':
                            return focused ? <HomeIconFilled color={color} size={size} /> : <HomeIcon color={color} size={size} />;
                        case 'Search':
                            return focused ? <SearchIconFilled color={color} size={size} /> : <SearchIcon color={color} size={size} />;
                        case 'Library':
                            return focused ? <LibraryIconFilled color={color} size={size} /> : <LibraryIcon color={color} size={size} />;
                        default: return null;
                    }
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
        
        </Tab.Navigator>
    );
};