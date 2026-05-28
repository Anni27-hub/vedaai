'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Users, BookOpen, Wand2, Library, Settings, Plus
} from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Users, label: 'My Groups', href: '/groups' },
  { icon: BookOpen, label: 'Assignments', href: '/assignments' },
  { icon: Wand2, label: "AI Teacher's Toolkit", href: '/toolkit' },
  { icon: Library, label: 'My Library', href: '/library' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[185px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #FF6B2B, #E8520A)' }}>
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="font-bold text-base text-gray-900">VedaAI</span>
        </div>
      </div>

      {/* Create Assignment Button */}
      <div className="px-3 mb-4">
        <Link href="/assignments/create" className="btn-primary w-full justify-center text-xs py-2">
          <Plus size={14} />
          Create Assignment
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 p-3 space-y-2">
        <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Settings size={15} />
          Settings
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-orange-700">D</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">Delhi Public School</p>
            <p className="text-[10px] text-gray-500 truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
