import { AuthHeader } from '@/components/auth-header'
import { UserProfile } from '@/components/user-profile'
import { ScanHistory } from '@/components/scan-history'

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            <AuthHeader />
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                            My Profile
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Manage your account information and settings
                        </p>
                    </div>

                    <UserProfile />
                    <ScanHistory />
                </div>
            </main>
        </div>
    )
}
