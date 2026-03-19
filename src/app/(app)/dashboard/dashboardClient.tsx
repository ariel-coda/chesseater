'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Zap, Flame, Timer, Crown, Mail,
    Trophy, Minus, Swords, ArrowRight,
    TrendingUp, TrendingDown
} from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import SyncButton from '@/components/ui/syncButton'
import type { Tables } from '@/lib/types/database'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell, ReferenceLine, CartesianGrid
} from 'recharts'

type Profile = Tables<'profiles'>
type Game = Tables<'games'>

type Props = {
    profile: Profile | null
    recentGames: Game[]
}

function getGreeting(name: string) {
    const h = new Date().getHours()
    if (h < 12) return `Bonjour, ${name} 👋`
    if (h < 18) return `Bon après-midi, ${name} 👋`
    return `Bonsoir, ${name} 👋`
}

// ── Tooltip personnalisé ─────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs shadow-xl">
            <p className="text-zinc-300 font-semibold mb-2">{label}</p>
            <div className="space-y-1">
                <div className="flex justify-between gap-4">
                    <span className="text-zinc-500">Elo actuel</span>
                    <span className="text-white font-bold">{d?.current ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-green-400">Meilleur</span>
                    <span className="text-green-300 font-bold">{d?.best ?? '—'}</span>
                </div>
                {d?.diff !== undefined && d.diff !== null && (
                    <div className="flex justify-between gap-4 pt-1 border-t border-zinc-700">
                        <span className="text-zinc-500">Écart</span>
                        <span className={d.diff >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                            {d.diff >= 0 ? `+${d.diff}` : d.diff}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function DashboardClient({ profile, recentGames }: Props) {
    const [platform, setPlatform] = useState<'chess_com' | 'lichess'>('chess_com')

    // ── Données Elo pour les cards ───────────────────────────
    const eloCards = platform === 'chess_com'
        ? [
            { mode: 'Bullet', Icon: Zap, current: profile?.chess_com_bullet_elo, best: profile?.chess_com_bullet_best_elo },
            { mode: 'Blitz', Icon: Flame, current: profile?.chess_com_blitz_elo, best: profile?.chess_com_blitz_best_elo },
            { mode: 'Rapide', Icon: Timer, current: profile?.chess_com_rapid_elo, best: profile?.chess_com_rapid_best_elo },
            { mode: 'Classique', Icon: Crown, current: profile?.chess_com_classical_elo, best: null },
        ]
        : [
            { mode: 'Bullet', Icon: Zap, current: profile?.lichess_bullet_elo, best: null },
            { mode: 'Blitz', Icon: Flame, current: profile?.lichess_blitz_elo, best: null },
            { mode: 'Rapide', Icon: Timer, current: profile?.lichess_rapid_elo, best: null },
            { mode: 'Classique', Icon: Crown, current: profile?.lichess_classical_elo, best: null },
            { mode: 'Correspond.', Icon: Mail, current: profile?.lichess_correspondence_elo, best: null },
        ]

    // ── Données graphique : Elo actuel vs meilleur ───────────
    // On construit un tableau propre avec seulement les modes qui ont des données
    const graphData = eloCards
        .filter(c => c.current !== null && c.current !== undefined)
        .map(c => ({
            mode: c.mode,
            current: c.current,
            best: c.best ?? c.current,   // si pas de "best" → on affiche juste le current
            diff: c.best != null && c.current != null ? c.current - c.best : null,
        }))

    const hasData = graphData.length > 0

    // ── Stats rapides ────────────────────────────────────────
    const wins = recentGames.filter(g => g.result === 'win').length
    const losses = recentGames.filter(g => g.result === 'loss').length
    const draws = recentGames.filter(g => g.result === 'draw').length

    return (
        <div className="min-h-screen bg-zinc-950">
            <Sidebar profile={profile} />

            <main className="lg:ml-60 pt-14 lg:pt-0">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">

                    {/* ── En-tête ── */}
                    <div className="mb-7">
                        <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                            {getGreeting(profile?.username ?? 'Joueur')}
                        </h1>
                        <p className="text-zinc-500 mt-1 text-sm">
                            Voici l'état de ton jeu aujourd'hui.
                            {profile && (
                                <div className="mt-3">
                                    <SyncButton
                                        userId={profile.id}
                                        chessComUsername={profile.chess_com_username}
                                        lichessUsername={profile.lichess_username}
                                    />
                                </div>
                            )}
                        </p>
                    </div>

                    {/* ── Sélecteur de plateforme ── */}
                    <div className="inline-flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6 gap-1">
                        {(['chess_com', 'lichess'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setPlatform(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${platform === p
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                    }`}
                            >
                                {p === 'chess_com' ? 'Chess.com' : 'Lichess'}
                            </button>
                        ))}
                    </div>

                    {/* ── Elo Cards ── */}
                    <div className={`grid gap-3 mb-6 ${platform === 'lichess'
                        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                        : 'grid-cols-2 sm:grid-cols-4'
                        }`}>
                        {eloCards.map(({ mode, Icon, current, best }) => {
                            const diff = best != null && current != null ? current - best : null
                            const isAtBest = diff === 0
                            const isBelow = diff !== null && diff < 0

                            return (
                                <div
                                    key={mode}
                                    className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 hover:border-orange-500/20 transition-all duration-200 group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Icon
                                            size={16}
                                            strokeWidth={1.8}
                                            className="text-orange-400"
                                        />
                                        {/* Badge meilleur / progression */}
                                        {isAtBest && current && (
                                            <span className="text-xs text-green-400 font-medium flex items-center gap-0.5">
                                                <TrendingUp size={10} /> Top
                                            </span>
                                        )}
                                        {isBelow && (
                                            <span className="text-xs text-red-400 font-medium flex items-center gap-0.5">
                                                <TrendingDown size={10} /> {diff}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-zinc-500 text-xs font-medium mb-0.5 uppercase tracking-wide">
                                        {mode}
                                    </p>
                                    <p className={`text-2xl font-bold tracking-tight ${current ? 'text-white' : 'text-zinc-700'}`}>
                                        {current ?? '—'}
                                    </p>
                                    {best != null && best !== current && (
                                        <p className="text-green-500 text-xs mt-0.5">
                                            Meilleur : {best}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* ── Graphique : Elo actuel vs Meilleur ── */}
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 mb-6">
                        <div className="mb-5">
                            <h2 className="text-white font-semibold text-base">
                                Progression Elo
                            </h2>
                            <p className="text-zinc-500 text-xs mt-0.5">
                                Elo actuel vs meilleur Elo atteint — {platform === 'chess_com' ? 'Chess.com' : 'Lichess'}
                            </p>
                        </div>

                        {hasData ? (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart
                                        data={graphData}
                                        barGap={4}
                                        margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#27272a"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="mode"
                                            tick={{ fill: '#52525b', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: '#52525b', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={38}
                                            // On démarre l'axe Y 100 points sous le minimum pour mieux voir l'écart
                                            domain={[
                                                (dataMin: number) => Math.max(0, dataMin - 100),
                                                (dataMax: number) => dataMax + 50,
                                            ]}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

                                        {/* Barre Meilleur elo — toujours en arrière-plan */}
                                        <Bar dataKey="best" name="Meilleur" radius={[6, 6, 0, 0]} fill="#16a34a" opacity={0.25} />

                                        {/* Barre Elo actuel — au premier plan */}
                                        <Bar dataKey="current" name="Actuel" radius={[6, 6, 0, 0]}>
                                            {graphData.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={
                                                        entry.diff === null || entry.diff === 0
                                                            ? '#f97316'           // orange = à son meilleur ou pas de best
                                                            : entry.diff < 0
                                                                ? '#ef4444'           // rouge = en dessous du meilleur
                                                                : '#22c55e'           // vert = au-dessus (cas rare)
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>

                                {/* Légende */}
                                <div className="flex gap-5 mt-3 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm inline-block bg-orange-500" />
                                        <span className="text-zinc-500 text-xs">Elo actuel</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm inline-block bg-green-600 opacity-50" />
                                        <span className="text-zinc-500 text-xs">Meilleur Elo</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm inline-block bg-red-500" />
                                        <span className="text-zinc-500 text-xs">En dessous du meilleur</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <TrendingUp size={36} strokeWidth={1.2} className="text-zinc-700 mb-3" />
                                <p className="text-zinc-400 text-sm font-medium">
                                    Synchronise tes comptes pour voir ta progression
                                </p>
                                <p className="text-zinc-600 text-xs mt-1 max-w-xs">
                                    Va dans les paramètres pour connecter Chess.com ou Lichess.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Dernières parties ── */}
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-semibold text-base">Dernières parties</h2>
                            <Link
                                href="/games"
                                className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                            >
                                Voir tout <ArrowRight size={14} />
                            </Link>
                        </div>

                        {recentGames.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Swords size={36} strokeWidth={1.2} className="text-zinc-700 mb-3" />
                                <p className="text-zinc-400 text-sm font-medium">
                                    Aucune partie enregistrée
                                </p>
                                <p className="text-zinc-600 text-xs mt-1">
                                    Tes parties apparaîtront ici après la première synchronisation.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Mini stats */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {[
                                        { label: 'Victoires', value: wins, Icon: Trophy, color: 'text-green-400', bg: 'bg-green-500/10' },
                                        { label: 'Nulles', value: draws, Icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-700/40' },
                                        { label: 'Défaites', value: losses, Icon: Swords, color: 'text-red-400', bg: 'bg-red-500/10' },
                                    ].map(({ label, value, Icon, color, bg }) => (
                                        <div key={label} className={`${bg} rounded-xl px-3 py-2.5 flex items-center gap-2`}>
                                            <Icon size={13} strokeWidth={1.8} className={color} />
                                            <div>
                                                <p className={`text-base font-bold ${color}`}>{value}</p>
                                                <p className="text-zinc-600 text-xs">{label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Liste */}
                                <div className="space-y-2">
                                    {recentGames.map(game => (
                                        <div
                                            key={game.id}
                                            className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors gap-3"
                                        >
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${game.result === 'win'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : game.result === 'loss'
                                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    : 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/20'
                                                }`}>
                                                {game.result === 'win' ? 'Victoire' : game.result === 'loss' ? 'Défaite' : 'Nulle'}
                                            </span>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-zinc-200 text-sm font-medium truncate">
                                                    vs {game.opponent_username ?? 'Inconnu'}
                                                </p>
                                                <p className="text-zinc-600 text-xs truncate">
                                                    {game.opening_name ?? 'Ouverture non identifiée'}
                                                </p>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="text-zinc-500 text-xs">
                                                    {game.platform === 'chess_com' ? 'Chess.com' : 'Lichess'}
                                                </p>
                                                <p className="text-zinc-700 text-xs">{game.time_control ?? '—'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}