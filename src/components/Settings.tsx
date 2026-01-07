import { useState, useRef, useEffect } from 'react'
import { 
  Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, 
  Users, Pencil, Trash2, Save, X, RefreshCw, 
  AlertTriangle, History, Code, Building, User, Copyright,
  Shield, UserPlus, Ban, Check, Lock
} from 'lucide-react'
import { utils, read, writeFile } from 'xlsx'
import { supabase } from '../lib/supabase'
import { logAction } from '../lib/logger'

// ... Interfaces existentes (SocioStats, AppUser) ...
interface SocioStats {
  nome: string;
  count: number;
}
interface AppUser {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  ativo: boolean;
}

export function Settings() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  
  // Estados para Gestão de Sócios
  const [sociosStats, setSociosStats] = useState<SocioStats[]>([])
  const [loadingSocios, setLoadingSocios] = useState(false)
  const [editingSocio, setEditingSocio] = useState<string | null>(null)
  const [newSocioName, setNewSocioName] = useState('')

  // Estados para Gestão de Usuários
  const [users, setUsers] = useState<AppUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [userForm, setUserForm] = useState({ nome: '', email: '', cargo: 'Colaborador' })

  // --- NOVO: ESTADOS PARA MAGISTRADOS ---
  const [magistradosConfig, setMagistradosConfig] = useState({ pin: '', emails: '' })
  const [loadingConfig, setLoadingConfig] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ... (Changelog omitido para brevidade, mantenha o seu) ...
  const changelog = [/* Mantenha seu changelog */];

  useEffect(() => { 
    fetchSocios();
    fetchUsers();
    fetchMagistradosConfig(); // NOVO
  }, [])

  // --- NOVO: BUSCAR CONFIG MAGISTRADOS ---
  const fetchMagistradosConfig = async () => {
    const { data } = await supabase.from('config_magistrados').select('*').single()
    if (data) {
        setMagistradosConfig({
            pin: data.pin_acesso,
            emails: (data.emails_permitidos || []).join(', ')
        })
    }
  }

  // --- NOVO: SALVAR CONFIG MAGISTRADOS ---
  const handleSaveConfigMagistrados = async () => {
    setLoadingConfig(true)
    const emailsArray = magistradosConfig.emails.split(',').map(e => e.trim()).filter(e => e)
    
    // Atualiza o primeiro registro
    const { data: current } = await supabase.from('config_magistrados').select('id').single()
    
    if (current) {
        await supabase.from('config_magistrados').update({
            pin_acesso: magistradosConfig.pin,
            emails_permitidos: emailsArray
        }).eq('id', current.id)
        
        await logAction('CONFIG', 'SEGURANCA', 'Atualizou PIN/Acessos de Magistrados')
        alert('Configurações de segurança atualizadas!')
    } else {
        // Cria se não existir
        await supabase.from('config_magistrados').insert({
            pin_acesso: magistradosConfig.pin,
            emails_permitidos: emailsArray
        })
    }
    setLoadingConfig(false)
  }

  // ... (Funções fetchSocios, handleUpdateSocio, handleDeleteSocio mantidas iguais) ...
  const fetchSocios = async () => { /* ... */ }
  const handleUpdateSocio = async (oldName: string) => { /* ... */ }
  const handleDeleteSocio = async (name: string) => { /* ... */ }
  const fetchUsers = async () => { /* ... */ }
  const handleSaveUser = async () => { /* ... */ }
  const handleToggleActive = async (user: AppUser) => { /* ... */ }
  const handleDeleteUser = async (user: AppUser) => { /* ... */ }
  const openUserModal = (user?: AppUser) => { /* ... */ }
  const handleSystemReset = async () => { /* ... */ }
  const handleDownloadTemplate = () => { /* ... */ }
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8 relative">
      
      {/* MODAL USUÁRIO (Mantido) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          {/* ... Conteúdo do modal mantido ... */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
             {/* ... Inputs do form ... */}
             <div className="flex justify-end gap-3"><button onClick={() => setIsUserModalOpen(false)}>Cancelar</button><button onClick={handleSaveUser}>Salvar</button></div>
          </div>
        </div>
      )}

      {/* GESTÃO DE USUÁRIOS (Mantido) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
         {/* ... Tabela de usuários mantida ... */}
      </div>

      {/* --- NOVO: CONFIGURAÇÃO DE SEGURANÇA MAGISTRADOS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-700"><Lock className="h-6 w-6" /></div>
            <div>
                <h3 className="font-bold text-[#112240] text-lg">Segurança: Módulo Magistrados</h3>
                <p className="text-sm text-gray-500">Controle de acesso à área restrita.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">PIN de Acesso (4 dígitos)</label>
                <input 
                    type="text" 
                    maxLength={4}
                    value={magistradosConfig.pin}
                    onChange={e => setMagistradosConfig({...magistradosConfig, pin: e.target.value.replace(/\D/g,'')})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-orange-500 font-mono text-center tracking-widest text-lg"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Emails Permitidos (separar por vírgula)</label>
                <textarea 
                    rows={3}
                    value={magistradosConfig.emails}
                    onChange={e => setMagistradosConfig({...magistradosConfig, emails: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-orange-500 text-xs"
                    placeholder="email1@salomao.adv.br, email2@salomao.adv.br"
                />
            </div>
        </div>
        <div className="mt-4 flex justify-end">
            <button 
                onClick={handleSaveConfigMagistrados}
                disabled={loadingConfig}
                className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
                <Save className="h-4 w-4" /> Salvar Segurança
            </button>
        </div>
      </div>

      {/* GESTÃO SÓCIOS E IMPORTAÇÃO (Mantido) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* ... (Manter código original de Sócios e Importação) ... */}
      </div>

      {/* CRÉDITOS E ZONA DE PERIGO (Mantido) */}
      {/* ... (Manter código original) ... */}

    </div>
  )
}