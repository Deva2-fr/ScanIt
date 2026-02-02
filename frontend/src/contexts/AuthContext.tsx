"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

// Types
interface User {
    id: number
    email: string
    full_name?: string
    is_active: boolean
    is_superuser?: boolean
    created_at: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, fullName?: string) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
    refreshUser: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token')

        if (!token) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                // Token invalid, clearit
                localStorage.removeItem('access_token')
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('access_token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Login failed')
            }

            const data = await response.json()

            // Store token
            localStorage.setItem('access_token', data.access_token)

            // Fetch user data
            const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`
                }
            })

            if (userResponse.ok) {
                const userData = await userResponse.json()
                setUser(userData)
            }
        } catch (error) {
            throw error
        }
    }

    const register = async (email: string, password: string, fullName?: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Registration failed')
            }

            // Verification is now required
            // We'll redirect to verification page in the component
            // await login(email, password)
        } catch (error) {
            console.error('Registration error:', error)
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                refreshUser: checkAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}
