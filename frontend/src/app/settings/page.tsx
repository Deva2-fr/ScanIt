"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { AuthHeader } from "@/components/auth-header"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Lock, Mail, Save } from "lucide-react"
import { ApiKeysManager } from "@/components/settings/api-keys-manager"

// --- Validation Schemas ---

const profileSchema = z.object({
    full_name: z.string().optional(),
    email: z.string().email("Email invalide").min(1, "L'email est requis"),
})

const passwordSchema = z.object({
    current_password: z.string().min(1, "Le mot de passe actuel est requis"),
    new_password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

// --- Components ---

function ProfileForm() {
    const { user, refreshUser } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || "",
            email: user?.email || "",
        },
    })

    // Start with fresh data when user loads
    useEffect(() => {
        if (user) {
            reset({
                full_name: user.full_name || "",
                email: user.email || "",
            })
        }
    }, [user, reset])

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
            const token = localStorage.getItem('access_token')

            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || "Erreur lors de la mise à jour")
            }

            const updatedUser = await response.json()
            toast.success("Profil mis à jour avec succès")

            // Update local context
            await refreshUser()

        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Mes Informations
                </CardTitle>
                <CardDescription>
                    Mettez à jour vos informations personnelles
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nom complet</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="full_name"
                                placeholder="Votre nom"
                                className="pl-9"
                                {...register("full_name")}
                            />
                        </div>
                        {errors.full_name && (
                            <p className="text-sm text-red-500">{errors.full_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="votre@email.com"
                                className="pl-9"
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            "Enregistrement..."
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer les modifications
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

function PasswordForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    })

    const onSubmit = async (data: PasswordFormValues) => {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
            const token = localStorage.getItem('access_token')

            const response = await fetch(`${API_BASE_URL}/api/users/me/password`, {
                method: "POST", // Using POST as defined in backend schema
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || "Erreur lors du changement de mot de passe")
            }

            toast.success("Mot de passe modifié avec succès")
            reset() // Clear form
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    Sécurité
                </CardTitle>
                <CardDescription>
                    Changez votre mot de passe pour sécuriser votre compte
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Mot de passe actuel</Label>
                        <Input
                            id="current_password"
                            type="password"
                            placeholder="••••••••"
                            {...register("current_password")}
                        />
                        {errors.current_password && (
                            <p className="text-sm text-red-500">{errors.current_password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new_password">Nouveau mot de passe</Label>
                        <Input
                            id="new_password"
                            type="password"
                            placeholder="Min. 8 caractères"
                            {...register("new_password")}
                        />
                        {errors.new_password && (
                            <p className="text-sm text-red-500">{errors.new_password.message}</p>
                        )}
                    </div>

                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                        {isSubmitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

// --- Main Page ---

export default function SettingsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login")
        }
    }, [user, loading, router])

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-black pt-24 px-4 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <AuthHeader />
            <div className="pt-8 px-4 pb-12">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
                            Paramètres du compte
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez votre profil et vos préférences de sécurité
                        </p>
                    </div>

                    <div className="grid gap-8">
                        <ProfileForm />
                        <PasswordForm />
                        <ApiKeysManager />
                    </div>
                </div>
            </div>
        </div>
    )
}
