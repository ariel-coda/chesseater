'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Tables } from '@/lib/types/database'

type FormData = {
    username: string
    email: string
    password: string
    chessComUsername: string
    lichessUsername: string
    reasons: string[]
    heardFrom: string[]
}

const REGEX = {
    username: /^[a-zA-Z0-9_-]{3,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/,
    chessUsername: /^[a-zA-Z0-9_-]{3,30}$/,
}

const REASONS = [
    "Je veux progresser et monter en Elo",
    "J'aimerais analyser mes parties en détail",
    "Je veux suivre ma progression dans le temps",
    "Je cherche un coaching personnalisé",
    "Je veux juste explorer et découvrir",
]

const HEARD_FROM = [
    "Bouche à oreille",
    "Réseaux sociaux",
    "Google",
    "YouTube",
    "Un ami joueur d'échecs",
    "Un LLM (ChatGPT, Claude...)",
]

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [cachedChessData, setCachedChessData] = useState<Partial<Tables<'profiles'>> | null>(null)
    const [cachedLichessData, setCachedLichessData] = useState<Partial<Tables<'profiles'>> | null>(null)

    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
        chessComUsername: '',
        lichessUsername: '',
        reasons: [],
        heardFrom: [],
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function updateField(field: keyof FormData, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    function toggleCheckbox(field: 'reasons' | 'heardFrom', value: string, max: number) {
        setFormData(prev => {
            const current = prev[field]
            if (current.includes(value)) return { ...prev, [field]: current.filter(v => v !== value) }
            if (current.length >= max) return prev
            return { ...prev, [field]: [...current, value] }
        })
    }

    function validateStep1(): string | null {
        if (!formData.username.trim()) return "Le nom d'utilisateur est requis."
        if (!REGEX.username.test(formData.username)) return "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, - et _ (3 à 20 caractères)."
        if (!formData.email.trim()) return "L'email est requis."
        if (!REGEX.email.test(formData.email)) return "L'adresse email n'est pas valide."
        if (!formData.password) return "Le mot de passe est requis."
        if (!REGEX.password.test(formData.password)) return "Le mot de passe doit faire au moins 8 caractères, avec une majuscule, un chiffre et un caractère spécial."
        return null
    }

    async function validateStep2(): Promise<string | null> {
        if (!formData.chessComUsername.trim() && !formData.lichessUsername.trim())
            return "Renseigne au moins un compte Chess.com ou Lichess."

        if (formData.chessComUsername && !REGEX.chessUsername.test(formData.chessComUsername))
            return "Le nom Chess.com n'est pas valide."

        if (formData.lichessUsername && !REGEX.chessUsername.test(formData.lichessUsername))
            return "Le nom Lichess n'est pas valide."

        // ── Chess.com : profil + stats en 2 appels ──────────────
        if (formData.chessComUsername) {
            const [profileRes, statsRes] = await Promise.all([
                fetch(`https://api.chess.com/pub/player/${formData.chessComUsername.toLowerCase()}`),
                fetch(`https://api.chess.com/pub/player/${formData.chessComUsername.toLowerCase()}/stats`),
            ])

            if (!profileRes.ok)
                return `Le compte Chess.com "${formData.chessComUsername}" n'existe pas.`

            const profile = await profileRes.json()
            const stats = statsRes.ok ? await statsRes.json() : null

            setCachedChessData({
                // Profil
                chess_com_title: profile?.title ?? null,
                chess_com_avatar: profile?.avatar ?? null,
                chess_com_followers: profile?.followers ?? null,
                chess_com_country: profile?.country?.split('/').pop() ?? null, // ex: "FR"
                chess_com_last_online: profile?.last_online
                    ? new Date(profile.last_online * 1000).toISOString()
                    : null,
                chess_com_joined: profile?.joined
                    ? new Date(profile.joined * 1000).toISOString()
                    : null,
                // Elo actuels
                chess_com_bullet_elo: stats?.chess_bullet?.last?.rating ?? null,
                chess_com_blitz_elo: stats?.chess_blitz?.last?.rating ?? null,
                chess_com_rapid_elo: stats?.chess_rapid?.last?.rating ?? null,
                chess_com_classical_elo: stats?.chess_daily?.last?.rating ?? null,
                // Meilleurs Elo
                chess_com_bullet_best_elo: stats?.chess_bullet?.best?.rating ?? null,
                chess_com_blitz_best_elo: stats?.chess_blitz?.best?.rating ?? null,
                chess_com_rapid_best_elo: stats?.chess_rapid?.best?.rating ?? null,
                // Records W/L/D
                chess_com_bullet_wins: stats?.chess_bullet?.record?.win ?? null,
                chess_com_bullet_losses: stats?.chess_bullet?.record?.loss ?? null,
                chess_com_bullet_draws: stats?.chess_bullet?.record?.draw ?? null,
                chess_com_blitz_wins: stats?.chess_blitz?.record?.win ?? null,
                chess_com_blitz_losses: stats?.chess_blitz?.record?.loss ?? null,
                chess_com_blitz_draws: stats?.chess_blitz?.record?.draw ?? null,
                chess_com_rapid_wins: stats?.chess_rapid?.record?.win ?? null,
                chess_com_rapid_losses: stats?.chess_rapid?.record?.loss ?? null,
                chess_com_rapid_draws: stats?.chess_rapid?.record?.draw ?? null,
                // Tactics & Puzzle Rush
                chess_com_tactics_highest: stats?.tactics?.highest?.rating ?? null,
                chess_com_puzzle_rush_best: stats?.puzzle_rush?.best?.score ?? null,
            })
        }

        // ── Lichess : tout en 1 seul appel ──────────────────────
        if (formData.lichessUsername) {
            const res = await fetch(
                `https://lichess.org/api/user/${formData.lichessUsername.toLowerCase()}`
            )

            if (!res.ok)
                return `Le compte Lichess "${formData.lichessUsername}" n'existe pas.`

            const data = await res.json()
            const perfs = data?.perfs
            const count = data?.count

            setCachedLichessData({
                // Profil
                lichess_title: data?.title ?? null,
                lichess_bio: data?.profile?.bio ?? null,
                lichess_country: data?.profile?.country ?? null,
                lichess_followers: data?.nbFollowers ?? null,
                lichess_playing_time: data?.playTime?.total ?? null,
                // Stats globales
                lichess_games_total: count?.all ?? null,
                lichess_games_wins: count?.win ?? null,
                lichess_games_losses: count?.loss ?? null,
                lichess_games_draws: count?.draw ?? null,
                // Elo par time control
                lichess_bullet_elo: perfs?.bullet?.rating ?? null,
                lichess_blitz_elo: perfs?.blitz?.rating ?? null,
                lichess_rapid_elo: perfs?.rapid?.rating ?? null,
                lichess_classical_elo: perfs?.classical?.rating ?? null,
                lichess_correspondence_elo: perfs?.correspondence?.rating ?? null,
                // Nombre de parties par time control
                lichess_bullet_games: perfs?.bullet?.games ?? null,
                lichess_blitz_games: perfs?.blitz?.games ?? null,
                lichess_rapid_games: perfs?.rapid?.games ?? null,
                lichess_classical_games: perfs?.classical?.games ?? null,
                // Progression récente
                lichess_bullet_prog: perfs?.bullet?.prog ?? null,
                lichess_blitz_prog: perfs?.blitz?.prog ?? null,
                lichess_rapid_prog: perfs?.rapid?.prog ?? null,
                // Puzzles
                lichess_puzzle_rating: perfs?.puzzle?.rating ?? null,
                lichess_puzzle_games: perfs?.puzzle?.games ?? null,
            })
        }

        return null
    }

    async function handleNextStep() {
        setError(null)

        if (step === 1) {
            const err = validateStep1()
            if (err) { setError(err); return }
        }

        if (step === 2) {
            setLoading(true)
            const err = await validateStep2()
            setLoading(false)
            if (err) { setError(err); return }
        }

        setStep(prev => prev + 1)
    }

    async function handleGoogleRegister() {
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/api/auth/callback` },
        })
        if (error) { setError('Erreur avec Google. Réessaie.'); setLoading(false) }
    }

    async function handleSubmit() {
        setLoading(true)
        setError(null)

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: { data: { username: formData.username } },
        })

        if (signUpError) {
            console.log('SignUp error details:', signUpError)
            setError(
                signUpError.message.includes('already registered')
                    ? 'Cet email est déjà utilisé.'
                    : 'Une erreur est survenue. Réessaie.'
            )
            setLoading(false)
            return
        }

        if (data.user) {
            const res = await fetch('/api/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data.user.id,
                    username: formData.username,
                    chess_com_username: formData.chessComUsername || null,
                    lichess_username: formData.lichessUsername || null,
                    ...(cachedChessData ?? {}),
                    ...(cachedLichessData ?? {}),
                    last_synced_at: new Date().toISOString(),
                }),
            })

            if (!res.ok) {
                const body = await res.json()
                console.error('Erreur complete-profile:', body)
            }
        }

        router.push('/login?registered=true')
    }

    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">

                <div className="flex flex-col items-center mb-8">
                    <Image src="/logo-greatmentor.png" alt="GreatMentor logo" width={160} height={160} className="mb-3" />
                    <h1 className="text-white text-2xl font-bold tracking-wide">Prêt pour l'ouverture ?</h1>
                    <p className="text-zinc-400 text-sm mt-1 text-center">
                        Inscris-toi gratuitement pour commencer ton ascension et affûter tes premières stratégies.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map(n => (
                        <div key={n} className={`h-1.5 rounded-full transition-all duration-300 ${n === step ? 'w-8 bg-orange-500' : n < step ? 'w-4 bg-orange-700' : 'w-4 bg-zinc-700'}`} />
                    ))}
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-zinc-400 text-sm mb-1.5">Nom d'utilisateur</label>
                                <input type="text" value={formData.username} onChange={e => updateField('username', e.target.value)} placeholder="ex: magnus2024" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-1.5">Email</label>
                                <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="toi@exemple.com" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-1.5">Mot de passe</label>
                                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => updateField('password', e.target.value)} placeholder="••••••••" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors" />
                                <div className="flex justify-between">
                                    <p className="text-zinc-500 text-xs mt-1.5">Minimum 8 caractères</p>
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="text-zinc-500 text-xs mt-1.5 underline cursor-pointer hover:text-orange-500 transition-colors">
                                        {showPassword ? 'Masquer le mot de passe' : 'Voir le mot de passe'}
                                    </button>
                                </div>
                            </div>
                            <button onClick={handleNextStep} className="w-full cursor-pointer bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2">
                                Continuer
                            </button>
                            <div className="flex items-center gap-3 my-1">
                                <div className="flex-1 h-px bg-zinc-800" />
                                <span className="text-zinc-500 text-xs">ou</span>
                                <div className="flex-1 h-px bg-zinc-800" />
                            </div>
                            <button onClick={handleGoogleRegister} disabled={loading} className="cursor-pointer w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z" />
                                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
                                </svg>
                                S'inscrire avec Google
                            </button>
                            <p className="text-center text-zinc-500 text-sm mt-6">
                                Déjà un compte ?{' '}
                                <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">Se connecter</Link>
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <p className="text-zinc-400 text-sm text-center">
                                Renseigne au moins une plateforme — on récupérera tes parties automatiquement.
                            </p>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-1.5">Chess.com</label>
                                <input type="text" value={formData.chessComUsername} onChange={e => updateField('chessComUsername', e.target.value)} placeholder="nom d'utilisateur chess.com" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-1.5">Lichess</label>
                                <input type="text" value={formData.lichessUsername} onChange={e => updateField('lichessUsername', e.target.value)} placeholder="nom d'utilisateur lichess" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors" />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => { setStep(1); setError(null) }} className="cursor-pointer flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg py-2.5 text-sm transition-colors">
                                    Retour
                                </button>
                                <button onClick={handleNextStep} disabled={loading} className="cursor-pointer flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
                                    {loading ? 'Vérification...' : 'Continuer'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-white text-lg font-semibold">Dernière étape !</h2>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-zinc-300 text-sm font-medium">Pourquoi utilises-tu GreatMentor ?</p>
                                    <span className="text-zinc-500 text-xs">{formData.reasons.length}/2</span>
                                </div>
                                <div className="space-y-2">
                                    {REASONS.map(reason => {
                                        const isChecked = formData.reasons.includes(reason)
                                        const isDisabled = !isChecked && formData.reasons.length >= 2
                                        return (
                                            <label key={reason} className={`flex items-center gap-3 cursor-pointer group ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                <input type="checkbox" checked={isChecked} disabled={isDisabled} onChange={() => toggleCheckbox('reasons', reason, 2)} className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
                                                <span className="text-zinc-400 text-sm group-hover:text-zinc-200 transition-colors">{reason}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-zinc-300 text-sm font-medium">Comment as-tu entendu parler de nous ?</p>
                                    <span className="text-zinc-500 text-xs">{formData.heardFrom.length}/1</span>
                                </div>
                                <div className="space-y-2">
                                    {HEARD_FROM.map(source => {
                                        const isChecked = formData.heardFrom.includes(source)
                                        const isDisabled = !isChecked && formData.heardFrom.length >= 1
                                        return (
                                            <label key={source} className={`flex items-center gap-3 cursor-pointer group ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                <input type="checkbox" checked={isChecked} disabled={isDisabled} onChange={() => toggleCheckbox('heardFrom', source, 1)} className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
                                                <span className="text-zinc-400 text-sm group-hover:text-zinc-200 transition-colors">{source}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => { setStep(2); setError(null) }} className="cursor-pointer flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg py-2.5 text-sm transition-colors">
                                    Retour
                                </button>
                                <button onClick={handleSubmit} disabled={loading} className="cursor-pointer flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
                                    {loading ? 'Création...' : 'Créer mon compte'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </main>
    )
}