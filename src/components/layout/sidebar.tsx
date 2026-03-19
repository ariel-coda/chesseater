'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Swords, Brain, TrendingUp, Settings, LogOut, X, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Tables } from '@/lib/types/database'

type Profile = Tables<'profiles'>

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Accueil', Icon: Home },
    { href: '/games', label: 'Mes parties', Icon: Swords },
    { href: '/coach', label: 'Coach IA', Icon: Brain },
    { href: '/progress', label: 'Progression', Icon: TrendingUp },
]

type Props = { profile: Profile | null }

export default function Sidebar({ profile }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [mobileOpen, setMobileOpen] = useState(false)

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const NavContent = () => (
        <div className="flex flex-col h-full overflow-hidden">

            {/* ── Logo aligné à gauche + nom ── */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
                <Image
                    src="/logo-greatmentor.png"
                    alt=""
                    width={60}
                    height={60}
                    className="flex justify-end bg-yellow-500 rounded-full"
                    priority
                />
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(({ href, label, Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 relative
                ${isActive
                                    ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent'
                                }
              `}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 rounded-r-full" />
                            )}
                            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                            <span>{label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* ── Profil + Paramètres + Déconnexion ── */}
            <div className="px-3 py-4 border-t border-white/5 space-y-0.5">

                {/* Bloc cliquable → /settings */}
                <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/30 to-orange-700/20 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-300 text-xs font-bold uppercase">
                            {profile?.username?.charAt(0) ?? 'G'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 text-sm font-semibold truncate leading-tight">
                            {profile?.username ?? 'Joueur'}
                        </p>
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all duration-200 text-sm font-medium"
                >
                    <LogOut size={16} strokeWidth={1.8} className="flex-shrink-0" />
                    Se déconnecter
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* ── DESKTOP SIDEBAR ── */}
            <aside className="hidden lg:flex flex-col w-48 min-h-screen bg-zinc-900/80 backdrop-blur-sm border-r border-white/5 fixed left-0 top-0 z-30">
                <NavContent />
            </aside>

            {/* ── MOBILE TOPBAR ── */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-zinc-900/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-2.5">
                    <Image src="/logo-greatmentor.png" alt="GreatMentor" width={30} height={30} priority />
                    <span className="text-white font-bold text-sm tracking-wide">GreatMentor</span>
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <Menu size={20} />
                </button>
            </header>

            {/* ── MOBILE DRAWER ── */}
            <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />
                <div className={`absolute left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-white/5 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors z-10"
                    >
                        <X size={18} />
                    </button>
                    <NavContent />
                </div>
            </div>
        </>
    )
}