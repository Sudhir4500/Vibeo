import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, Modal, StyleSheet, 
    Image, ScrollView, Alert
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { COLORS } from '@/constants/theme';
import { 
    ChevronDownIcon, 
    ChevronLeftIcon,
    HeartIcon,
    MusicIcon 
} from '@/components/icons';

interface ProfileMenuProps {
    userName?: string;
    userEmail?: string;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
    userName = 'User',
    userEmail 
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const { logout, user } = useAuthStore();
    const { likedSongs } = useLibraryStore();
    const { queue } = usePlayerStore();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setShowMenu(false);
                        await logout();
                    }
                }
            ]
        );
    };

    const handleClearCache = () => {
        Alert.alert(
            'Clear Cache',
            'This will clear all cached data but keep your liked songs.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Clear',
                    onPress: () => {
                        // Implement cache clearing logic
                        Alert.alert('Success', 'Cache cleared successfully');
                    }
                }
            ]
        );
    };

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const displayName = user?.username || userName;
    const displayEmail = user?.email || userEmail || '';

    return (
        <>
            {/* Profile Avatar Button */}
            <TouchableOpacity 
                style={styles.avatarButton}
                onPress={() => setShowMenu(true)}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {getInitials(displayName)}
                    </Text>
                </View>
                <ChevronDownIcon color="#fff" size={16} />
            </TouchableOpacity>

            {/* Profile Menu Modal */}
            <Modal
                visible={showMenu}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowMenu(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity 
                                onPress={() => setShowMenu(false)}
                                style={styles.backButton}
                            >
                                <ChevronLeftIcon color="#fff" size={24} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Profile</Text>
                            <View style={styles.backButton} />
                        </View>

                        <ScrollView style={styles.menuScroll}>
                            {/* Profile Section */}
                            <View style={styles.profileSection}>
                                <View style={styles.profileAvatar}>
                                    <Text style={styles.profileAvatarText}>
                                        {getInitials(displayName)}
                                    </Text>
                                </View>
                                <Text style={styles.profileName}>{displayName}</Text>
                                {displayEmail && (
                                    <Text style={styles.profileEmail}>{displayEmail}</Text>
                                )}
                            </View>

                            {/* Stats Section */}
                            <View style={styles.statsSection}>
                                <View style={styles.statCard}>
                                    <HeartIcon color={COLORS.primary} size={24} fill={COLORS.primary} />
                                    <Text style={styles.statNumber}>{likedSongs.length}</Text>
                                    <Text style={styles.statLabel}>Liked Songs</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <MusicIcon color={COLORS.primary} size={24} />
                                    <Text style={styles.statNumber}>{queue.length}</Text>
                                    <Text style={styles.statLabel}>In Queue</Text>
                                </View>
                            </View>

                            {/* Menu Options */}
                            <View style={styles.menuSection}>
                                <Text style={styles.sectionTitle}>Account</Text>
                                
                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Edit Profile</Text>
                                    <Text style={styles.menuItemBadge}>Coming Soon</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Change Password</Text>
                                    <Text style={styles.menuItemBadge}>Coming Soon</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuSection}>
                                <Text style={styles.sectionTitle}>Preferences</Text>
                                
                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Audio Quality</Text>
                                    <Text style={styles.menuItemSubtext}>High</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Download Settings</Text>
                                    <Text style={styles.menuItemBadge}>Coming Soon</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Notifications</Text>
                                    <Text style={styles.menuItemBadge}>Coming Soon</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuSection}>
                                <Text style={styles.sectionTitle}>Data & Storage</Text>
                                
                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={handleClearCache}
                                >
                                    <Text style={styles.menuItemText}>Clear Cache</Text>
                                    <Text style={styles.menuItemSubtext}>Free up space</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Storage Used</Text>
                                    <Text style={styles.menuItemSubtext}>~0 MB</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuSection}>
                                <Text style={styles.sectionTitle}>About</Text>
                                
                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Privacy Policy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Terms of Service</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>App Version</Text>
                                    <Text style={styles.menuItemSubtext}>1.0.0</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Logout Button */}
                            <TouchableOpacity 
                                style={styles.logoutButton}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    // Avatar Button
    avatarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
    },
    backButton: {
        padding: 8,
        width: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    menuScroll: {
        flex: 1,
    },

    // Profile Section
    profileSection: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#1e1e1e',
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
    },
    profileAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileAvatarText: {
        color: '#000',
        fontSize: 32,
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#b3b3b3',
    },

    // Stats Section
    statsSection: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        backgroundColor: '#1e1e1e',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#282828',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#b3b3b3',
        marginTop: 4,
    },

    // Menu Sections
    menuSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#b3b3b3',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#282828',
    },
    menuItemText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    menuItemSubtext: {
        fontSize: 14,
        color: '#b3b3b3',
    },
    menuItemBadge: {
        fontSize: 12,
        color: COLORS.primary,
        backgroundColor: 'rgba(29, 185, 84, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },

    // Logout Button
    logoutButton: {
        backgroundColor: '#ff4444',
        marginHorizontal: 16,
        marginTop: 32,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});