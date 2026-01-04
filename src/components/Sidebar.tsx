import { 
  LayoutDashboard, 
  Users, 
  FileWarning, 
  KanbanSquare, 
  BookOpen, 
  History, 
  Settings, 
  LogOut,
  UserCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'incompletos', label: 'Incompletos', icon: FileWarning },
    { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
  ]

  return (
    <div className="h-screen w-64 bg-[#112240] text-gray-300 flex flex-col font-sans border-r border-gray-800">
      
      {/* 1. Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-[#0f1e39]">
        <img src="/logo-branca.png" alt="Salomão" className="h-8 object-contain" />
      </div>

      {/* 2. Menu Principal */}
      <div className="flex-1 py-6 space-y-1 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
              activePage === item.id 
                ? 'bg-[#1a3a6c] text-white font-medium' 
                : 'hover:bg-[#1a3a6c]/50 hover:text-white'
            }`}
          >
            <item.icon className={`h-5 w-5 mr-3 ${activePage === item.id ? 'text-salomao-gold' : 'text-gray-400 group-hover:text-white'}`} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        {/* Divisor + Manual */}
        <div className="pt-4 pb-2">
          <div className="border-t border-gray-700 mx-2 mb-4"></div>
          <button
            onClick={() => onNavigate('manual')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                activePage === 'manual' ? 'bg-[#1a3a6c] text-white' : 'hover:bg-[#1a3a6c]/50 hover:text-white'
            }`}
          >
            <BookOpen className="h-5 w-5 mr-3 text-gray-400 group-hover:text-white" />
            <span className="text-sm">Manual do Sistema</span>
          </button>
          <div className="border-t border-gray-700 mx-2 mt-4"></div>
        </div>

        {/* Histórico e Config */}
        <button
            onClick={() => onNavigate('historico')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors group hover:bg-[#1a3a6c]/50 hover:text-white`}
          >
            <History className="h-5 w-5 mr-3 text-gray-400 group-hover:text-white" />
            <span className="text-sm">Histórico</span>
        </button>
        <button
            onClick={() => onNavigate('configuracoes')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors group hover:bg-[#1a3a6c]/50 hover:text-white`}
          >
            <Settings className="h-5 w-5 mr-3 text-gray-400 group-hover:text-white" />
            <span className="text-sm">Configurações</span>
        </button>
      </div>

      {/* 3. Rodapé do Usuário */}
      <div className="p-4 border-t border-gray-800 bg-[#0f1e39]">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-gray-300" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">Usuário</span>
                    <span className="text-[10px] text-gray-400 cursor-pointer hover:text-red-400 flex items-center gap-1" onClick={() => supabase.auth.signOut()}>
                        Sair <LogOut className="h-3 w-3" />
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
