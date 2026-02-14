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
    // White Label Branding
    agency_name?: string
    brand_color?: string
    logo_url?: string
    // Billing
    plan_tier?: "starter" | "pro" | "agency"
    subscription_active?: boolean
    subscription_end_date?: string
    scans_count_today?: number
    last_scan_date?: string
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function getApiError(err: unknown): string {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
        const displayUrl = API_BASE_URL || 'proxy (port 8000)'
        if (typeof window !== 'undefined') {
            console.error('[Auth] API injoignable. URL utilisée:', displayUrl)
        }
        return `Impossible de joindre l'API (${displayUrl}). Vérifiez que le backend est démarré : cd backend && python run.py`
    }
    if (err instanceof Error) return err.message
    return 'Erreur réseau. Réessayez.'
}

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
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const error = await response.json();
                    throw new Error(error.message || error.detail || 'Login failed');
                } else {
                    const text = await response.text();
                    console.error('Non-JSON error response:', text);
                    throw new Error('Server error: ' + response.status + ' ' + response.statusText);
                }
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
            throw new Error(getApiError(error))
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
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const error = await response.json();
                    throw new Error(error.message || error.detail || 'Registration failed');
                } else {
                    const text = await response.text();
                    console.error('Non-JSON error response:', text);
                    throw new Error('Server error: ' + response.status + ' ' + response.statusText);
                }
            }

            // Verification is now required
            // We'll redirect to verification page in the component
            // await login(email, password)
        } catch (error) {
            console.error('Registration error:', error)
            throw new Error(getApiError(error))
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
