"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Mail, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function UserProfile() {
    const { user, logout, isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Not Authenticated</CardTitle>
                    <CardDescription>Please sign in to view your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Link href="/login">
                        <Button className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register">
                        <Button variant="outline" className="w-full">Create Account</Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    const getInitials = (name?: string, email?: string) => {
        if (name) {
            return name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return email ? email[0].toUpperCase() : 'U'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-blue-500">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-semibold">
                                {getInitials(user.full_name, user.email)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">
                                {user.full_name || 'User Profile'}
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                Your account information
                            </CardDescription>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>

                    {user.full_name && (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
                                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                                <p className="font-medium">{user.full_name}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
                            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Member Since</p>
                            <p className="font-medium">{formatDate(user.created_at)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-md">
                            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Account Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge
                                    variant={user.is_active ? "default" : "secondary"}
                                    className={user.is_active ? "bg-green-500" : ""}
                                >
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
