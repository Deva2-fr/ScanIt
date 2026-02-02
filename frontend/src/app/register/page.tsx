"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Mail, User, ArrowRight, Shield, Check } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const { register, login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Password strength indicator
    const getPasswordStrength = (pass: string): number => {
        let strength = 0
        if (pass.length >= 8) strength++
        if (pass.length >= 12) strength++
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++
        if (/\d/.test(pass)) strength++
        if (/[^a-zA-Z\d]/.test(pass)) strength++
        return strength
    }

    const passwordStrength = getPasswordStrength(password)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validation
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all required fields')
            setLoading(false)
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            await register(email, password, fullName || undefined)
            await login(email, password)
            router.push('/')
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950 dark:to-indigo-950 p-4">
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[size:32px_32px]" />

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-3 text-center pb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-base">
                        Join SiteAuditor and start analyzing websites
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-medium">
                                Full Name <span className="text-slate-400">(Optional)</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10 h-11"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address <span className="text-red-500">*</span>
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
                                Password <span className="text-red-500">*</span>
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

                            {/* Password strength indicator */}
                            {password && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength
                                                    ? passwordStrength <= 2
                                                        ? 'bg-red-500'
                                                        : passwordStrength <= 3
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                    : 'bg-slate-200 dark:bg-slate-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {passwordStrength <= 2 && 'Weak password'}
                                        {passwordStrength === 3 && 'Medium password'}
                                        {passwordStrength === 4 && 'Strong password'}
                                        {passwordStrength === 5 && 'Very strong password'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 h-11"
                                    required
                                    disabled={loading}
                                    minLength={8}
                                />
                                {confirmPassword && password === confirmPassword && (
                                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
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
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <Link href="/login">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                            >
                                Sign in instead
                            </Button>
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
