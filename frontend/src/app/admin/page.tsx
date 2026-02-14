"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AuthHeader } from "@/components/auth-header" // Imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Users, Activity, BarChart3, ShieldAlert, Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// --- Types ---

interface AdminUser {
    id: number
    email: string
    full_name: string | null
    created_at: string
    is_superuser: boolean
    scan_count: number
}

interface AdminScan {
    id: number
    url: string
    score: number
    created_at: string
    user_email: string
}

interface AdminStats {
    total_users: number
    total_scans: number
    average_score: number
}

// --- Page Component ---

export default function AdminDashboard() {
    const { user, isAuthenticated, loading } = useAuth()
    const router = useRouter()

    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [scans, setScans] = useState<AdminScan[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)

    // --- Actions ---

    const handleDeleteUser = async (userId: number) => {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
            const token = localStorage.getItem('access_token')

            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || "Failed to delete user")
            }

            toast.success("User deleted successfully")
            // Refresh data
            fetchAdminData()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    // --- Columns Definition (Moved inside component to access delete handler) ---

    const userColumns: ColumnDef<AdminUser>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("id")}</span>,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{user.email}</span>
                        {user.full_name && <span className="text-xs text-muted-foreground">{user.full_name}</span>}
                    </div>
                )
            }
        },
        {
            accessorKey: "is_superuser",
            header: "Rôle",
            cell: ({ row }) => (
                row.getValue("is_superuser") ? (
                    <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20">Admin</Badge>
                ) : (
                    <Badge variant="outline">Utilisateur</Badge>
                )
            ),
        },
        {
            accessorKey: "created_at",
            header: "Inscrit le",
            cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
        },
        {
            accessorKey: "scan_count",
            header: "Scans",
            cell: ({ row }) => <Badge variant="secondary">{row.getValue("scan_count")}</Badge>,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const isSelf = user?.id === row.original.id

                if (isSelf) return null // Cannot delete self

                return (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Cela supprimera définitivement l'utilisateur
                                    <span className="font-bold text-white"> {row.original.email} </span>
                                    et toutes ses données associées (historique de scans).
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-zinc-700 hover:bg-zinc-800 hover:text-white">Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteUser(row.original.id)
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )
            }
        }
    ]

    const scanColumns: ColumnDef<AdminScan>[] = [
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString(),
        },
        {
            accessorKey: "user_email",
            header: "Utilisateur",
        },
        {
            accessorKey: "url",
            header: "Site Scanné",
            cell: ({ row }) => (
                <a href={row.original.url} target="_blank" rel="noreferrer" className="max-w-[300px] truncate block text-blue-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                    {row.original.url}
                </a>
            )
        },
        {
            accessorKey: "score",
            header: "Score",
            cell: ({ row }) => {
                const score = row.getValue("score") as number
                // Normalize if needed
                const normalizedScore = score > 100 ? Math.round(score / 100) : score

                let colorClass = "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20"
                if (normalizedScore >= 90) colorClass = "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20"
                else if (normalizedScore >= 70) colorClass = "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                else if (normalizedScore >= 50) colorClass = "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20"

                return <Badge className={`${colorClass} border`}>{normalizedScore}</Badge>
            },
        },
    ]


    useEffect(() => {
        // 1. Protect Route
        if (!loading) {
            if (!isAuthenticated || !user?.is_superuser) {
                router.push("/") // Redirect non-admins
            } else {
                fetchAdminData()
            }
        }
    }, [loading, isAuthenticated, user, router])

    const fetchAdminData = async () => {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
            const token = localStorage.getItem('access_token')
            const headers = { 'Authorization': `Bearer ${token}` }

            // Parallel fetching
            const [statsRes, usersRes, scansRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/admin/stats`, { headers }),
                fetch(`${API_BASE_URL}/api/admin/users`, { headers }),
                fetch(`${API_BASE_URL}/api/admin/scans`, { headers })
            ])

            if (statsRes.ok) setStats(await statsRes.json())
            if (usersRes.ok) setUsers(await usersRes.json())
            if (scansRes.ok) setScans(await scansRes.json())

        } catch (error) {
            console.error("Failed to fetch admin data", error)
        } finally {
            setIsLoadingData(false)
        }
    }

    if (loading || isLoadingData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user?.is_superuser) return null // Prevent flash

    return (
        <div className="min-h-screen bg-black">
            {/* Added AuthHeader here */}
            <AuthHeader />
            <div className="p-8 pt-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ShieldAlert className="text-purple-500" />
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Vue d'ensemble et gestion de la plateforme
                        </p>
                    </div>

                    {/* KPIs */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Total Utilisateurs</CardTitle>
                                <Users className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats?.total_users || 0}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Total Scans</CardTitle>
                                <Activity className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats?.total_scans || 0}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Score Moyen</CardTitle>
                                <BarChart3 className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats?.average_score || 0}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs Content */}
                    <Tabs defaultValue="users" className="space-y-4">
                        <TabsList className="bg-zinc-900 border-zinc-800">
                            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                            <TabsTrigger value="scans">Historique Global</TabsTrigger>
                        </TabsList>

                        <TabsContent value="users" className="space-y-4">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle>Liste des Utilisateurs</CardTitle>
                                    <CardDescription>Gérez les membres de la plateforme</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable columns={userColumns} data={users} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="scans" className="space-y-4">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle>Historique des Scans</CardTitle>
                                    <CardDescription>Tous les audits effectués sur la plateforme</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={scanColumns}
                                        data={scans}
                                        onRowClick={(row) => router.push(`/?audit_id=${row.id}`)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
