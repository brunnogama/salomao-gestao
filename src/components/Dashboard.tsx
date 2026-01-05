import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Gift, Award } from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  brindeCounts: Record<string, number>;
  lastClients: any[];
  socioData: any[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ 
    totalClients: 0, 
    brindeCounts: {}, 
    lastClients: [], 
    socioData: [] 
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Buscar últimos 10 clientes cadastrados
      const { data: lastClients } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // 2. Buscar todos os dados para processar os gráficos
      const { data: allData } = await supabase
        .from('clientes')
        .select('tipo_brinde, socio');

      const brindeCounts: Record<string, number> = {};
      const socioMap: Record<string, any> = {};

      allData?.forEach(item => {
        // Processar contagem por tipo de Brinde
        if (item.tipo_brinde) {
          brindeCounts[item.tipo_brinde] = (brindeCounts[item.tipo_brinde] || 0) + 1;
        }

        // Processar performance por Sócio
        if (item.socio) {
          if (!socioMap[item.socio]) {
            socioMap[item.socio] = { name: item.socio, total: 0 };
          }
          socioMap[item.socio].total += 1;
          
          // Opcional: contar brindes específicos por sócio
          const brindeKey = `brinde_${item.tipo_brinde}`;
          socioMap[item.socio][brindeKey] = (socioMap[item.socio][brindeKey] || 0) + 1;
        }
      });

      setStats({
        totalClients: allData?.length || 0,
        brindeCounts,
        lastClients: lastClients || [],
        socioData: Object.values(socioMap)
      });
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#112240]"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-10">
      
      {/* Cards Superiores: Quantidade por Tipo de Brinde */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats.brindeCounts).map(([tipo, qtd]) => (
          <div key={tipo} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tipo}</p>
              <p className="text-2xl font-black text-[#112240]">{qtd}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Performance dos Sócios */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-[#112240]">Performance por Sócio (Total de Clientes)</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.socioData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                <Bar 
                  dataKey="total" 
                  name="Total de Clientes" 
                  fill="#112240" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista Lateral: Últimos Cadastros */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-[#112240]">Últimos Cadastros</h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {stats.lastClients.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Nenhum cliente cadastrado.</p>
            ) : (
              stats.lastClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all group">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{client.nome}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{client.socio || 'Sem Sócio'}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-1 rounded-full font-black border ${
                    client.tipo_brinde === 'Brinde VIP' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {client.tipo_brinde?.split(' ')[1] || 'BRINDE'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
