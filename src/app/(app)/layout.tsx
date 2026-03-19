// src/app/(app)/layout.tsx
// Ce layout enveloppe toutes les pages protégées :
// dashboard, games, coach, progress, settings
// Il vérifie la session côté serveur et redirige si nécessaire

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
    // children = la page enfant (dashboard, coach, etc.)
    // React.ReactNode = n'importe quel contenu React valide
}) {

    const supabase = await createServerSupabaseClient()

    // Vérifie la session côté serveur
    // getUser() est plus sécurisé que getSession() —
    // il vérifie le token auprès de Supabase à chaque fois
    // getSession() lui lit juste le cookie local sans vérifier
    const { data: { user } } = await supabase.auth.getUser()

    // Pas de session → retour au login
    // redirect() de Next.js arrête l'exécution immédiatement
    if (!user) {
        redirect('/login')
    }

    // Récupère le profil complet depuis la table profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    // .single() = on attend exactement un résultat
    // si aucun profil trouvé → data sera null

    // Pour l'instant le layout affiche juste les pages enfants
    // On ajoutera la Navbar et la Sidebar quand on codera l'UI du dashboard
    return (
        <div className="min-h-screen bg-zinc-950">
            {/* 
        On passe le profil aux pages via les props plus tard
        Pour l'instant on rend juste children pour valider le flux
      */}
            {children}
        </div>
    )
}