import { useState, useEffect, useMemo } from 'react'
import { Plus, Filter, LayoutList, LayoutGrid, Pencil, X, ChevronDown, RefreshCw, MessageCircle, Phone, MapPin, Mail, Briefcase, Gift, User } from 'lucide-react'
import { NewClientModal, ClientData } from './NewClientModal'
import { supabase } from '../lib/supabase'

interface Client extends ClientData {
  id: number;
}

export function Clients() {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [socioFilter, setSocioFilter] = useState('')
  const [clients, setClients] = useState<Client[]>([])

  const fetchClients = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('clientes').select('*')
    if (error) {
      console.error('Erro ao buscar clientes:', error)
    } else {
      const formattedClients: Client[] = data.map((item: any) => ({
        id: item.id,
        nome: item.nome,
        empresa: item.empresa,
        cargo: item.cargo,
        telefone: item.telefone,
        tipoBrinde: item.tipo_brinde,
        outroBrinde: item.outro_brinde,
        quantidade: item.quantidade,
        cep: item.cep,
        endereco: item.endereco,
        numero: item.numero,
        complemento: item.complemento,
        bairro: item.bairro,
        cidade: item.cidade,
        estado: item.estado,
        email: item.email,
        socio: item.socio,
        observacoes: item.observacoes
      }))
      setClients(formattedClients)
    }
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  const handleWhatsApp = (client: Client, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    const cleanPhone = client.telefone ? client.telefone.replace(/\D/g, '') : ''
    if(!cleanPhone) return

    const message = `Olá Sr(a). ${client.nome}, somos do Salomão Advogados.

Estamos atualizando nossa base de dados. Poderia, por gentileza, confirmar se as informações abaixo estão corretas?

🏢 *Empresa:* ${client.empresa || '-'}
📮 *CEP:* ${client.cep || '-'}
📍 *Endereço:* ${client.endereco || '-'}
🔢 *Número:* ${client.numero || '-'}
🏘️ *Bairro:* ${client.bairro || '-'}
🏙️ *Cidade/UF:* ${client.cidade || '-'}/${client.estado || '-'}
📝 *Complemento:* ${client.complemento || '-'}
📧 *E-mail:* ${client.email || '-'}

📱 *Outro número de telefone:* (Caso possua, por favor informar)

Agradecemos a atenção!`

    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleEdit = (client: Client, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setSelectedClient(null); // Fecha visualização para evitar sobreposição
    setClientToEdit(client);
    setTimeout(() => setIsModalOpen(true), 10);
  }

  const uniqueSocios = useMemo(() => 
    Array.from(new Set(clients.map(c => c.socio).filter(Boolean))).sort()
  , [clients])

  const processedClients = useMemo(() => {
    let result = [...clients].filter(client => 
      socioFilter ? client.socio === socioFilter : true
    )
    result.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    return result
  }, [clients, socioFilter])

  return (
    <div className="h-full flex flex-col relative">
      <NewClientModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setClientToEdit(null); }} 
        onSave={fetchClients} 
        clientToEdit={clientToEdit} 
      />

      {/* MODAL VISUALIZAÇÃO DETALHADA */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-scaleIn">
            <div className="bg-[#112240] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedClient.nome}</h2>
              <div className="flex items-center gap-2">
                <button onClick={(e) => handleWhatsApp(selectedClient, e)} className="p-2 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors" title="WhatsApp Formal"><MessageCircle className="h-5 w-5" /></button>
                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="h-6 w-6" /></button>
              </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Dados Corporativos</h3>
                <p className="text-sm flex items-center gap-3"><Briefcase className="h-4 w-4 text-blue-600" /> {selectedClient.empresa}</p>
                <p className="text-sm flex items-center gap-3"><Mail className="h-4 w-4 text-blue-600" /> {selectedClient.email || '-'}</p>
                <p className="text-sm flex items-center gap-3"><Phone className="h-4 w-4 text-blue-600" /> {selectedClient.telefone || '-'}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Logística</h3>
                <p className="text-sm flex items-center gap-3"><MapPin className="h-4 w-4 text-blue-600" /> {selectedClient.endereco}, {selectedClient.numero}</p>
                <p className="text-sm flex items-center gap-3"><Gift className="h-4 w-4 text-blue-600" /> {selectedClient.tipoBrinde} ({selectedClient.quantidade}x)</p>
                <p className="text-sm flex items-center gap-3"><User className="h-4 w-4 text-blue-600" /> Sócio: {selectedClient.socio}</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={(e) => handleEdit(selectedClient, e)} className="px-5 py-2.5 bg-[#112240] text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-md">
                <Pencil className="h-4 w-4" /> Editar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 px-1">
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select value={socioFilter} onChange={(e) => setSocioFilter(e.target.value)} className="appearance-none pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium min-w-[160px] outline-none">
              <option value="">Sócio: Todos</option>
              {uniqueSocios.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-gray-100 text-[#112240]' : 'text-gray-400'}`}><LayoutList className="h-5 w-5" /></button>
            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md ${viewMode === 'card' ? 'bg-gray-100 text-[#112240]' : 'text-gray-400'}`}><LayoutGrid className="h-5 w-5" /></button>
          </div>
          <button onClick={fetchClients} className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
        <button onClick={() => { setClientToEdit(null); setIsModalOpen(true); }} className="px-5 py-2.5 bg-[#112240] text-white rounded-lg hover:bg-[#1a3a6c] transition-all shadow-md flex items-center gap-2 font-bold text-sm"><Plus className="h-5 w-5" /> Novo Cliente</button>
      </div>

      {/* GRID DE CARDS */}
      <div className="flex-1 overflow-auto pb-4">
        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {processedClients.map(client => (
              <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group cursor-pointer animate-fadeIn">
                <div className="flex items-start justify-between mb-3">
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{client.nome}</h3>
                    <p className="text-xs text-gray-500 truncate">{client.empresa}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${client.tipoBrinde === 'Brinde VIP' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{client.tipoBrinde}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button onClick={(e) => handleWhatsApp(client, e)} className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"><MessageCircle className="h-4 w-4" /></button>
                  </div>
                  <button onClick={(e) => handleEdit(client, e)} className="p-1.5 text-gray-500 hover:text-[#112240] rounded-md transition-colors"><Pencil className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">Cliente</th>
                  <th className="px-6 py-4 text-left">Sócio</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedClients.map(client => (
                  <tr key={client.id} onClick={() => setSelectedClient(client)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4"><div className="text-sm font-bold text-gray-900">{client.nome}</div></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.socio}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => handleEdit(client, e)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
