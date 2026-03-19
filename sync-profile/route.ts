import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { userId, chessComUsername, lichessUsername } = body

    if (!userId) {
        return NextResponse.json({ error: 'userId manquant' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}

    if (chessComUsername) {
        try {
            const statsRes = await fetch(
                `https://api.chess.com/pub/player/${chessComUsername.toLowerCase()}/stats`
            )
            if (statsRes.ok) {
                const s = await statsRes.json()
                updates.chess_com_bullet_elo = s?.chess_bullet?.last?.rating ?? null
                updates.chess_com_bullet_best_elo = s?.chess_bullet?.best?.rating ?? null
                updates.chess_com_blitz_elo = s?.chess_blitz?.last?.rating ?? null
                updates.chess_com_blitz_best_elo = s?.chess_blitz?.best?.rating ?? null
                updates.chess_com_rapid_elo = s?.chess_rapid?.last?.rating ?? null
                updates.chess_com_rapid_best_elo = s?.chess_rapid?.best?.rating ?? null
                updates.chess_com_classical_elo = s?.chess_daily?.last?.rating ?? null
                updates.chess_com_tactics_highest = s?.tactics?.highest?.rating ?? null
                updates.chess_com_puzzle_rush_best = s?.puzzle_rush?.best?.score ?? null
            }
        } catch (e) {
            console.error('Chess.com sync error:', e)
        }
    }

    if (lichessUsername) {
        try {
            const res = await fetch(
                `https://lichess.org/api/user/${lichessUsername.toLowerCase()}`
            )
            if (res.ok) {
                const d = await res.json()
                updates.lichess_bullet_elo = d?.perfs?.bullet?.rating ?? null
                updates.lichess_blitz_elo = d?.perfs?.blitz?.rating ?? null
                updates.lichess_rapid_elo = d?.perfs?.rapid?.rating ?? null
                updates.lichess_classical_elo = d?.perfs?.classical?.rating ?? null
                updates.lichess_correspondence_elo = d?.perfs?.correspondence?.rating ?? null
                updates.lichess_puzzle_rating = d?.perfs?.puzzle?.rating ?? null
                updates.lichess_games_total = d?.count?.all ?? null
                updates.lichess_games_wins = d?.count?.win ?? null
                updates.lichess_games_losses = d?.count?.loss ?? null
                updates.lichess_games_draws = d?.count?.draw ?? null
            }
        } catch (e) {
            console.error('Lichess sync error:', e)
        }
    }

    updates.last_synced_at = new Date().toISOString()

    const { error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}