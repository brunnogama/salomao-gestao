import { useState, useRef, useEffect } from 'react'
import { 
  Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, 
  Users, Pencil, Trash2, Save, X, RefreshCw, Briefcase, 
  AlertTriangle, History, Code, Building, User, Copyright 
} from 'lucide-react'
import { utils, read, writeFile } from 'xlsx'
import { supabase } from '../lib/supabase'
import { logAction } from '../lib/logger'

interface SocioStats {
  nome: string;
  count: number;
}

export function Settings() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  
  // Estados para Gestão de Sócios
  const [sociosStats, setSociosStats] = useState<SocioStats[]>([])
  const [loadingSocios, setLoadingSocios] = useState(false)
  const [editingSocio, setEditingSocio] = useState<string | null>(null)
  const [newSocioName, setNewSocioName] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- VERSÕES DO SISTEMA (CHANGELOG) ---
  const changelog = [
    {
      version: '1.2.1',
      date: '05/01/2026',
      type: 'fix',
      title: 'Polimento Visual e UX',
      items: ['Correção de tooltips no Dashboard', 'Ajuste de alinhamento nos cards de Clientes', 'Formatação de e-mail padronizada']
    },
    {
      version: '1.2',
      date: '05/01/2026',
      type: 'feat',
      title: 'Módulo de Histórico e Auditoria',
      items: ['Criação do sistema de Logs', 'Rastreabilidade de usuários', 'Exportação de Logs']
    },
    {
      version: '1.1',
      date: '04/01/2026',
      type: 'feat',
      title: 'Funcionalidades Core',
      items: ['Integração com ViaCEP', 'Busca inteligente de endereço', 'Gráficos de Estados no Dashboard', 'Máscara de CEP']
    },
    {
      version: '1.0',
      date: '01/01/2026',
      type: 'major',
      title: 'Lançamento do Sistema',
      items: ['Estrutura inicial', 'Autenticação', 'Kanban', 'Gestão de Clientes']
    }
  ];

  // --- GESTÃO DE SÓCIOS ---
  const fetchSocios = async () => {
    setLoadingSocios(true)
    try {
      const { data, error } = await supabase.from('clientes').select('socio')
      if (error) throw error
      if (data) {
        const counts: Record<string, number> = {}
        data.forEach(item => { if (item.socio) counts[item.socio] = (counts[item.socio] || 0) + 1 })
        const statsArray = Object.entries(counts).map(([nome, count]) => ({ nome, count }))
        statsArray.sort((a, b) => a.nome.localeCompare(b.nome))
        setSociosStats(statsArray)
      }
    } catch (error) {
      console.error('Erro ao buscar sócios:', error)
    } finally {
      setLoadingSocios(false)
    }
  }

  useEffect(() => { fetchSocios() }, [])

  const handleUpdateSocio = async (oldName: string) => {
    if (!newSocioName.trim() || newSocioName === oldName) {
      setEditingSocio(null)
      return
    }
    if (confirm(`Confirmar alteração de "${oldName}" para "${newSocioName}"?`)) {
      setLoadingSocios(true)
      try {
        const { error } = await supabase.from('clientes').update({ socio: newSocioName }).eq('socio', oldName)
        if (error) throw error
        await logAction('EDITAR', 'CONFIG', `Renomeou sócio: ${oldName} -> ${newSocioName}`)
        setStatus({ type: 'success', message: 'Sócio renomeado com sucesso!' })
        fetchSocios()
      } catch (error: any) {
        setStatus({ type: 'error', message: `Erro ao atualizar: ${error.message}` })
      } finally {
        setEditingSocio(null)
        setLoadingSocios(false)
      }
    }
  }

  const handleDeleteSocio = async (name: string) => {
    if (confirm(`ATENÇÃO: Remover vínculo do sócio "${name}"?`)) {
      setLoadingSocios(true)
      try {
        const { error } = await supabase.from('clientes').update({ socio: null }).eq('socio', name)
        if (error) throw error
        await logAction('EXCLUIR', 'CONFIG', `Removeu vínculo do sócio: ${name}`)
        setStatus({ type: 'success', message: `Sócio "${name}" removido.` })
        fetchSocios()
      } catch (error: any) {
        setStatus({ type: 'error', message: `Erro ao excluir: ${error.message}` })
      } finally {
        setLoadingSocios(false)
      }
    }
  }

  // --- RESET TOTAL DO SISTEMA ---
  const handleSystemReset = async () => {
    const confirmation = prompt("ATENÇÃO: ISSO APAGARÁ TODOS OS DADOS!\n\nDigite 'DELETAR' para confirmar o reset completo do sistema.");
    
    if (confirmation === 'DELETAR') {
        setLoading(true);
        try {
            // 1. Apagar Clientes
            await supabase.from('clientes').delete().neq('id', 0);
            // 2. Apagar Tarefas
            await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // UUID dummy
            // 3. Apagar Logs
            await supabase.from('logs').delete().neq('id', 0);

            await logAction('EXCLUIR', 'SISTEMA', 'Realizou RESET TOTAL do sistema');
            
            alert('Sistema resetado com sucesso.');
            window.location.reload();
        } catch (error: any) {
            alert(`Erro ao resetar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }
  }

  // --- IMPORTAÇÃO E EXPORTAÇÃO ---
  const handleDownloadTemplate = () => {
    const templateData = [{ "Nome Completo": "Exemplo Silva", "Empresa": "Empresa Teste", "Sócio Responsável": "Sócio" }]
    const ws = utils.json_to_sheet(templateData)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Modelo")
    writeFile(wb, "Modelo_Importacao.xlsx")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setStatus({ type: null, message: '' })

    try {
      const data = await file.arrayBuffer()
      const workbook = read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData: any[] = utils.sheet_to_json(worksheet)
      if (jsonData.length === 0) throw new Error("A planilha está vazia.")

      const clientsToInsert = jsonData.map((row) => ({
        nome: row["Nome Completo"],
        empresa: row["Empresa"],
        cargo: row["Cargo"],
        telefone: row["Telefone"],
        tipo_brinde: row["Tipo de Brinde"] || "Brinde Médio",
        outro_brinde: row["Outro Brinde"],
        quantidade: row["Quantidade"] || 1,
        cep: row["CEP"],
        endereco: row["Endereço"],
        numero: row["Número"] ? String(row["Número"]) : null,
        complemento: row["Complemento"],
        bairro: row["Bairro"],
        cidade: row["Cidade"],
        estado: row["Estado"],
        email: row["Email"],
        socio: row["Sócio Responsável"],
        observacoes: row["Observações"]
      }))

      const { error } = await supabase.from('clientes').insert(clientsToInsert)
      if (error) throw error

      await logAction('CRIAR', 'CONFIG', `Importou ${clientsToInsert.length} clientes via Excel`)
      setStatus({ type: 'success', message: `${clientsToInsert.length} clientes importados!` })
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchSocios()
    } catch (error: any) {
      setStatus({ type: 'error', message: `Erro: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const getVersionColor = (type: string) => {
      if (type === 'major') return 'bg-purple-100 text-purple-700 border-purple-200';
      if (type === 'feat') return 'bg-blue-100 text-blue-700 border-blue-200';
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      
      {/* SEÇÃO 1: GESTÃO E DADOS (Lado a Lado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gestão de Sócios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-700"><Users className="h-6 w-6" /></div>
                    <h3 className="font-bold text-[#112240] text-lg">Sócios</h3>
                </div>
                <button onClick={fetchSocios} className="p-2 text-gray-400 hover:text-[#112240]"><RefreshCw className={`h-4 w-4 ${loadingSocios ? 'animate-spin' : ''}`} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                {loadingSocios && sociosStats.length === 0 ? <p className="text-gray-400 text-sm">Carregando...</p> : (
                    <div className="space-y-3">
                        {sociosStats.map((item) => (
                            <div key={item.nome} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gray-300 transition-all">
                                {editingSocio === item.nome ? (
                                    <div className="flex gap-2 w-full">
                                        <input type="text" className="flex-1 px-2 py-1 text-sm border rounded" value={newSocioName} onChange={e => setNewSocioName(e.target.value)} autoFocus />
                                        <button onClick={() => handleUpdateSocio(item.nome)} className="text-green-600"><Save className="h-4 w-4" /></button>
                                        <button onClick={() => setEditingSocio(null)} className="text-gray-400"><X className="h-4 w-4" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{item.nome.charAt(0)}</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{item.nome}</p>
                                                <p className="text-[10px] text-gray-500">{item.count} clientes</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingSocio(item.nome); setNewSocioName(item.nome); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="h-3 w-3" /></button>
                                            <button onClick={() => handleDeleteSocio(item.nome)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-3 w-3" /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Importação de Dados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-700"><FileSpreadsheet className="h-6 w-6" /></div>
                <h3 className="font-bold text-[#112240] text-lg">Importação em Lote</h3>
            </div>
            
            <div className="space-y-4">
                <button onClick={handleDownloadTemplate} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
                    <span>1. Baixar Planilha Modelo</span>
                    <Download className="h-4 w-4" />
                </button>
                
                <div className="relative">
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} ref={fileInputRef} className="hidden" id="file-upload" disabled={loading} />
                    <label htmlFor="file-upload" className={`w-full flex items-center justify-between px-4 py-3 ${loading ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-[#112240] hover:bg-[#1a3a6c] cursor-pointer text-white'} rounded-lg transition-colors text-sm font-bold shadow-sm`}>
                        <span>{loading ? 'Processando...' : '2. Enviar Arquivo Preenchido'}</span>
                        <Upload className="h-4 w-4" />
                    </label>
                </div>

                {status.message && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-bold ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {status.message}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* SEÇÃO 2: CRÉDITOS E ZONA DE PERIGO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CARD DE CRÉDITOS */}
        <div className="md:col-span-2 bg-[#112240] text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Code className="h-6 w-6 text-blue-400" />
                    <h3 className="font-bold text-xl">Sobre o Sistema</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Desenvolvedor</p>
                                <p className="font-bold text-lg">Marcio Gama</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Empresa</p>
                                <p className="font-bold text-lg">Flow Metrics</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Copyright className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Direitos</p>
                                <p className="font-medium text-sm text-gray-300">Todos os direitos reservados © 2026</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Stack Tecnológico</p>
                        <div className="flex flex-wrap gap-2">
                            {['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Recharts', 'Lucide Icons', 'XLSX'].map(tech => (
                                <span key={tech} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10 text-blue-200">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Elemento Decorativo de Fundo */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* ZONA DE PERIGO (RESET) */}
        <div className="bg-red-50 rounded-xl border border-red-100 p-6 flex flex-col justify-center items-center text-center">
            <div className="p-3 bg-red-100 rounded-full text-red-600 mb-4">
                <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-red-900 text-lg mb-2">Zona de Perigo</h3>
            <p className="text-xs text-red-700/80 mb-6 leading-relaxed">
                Esta ação apagará <strong>todos</strong> os clientes, tarefas e logs do sistema permanentemente. Não há como desfazer.
            </p>
            <button 
                onClick={handleSystemReset}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 className="h-4 w-4" /> RESETAR SISTEMA
            </button>
        </div>
      </div>

      {/* SEÇÃO 3: CHANGELOG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><History className="h-6 w-6" /></div>
            <h3 className="font-bold text-[#112240] text-lg">Histórico de Versões</h3>
        </div>

        <div className="space-y-8 relative before:absolute before:left-2.5 before:top-2 before:h-full before:w-0.5 before:bg-gray-100">
            {changelog.map((log) => (
                <div key={log.version} className="relative pl-10">
                    <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-4 border-white bg-gray-300 shadow-sm z-10"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase border w-fit ${getVersionColor(log.type)}`}>
                            v{log.version}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{log.date}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-2">{log.title}</h4>
                    <ul className="space-y-1">
                        {log.items.map((item, idx) => (
                            <li key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                                <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-400 flex-shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      </div>

    </div>
  )
}
