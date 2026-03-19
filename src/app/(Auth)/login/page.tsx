// src/app/(auth)/login/page.tsx

'use client'
// 'use client' signifie que ce composant tourne dans le navigateur
// Obligatoire ici car on utilise useState et des événements (onClick, onChange)

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    // ── État du formulaire ──────────────────────────────────
    // useState = une variable qui, quand elle change, met à jour l'affichage
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)   // true pendant une requête
    const [error, setError] = useState<string | null>(null)  // message d'erreur

    // ── Connexion Email + Mot de passe ──────────────────────
    async function handleEmailLogin(e: React.FormEvent) {
        e.preventDefault()  // empêche le rechargement de la page (comportement par défaut d'un form)
        setLoading(true)
        setError(null)  // on efface l'erreur précédente à chaque tentative

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            // On traduit les erreurs Supabase en français
            setError(error.message === 'Invalid login credentials'
                ? 'Email ou mot de passe incorrect.'
                : 'Une erreur est survenue. Réessaie.'
            )
            setLoading(false)
            return
        }

        // Connexion réussie → on redirige vers le dashboard
        router.push('/dashboard')
        router.refresh()  // force Next.js à relire la session
    }

    // ── Connexion Google OAuth ──────────────────────────────
    async function handleGoogleLogin() {
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
                // Après auth Google, Supabase renvoie vers cette route
                // qui finalise la session et redirige vers /dashboard
            },
        })

        if (error) {
            setError('Erreur avec Google. Réessaie.')
            setLoading(false)
        }
        // Pas de router.push ici — Google redirige automatiquement
    }

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // ── Rendu de la page ────────────────────────────────────
    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            {/*
        min-h-screen  = occupe toute la hauteur de l'écran
        bg-zinc-950   = fond très sombre (colle avec le logo fond noir)
        flex + items-center + justify-center = centre le contenu
      */}

            <div className="w-full max-w-md">

                {/* ── Logo + Nom ── */}
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/logo-greatmentor.png"
                        alt="GreatMentor logo"
                        width={160}
                        height={160}
                        className="mb-3"
                    />
                    <h1 className="text-white text-3xl font-bold tracking-wide">
                        Connexion
                    </h1>
                    <p className="text-zinc-400 text-sm mt-2 text-center">
                        Continue à relever de nouveaux défis et à affûter ta stratégie avec GreatMentor.
                    </p>
                </div>

                {/* ── Carte formulaire ── */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

                    {/* Message d'erreur — visible uniquement si error !== null */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    {/* ── Formulaire email/password ── */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        {/* space-y-4 = espacement vertical entre chaque enfant */}

                        <div>
                            <label className="block text-zinc-400 text-sm mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                // e.target.value = ce que l'utilisateur a tapé
                                placeholder="toi@exemple.com"
                                required
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-zinc-400 text-sm mb-1.5">
                                Mot de passe
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="text-zinc-500 text-xs mt-1.5 underline cursor-pointer hover:text-orange-500 transition-colors"
                            >
                                {showPassword ? "Masquer le mot de passe" : "Voir le mot de passe"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    {/* ── Séparateur ── */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-zinc-500 text-xs">ou</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    {/* ── Bouton Google ── */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="cursor-pointer w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
                    >
                        {/* SVG officiel Google */}
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z" />
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
                        </svg>
                        Continuer avec Google
                    </button>

                    {/* ── Lien vers inscription ── */}
                    <p className="text-center text-zinc-500 text-sm mt-6">
                        Pas encore de compte ?{' '}
                        <Link
                            href="/register"
                            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                        >
                            S'inscrire
                        </Link>
                    </p>

                </div>
            </div>
        </main>
    )
}