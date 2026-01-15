import React from 'react';
import { Home, Search, Library, ChevronDown, Play, Pause, SkipForward, SkipBack,Music,EllipsisVertical,ChevronLeft,Heart} from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface IconProps {
    color?: string;
    size?: number;
    fill?: string;
}

export const HomeIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Home size={size} color={color} />
);

export const HomeIconFilled = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Home size={size} color={color} />
);

export const SearchIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Search size={size} color={color} />
);

export const SearchIconFilled = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Search size={size} color={color} />
);

export const LibraryIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Library size={size} color={color} />
);

export const LibraryIconFilled = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Library size={size} color={color} />
);

export const ChevronDownIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <ChevronDown size={size} color={color} />
);

export const PlayIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Play size={size} color={color} fill={color} />
);

export const PauseIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Pause size={size} color={color} fill={color} />
);

export const SkipForwardIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <SkipForward size={size} color={color} fill={color} />
);

export const SkipBackIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <SkipBack size={size} color={color} fill={color} />
);
export const MusicIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <Music size={size} color={color} />
);

export const EllipsisVerticalIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <EllipsisVertical size={size} color={color} />
);
export const ChevronLeftIcon = ({ color = COLORS.primary, size = 24 }: IconProps) => (
    <ChevronLeft size={size} color={color} />
);
export const HeartIcon = ({ 
    color = COLORS.primary, 
    size = 24, 
    fill = "none" 
}: IconProps) => (
    <Heart 
        size={size} 
        color={color} 
        fill={fill} 
        strokeWidth={fill !== "none" ? 0 : 2}  // Remove stroke when filled
    />
);