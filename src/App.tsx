import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './Login'
import { Sidebar } from './components/Sidebar'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Função para formatar o nome do usuário baseado no email
  const getUserDisplayName = () => {
    if (!session?.user?.email) return 'Usuário'
    
    // Pega a parte antes do @ (ex: joao.silva)
    const namePart = session.user.email.split('@')[0]
    
    // Remove pontos e capitaliza (ex: Joao Silva)
    return namePart
      .split('.')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#112240]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Passamos o nome formatado para a Sidebar */}
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        userName={getUserDisplayName()}
      />

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 overflow-auto flex flex-col">
        
        {/* Header Superior */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between flex-shrink-0">
            <h1 className="text-xl font-bold text-[#112240] capitalize flex items-center gap-2">
                {activePage}
            </h1>
            <div className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                Salomão Advogados
            </div>
        </header>

        {/* Conteúdo Variável */}
        <div className="p-8 flex-1">
            {activePage === 'dashboard' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-2">Resumo da Semana</h2>
                    <p className="text-gray-600">Seus gráficos de BI entrarão aqui em breve.</p>
                </div>
            )}

            {/* Placeholder para as outras páginas */}
            {activePage !== 'dashboard' && (
                <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
                    <h2 className="text-lg font-semibold mb-2 text-gray-400">Módulo em Desenvolvimento</h2>
                    <p className="text-gray-500">A página <strong>{activePage}</strong> será implementada na próxima etapa.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  )
}
