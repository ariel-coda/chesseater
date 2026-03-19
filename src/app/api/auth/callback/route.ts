// src/app/api/auth/callback/route.ts
// Cette route est appelée automatiquement par Supabase après
// une authentification Google réussie. Elle échange le "code"
// temporaire contre une vraie session utilisateur.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)

    // Supabase envoie un "code" temporaire dans l'URL
    // ex: /api/auth/callback?code=xyz123
    const code = searchParams.get('code')

    // Si pas de code → quelque chose s'est mal passé
    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=no_code`)
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignoré si appelé depuis un Server Component statique
                    }
                },
            },
        }
    )

    // On échange le code temporaire contre une session réelle
    // Supabase crée le cookie de session automatiquement
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error('Callback error:', error.message)
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Session créée → on redirige vers le dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
}