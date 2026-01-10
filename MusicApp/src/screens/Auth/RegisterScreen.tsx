import { View, Text, Alert, ScrollView, StyleSheet, TextInput, Button } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { COLORS, SIZES } from '@/constants/theme'
import FormInput from '@/components/form/FormInput'
import FormButton from '@/components/form/FormButton'

const RegisterScreen = () => {
    const { registerUser, isLoading } = useAuth()
    const [values, setValues] = useState({
        username: "",
        email: "",
        password: ""
    })

    const handleRegister = async () => {
        if (!values.email || !values.password || !values.username) {
            Alert.alert("Error", "All fields are required")
            return
        }
        const result = await registerUser(values)
        console.log("Registration result:", JSON.stringify(result, null, 2))
        if (!result.success) {
            Alert.alert("Registration Error", result.message || result.error || "Something went wrong")
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Register</Text>
                <FormInput
                    label='Username'
                    value={values.username}
                    onChangeText={(text) => setValues({ ...values, username: text })}
                    placeholder='Username'
                    autoCapitalize='none'
                />
                <FormInput
                    label='Email'
                    value={values.email}
                    onChangeText={(text) => setValues({ ...values, email: text })}
                    placeholder='Enter your email'
                    autoCapitalize='none'
                    keyboardType='email-address'
                />
                <FormInput
                    label='Password'
                    value={values.password}
                    onChangeText={(text) => setValues({ ...values, password: text })}
                    placeholder='Password'
                    autoCapitalize='none'
                    secureTextEntry
                />

                <FormButton
                    title='Register'
                    onPress={handleRegister}
                    loading={isLoading}
                />
            </View>

        </ScrollView>
    )
}

export default RegisterScreen

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.primary,
        padding: SIZES.padding,
        justifyContent: "center",
        alignItems: "center"

    },
    form: {
        width: "100%",
        padding: SIZES.padding,
        borderRadius: '10px',
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        fontSize: 24,
        color: COLORS.text,
        fontWeight: "bold",
        textAlign: "center",
    }
})