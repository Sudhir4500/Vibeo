import { View, Text, TouchableOpacity, ActivityIndicator, TouchableOpacityProps, StyleSheet } from 'react-native'
import React from 'react'
import { COLORS, SIZES } from '@/constants/theme'

interface FormButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
}

const FormButton = ({ title, loading, style, ...props }: FormButtonProps) => {
    return (
        <TouchableOpacity
            {...props}
            disabled={loading}
            style={[styles.button, loading && styles.disabledButton, style]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.primary,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        width: '100%',
        marginTop: SIZES.padding,
    },
    text: {
        color: COLORS.text,
        fontSize: SIZES.font,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
})
export default FormButton