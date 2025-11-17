import {useEffect} from 'react'
import {Stack} from 'expo-router'
import {StatusBar} from 'expo-status-bar'
import {userFrameworkReady} from '../hooks/useFrameworkReady'
import {AuthProvider} from '../contexts/AuthContext'

export default function RootLayout() {
    userFrameworkReady();

    return (
        <AuthProvider>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="(auth)" />

                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </AuthProvider>
    )
}