import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
}

const FormInput = ({ label, error, ...props }: FormInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.focusedInput,
                    error ? styles.errorInput : null
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor={COLORS.textSecondary || '#777'}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

export default FormInput;

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.padding,
        width: '100%',
    },
    label: {
        marginBottom: 8,
        fontSize: 14, // Standard label size
        fontWeight: '600',
        color: COLORS.text,
        letterSpacing: 0.5,
    },
    input: {
        // Use a surface color slightly lighter than deep black background
        backgroundColor: '#282828',
        color: COLORS.text,
        borderRadius: SIZES.borderRadius,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'transparent', // Keep layout stable
    },
    focusedInput: {
        borderColor: COLORS.primary,
        backgroundColor: '#333333', // Slightly lighter when typing
    },
    errorInput: {
        borderColor: COLORS.error,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    }
});