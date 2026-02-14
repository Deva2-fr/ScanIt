"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Mail, ArrowRight, Shield, Wifi, WifiOff } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const API_LABEL = API_BASE_URL || 'proxy → :8000'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [apiReachable, setApiReachable] = useState<boolean | null>(null)

    useEffect(() => {
        let cancelled = false
        fetch(`${API_BASE_URL}/api/health`)
            .then(() => { if (!cancelled) setApiReachable(true) })
            .catch(() => { if (!cancelled) setApiReachable(false) })
        return () => { cancelled = true }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Basic validation
        if (!email || !password) {
            setError('Please fill in all fields')
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            setLoading(false)
            return
        }

        try {
            await login(email, password)
            router.push('/') // Redirect to home after successful login
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[size:32px_32px]" />

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-3 text-center pb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sign in to your SiteAuditor account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {apiReachable === false && (
                        <Alert variant="destructive" className="mb-4">
                            <WifiOff className="h-4 w-4" />
                            <AlertDescription>
                                Backend injoignable ({API_LABEL}). Démarrez-le : <code className="text-xs bg-black/10 px-1 rounded">cd backend && python run.py</code>
                            </AlertDescription>
                        </Alert>
                    )}
                    {apiReachable === true && (
                        <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                            <Wifi className="h-4 w-4 text-green-600" />
                            <AlertDescription>API connectée ({API_LABEL})</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11"
                                    required
                                    disabled={loading}
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                                    Don't have an account?
                                </span>
                            </div>
                        </div>

                        <Link href="/register">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                            >
                                Create an Account
                            </Button>
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
