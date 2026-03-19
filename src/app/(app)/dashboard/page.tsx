// Server Component — fetch les données puis passe au client
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './dashboardClient'

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Les 5 dernières parties
    const { data: recentGames } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(5)

    return (
        <DashboardClient
            profile={profile}
            recentGames={recentGames ?? []}
        />
    )
}