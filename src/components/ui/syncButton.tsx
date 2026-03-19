'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Props = {
    userId: string
    chessComUsername: string | null
    lichessUsername: string | null
    // variant permet de l'utiliser dans la sidebar ou en plein bouton
    variant?: 'full' | 'icon'
}

export default function SyncButton({
    userId,
    chessComUsername,
    lichessUsername,
    variant = 'full'
}: Props) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
    const router = useRouter()

    async function handleSync() {
        setLoading(true)
        setStatus('idle')

        const res = await fetch('/api/sync-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, chessComUsername, lichessUsername }),
        })

        if (res.ok) {
            setStatus('ok')
            // On recharge la page pour afficher les nouvelles données
            router.refresh()
        } else {
            setStatus('error')
        }

        setLoading(false)

        // Reset du statut après 3 secondes
        setTimeout(() => setStatus('idle'), 3000)
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={handleSync}
                disabled={loading}
                title="Synchroniser mes données"
                className="cursor-pointer p-2 rounded-lg text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-200 disabled:opacity-50"
            >
                <RefreshCw
                    size={16}
                    strokeWidth={1.8}
                    className={loading ? 'animate-spin' : ''}
                />
            </button>
        )
    }

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${status === 'ok'
                ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                : status === 'error'
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                    : 'bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <RefreshCw
                size={15}
                strokeWidth={2}
                className={loading ? 'animate-spin' : ''}
            />
            {loading
                ? 'Synchronisation...'
                : status === 'ok'
                    ? 'Données à jour ✓'
                    : status === 'error'
                        ? 'Erreur — réessaie'
                        : 'Synchroniser mes données'
            }
        </button>
    )
}