"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LanguageSwitcher } from '@/components/language-switcher'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, Shield, History, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AuthHeader() {
    const { user, logout, isAuthenticated } = useAuth()
    const router = useRouter()

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

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            SiteAuditor
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <Link
                            href="/"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/monitoring"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                        >
                            Monitoring
                        </Link>
                        <Link
                            href="/dashboard/leads"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                        >
                            Leads (Agency)
                        </Link>
                        {isAuthenticated && (
                            <Link
                                href="/profile"
                                className="text-foreground/60 hover:text-foreground transition-colors"
                            >
                                Profile
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />

                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10 border-2 border-blue-500">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                            {getInitials(user.full_name, user.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium leading-none">
                                                {user.full_name || 'User'}
                                            </p>
                                            {user.is_superuser && (
                                                <span className="inline-flex items-center rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-500">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                {user.is_superuser && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin" className="cursor-pointer">
                                            <Shield className="mr-2 h-4 w-4 text-purple-500" />
                                            <span>Administration</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
