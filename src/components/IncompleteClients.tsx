import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, ArrowRight, RefreshCcw, User, Gift, Phone, X, MapPin } from 'lucide-react';

export function IncompleteClients() {
  const [pendings, setPendings] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const fetchPendings = async () => {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .or('tipo_brinde.is.null,socio.is.null,telefone.is.null');
    if (data) setPendings(data);
  };

  useEffect(() => { fetchPendings(); }, []);

  const getBrindeColor = (tipo: string) => {
    if (tipo === 'Brinde VIP') return '#a855f7';
    if (tipo === 'Brinde Médio') return '#22c55e';
    return '#94a3b8';
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn pb-10">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-lg shadow-red-100/50">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-black text-[#112240] text-lg">Pendências de Cadastro</h3>
            <p className="text-xs text-gray-500">Atenção aos cadastros que necessitam de preenchimento imediato.</p>
          </div>
        </div>
        <button onClick={fetchPendings} className="flex items-center gap-2 bg-white border border-gray-100 px-5 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-gray-50 transition-all active:scale-90">
          <RefreshCcw className="h-4 w-4" /> ATUALIZAR LISTA
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] border border-white/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sócio Responsável</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Campos Faltantes</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pendings.map((client) => (
                <tr 
                  key={client.id} 
                  onClick={() => setSelectedClient(client)}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-gray-800">{client.nome}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{client.email || 'E-mail ausente'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-[#112240] bg-white border border-gray-100 px-3 py-1 rounded-lg shadow-sm">
                      {client.socio || 'NÃO ATRIBUÍDO'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {!client.tipo_brinde && <span className="bg-red-50 text-red-600 text-[8px] font-black px-2.5 py-1 rounded-full border border-red-100">ESPEC. BRINDE</span>}
                      {!client.telefone && <span className="bg-amber-50 text-amber-600 text-[8px] font-black px-2.5 py-1 rounded-full border border-amber-100">NÚMERO</span>}
                      {!client.socio && <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2.5 py-1 rounded-full border border-indigo-100">SÓCIO</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all"><ArrowRight className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes - Reaproveitado do Clientes */}
      {selectedClient && (
        <div className="fixed inset-0 bg-[#112240]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden animate-scaleIn">
            <div className="bg-red-600 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl"><AlertCircle className="h-8 w-8 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedClient.nome}</h2>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Cadastro com Pendências</p>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-10 text-center">
               <p className="text-gray-500 mb-6">Este cliente possui informações incompletas no banco de dados. Por favor, acesse a edição para regularizar.</p>
               <button className="bg-[#112240] text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl hover:bg-black transition-all">CORRIGIR AGORA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
