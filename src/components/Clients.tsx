import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, MapPin, Plus, Search, Download, RefreshCcw, Pencil, Trash2, X, Mail, Gift } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  socio: string;
  tipo_brinde: string;
  uf: string;
  email: string;
  cidade?: string;
}

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from('clientes').select('*').order('nome');
    if (data) setClients(data as Client[]);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clients);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "CRM_Salomao_Clientes.xlsx");
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede de abrir o modal de detalhes
    if (confirm('Deseja realmente excluir este cliente?')) {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (!error) fetchClients();
    }
  };

  const handleEdit = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede de abrir o modal de detalhes
    alert('Abrir formulário de edição para: ' + client.nome);
    // Aqui você chamará seu componente de formulário de edição futuramente
  };

  const handleNewClient = () => {
    alert('Abrir formulário de novo cadastro');
    // Aqui você chamará seu componente de criação futuramente
  };

  const getBrindeColor = (tipo: string) => {
    if (tipo === 'Brinde VIP') return '#a855f7';
    if (tipo === 'Brinde Médio') return '#22c55e';
    return '#94a3b8';
  };

  const filteredClients = clients.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center font-medium text-gray-400">
      <RefreshCcw className="animate-spin h-6 w-6 mr-2" /> Carregando base...
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn pb-10">
      {/* Toolbar Sólida */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 items-center flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchClients} className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
            <RefreshCcw className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">
            <Download className="h-4 w-4" /> EXPORTAR XLS
          </button>
          <button onClick={handleNewClient} className="flex items-center gap-2 bg-[#112240] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-black transition-all">
            <Plus className="h-4 w-4" /> NOVO CLIENTE
          </button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {filteredClients.map((client) => (
          <div 
            key={client.id} 
            onClick={() => setSelectedClient(client)}
            className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 bg-gray-50 text-[#112240] flex items-center justify-center rounded-xl font-bold border border-gray-100">
                {client.nome?.charAt(0)}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[9px] font-black px-2 py-1 rounded border tracking-wider" style={{ color: getBrindeColor(client.tipo_brinde), borderColor: `${getBrindeColor(client.tipo_brinde)}30`, backgroundColor: `${getBrindeColor(client.tipo_brinde)}10` }}>
                  {client.tipo_brinde?.split(' ')[1] || 'BRINDE'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEdit(client, e)} className="p-1.5 bg-gray-50 rounded-md border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={(e) => handleDelete(client.id, e)} className="p-1.5 bg-gray-50 rounded-md border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <h4 className="font-bold text-[#112240] text-sm mb-3 truncate">{client.nome}</h4>
            <div className="space-y-2 text-xs text-gray-500">
              <p className="flex items-center gap-2"><User className="h-3 w-3 text-gray-300" /> {client.socio || 'N/A'}</p>
              <p className="flex items-center gap-2"><Phone className="h-3 w-3 text-gray-300" /> {client.telefone || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detalhes */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#112240] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedClient.nome}</h2>
              <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">E-mail</label><p className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-gray-300" /> {selectedClient.email || 'Não informado'}</p></div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Sócio</label><p className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4 text-gray-300" /> {selectedClient.socio}</p></div>
               </div>
               <div className="space-y-4">
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Brinde</label><p className="text-sm font-medium flex items-center gap-2"><Gift className="h-4 w-4 text-gray-300" /> {selectedClient.tipo_brinde}</p></div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">UF</label><p className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-300" /> {selectedClient.uf}</p></div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
