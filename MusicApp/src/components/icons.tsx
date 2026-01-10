import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

interface IconProps {
    color?: string;
    size?: number;
}

export const HomeIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Icon name="home-outline" size={size} color={color} />
);

export const HomeIconFilled = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Icon name="home" size={size} color={color} />
);

export const SearchIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Icon name="search-outline" size={size} color={color} />
);

export const SearchIconFilled = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Icon name="search" size={size} color={color} />
);

export const LibraryIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Icon name="library-outline" size={size} color={color} />
);

export const LibraryIconFilled = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Icon name="library" size={size} color={color} />
);