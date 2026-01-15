import FormButton from '@/components/form/FormButton'
import FormInput from '@/components/form/FormInput'
import { COLORS } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import React, { useState } from 'react'
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { AuthStackParamList } from '@/types/navigation'

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
    const { loginUser, isLoading } = useAuth()
    // manage state
    const [values, setValues] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState({
        email: "",
        password: ""
    });
    const navigation = useNavigation<LoginScreenNavigationProp>()

    /**
     * function for handle changes
     */
    const handleChange = (name: string, value: string) => {
        setValues((prev) => ({
            ...prev,
            [name]: value // dynamic property name it help to update specific property
        }))
        //clear the error as soon as user start typing
        if (error[name as keyof typeof error]) {
            setError((prev) => ({
                ...prev,
                [name]: ""
            }))
        }
    };
    /**
     * validate the form data
     */
    const validate = () => {
        let isValid = true;
        // defining error object as empty
        const newError = {
            email: "",
            password: ""
        }
        // validate email
        if (!values.email) {
            isValid = false;
            newError.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            isValid = false;
            newError.email = "Invalid email format";
        }
        // validate password
        if (!values.password) {
            isValid = false;
            newError.password = "Password is required";
        } else if (values.password.length < 4) {
            isValid = false;
            newError.password = "Password must be at least 4 characters long";
        }
        setError(newError);
        return isValid;
    }
    /**
     * funtion to handle login 
     */
    const handleLogin = async () => {
        if (validate()) {
            const result = await loginUser(values);
            console.log(result)
            if (!result.success) {
                Alert.alert("Error", result.message || "Something went wrong")
            }

        }
    };


    return (
        <KeyboardAvoidingView style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Welcome Back </Text>
                <Text style={styles.subtitle}>Login to your account</Text>
                <View>
                    <FormInput
                        label='Email'
                        value={values.email}
                        onChangeText={(text) => handleChange('email', text)}
                        placeholder='Enter your email'
                        autoCapitalize='none'
                        // keyboardType='email-address'
                        error={error.email}
                    />
                    <FormInput
                        label='Password'
                        value={values.password}
                        onChangeText={(text) => handleChange('password', text)}
                        placeholder='Enter your password'
                        autoCapitalize='none'
                        secureTextEntry
                        error={error.password}
                    />
                    <FormButton
                        title='Login'
                        onPress={handleLogin}
                        loading={isLoading}
                    />
                </View>
                <Text style={styles.registerText}>Don't have an account?</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Register")}
                >
                    <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
            </ScrollView>

        </KeyboardAvoidingView>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.primary,
        fontWeight: "bold",
        textAlign: "center",
        alignContent: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        color: COLORS.text,
        fontWeight: "bold",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginBottom: 40,
        marginTop: 10,
    },
    form: {
        width: "100%",

    },
    registerText: {
        textAlign: "center",
        color: COLORS.textSecondary,
    },
    registerLink: {
        color: COLORS.primary,
        fontWeight: "bold",

    }
})