import { LayoutDashboard, Users, UserX, KanbanSquare, Settings, History, LogOut, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  userName: string;
  isOpen: boolean;       // Novo
  onClose: () => void;   // Novo
}

export function Sidebar({ activePage, onNavigate, userName, isOpen, onClose }: SidebarProps) {
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'incompletos', label: 'Incompletos', icon: UserX },
    { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
    { id: 'historico', label: 'Histórico', icon: History }, 
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ]

  return (
    <>
      {/* OVERLAY ESCURO (APENAS MOBILE) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#112240] text-white flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 shadow-2xl md:shadow-none
      `}>
        
        {/* LOGO AREA */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wide">SALOMÃO</span>
            <span className="text-[10px] text-blue-200 uppercase tracking-widest">Advogados</span>
          </div>
          {/* BOTÃO FECHAR (APENAS MOBILE) */}
          <button onClick={onClose} className="md:hidden p-1 hover:bg-white/10 rounded-lg">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* MENU ITEMS */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Menu Principal</p>
          
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }} // Fecha o menu ao clicar (mobile)
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                {item.label}
                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>}
              </button>
            )
          })}
        </nav>

        {/* USER FOOTER */}
        <div className="p-4 border-t border-white/10 shrink-0 bg-[#0d1b33]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm border-2 border-[#112240] shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{userName}</p>
              <p className="text-xs text-gray-400 truncate">Online</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-colors text-xs font-bold text-gray-400 border border-white/5 hover:border-red-500/20"
          >
            <LogOut className="h-3 w-3" /> Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  )
}
