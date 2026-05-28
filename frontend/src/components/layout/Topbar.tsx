import { ArrowLeft, LayoutGrid, Bell, ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface Props {
  backHref?: string
  label?: string
}

export default function Topbar({ backHref, label = 'Assignment' }: Props) {
  return (
    <header className="h-12 border-b border-gray-100 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={16} />
          </Link>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <LayoutGrid size={14} />
          <span>{label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />
        </button>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-full bg-gray-200" />
          <span className="text-gray-700 font-medium">John Doe</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  )
}
