import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, MapPin, Plus, Search, Download, RefreshCcw, Pencil, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  socio: string;
  tipo_brinde: string;
  uf: string;
  email: string;
}

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  const deleteClient = async (id: string) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      await supabase.from('clientes').delete().eq('id', id);
      fetchClients();
    }
  };

  const filteredClients = clients.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center font-medium text-gray-500">Carregando base de clientes...</div>;

  return (
    <div className="flex flex-col h-full space-y-4 animate-fadeIn">
      {/* Barra de Ferramentas Sólida */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar cliente..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchClients} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-xs shadow-sm">
            <Download className="h-4 w-4" /> EXPORTAR XLS
          </button>
          <button className="flex items-center gap-2 bg-[#112240] text-white px-4 py-2 rounded-lg hover:bg-black transition-colors font-bold text-xs shadow-sm">
            <Plus className="h-4 w-4" /> NOVO CLIENTE
          </button>
        </div>
      </div>

      {/* Grid de Cards Sólidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-full font-bold text-sm border border-blue-100">
                {client.nome?.charAt(0)}
              </div>
              <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                client.tipo_brinde === 'Brinde VIP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {client.tipo_brinde || 'PADRÃO'}
              </span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2 truncate">{client.nome}</h3>
            <div className="text-xs text-gray-500 space-y-2">
              <p className="flex items-center gap-2 font-medium"><User className="h-3.5 w-3.5 text-gray-400" /> {client.socio}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" /> {client.telefone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {client.uf}</p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => deleteClient(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
