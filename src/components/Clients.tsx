import { useState, useMemo } from 'react'
import { Plus, Filter, LayoutList, LayoutGrid, MoreVertical, X } from 'lucide-react'
import { NewClientModal } from './NewClientModal'

// Interface para tipar nosso Cliente
interface Client {
  id: number;
  nome: string;
  empresa: string;
  cargo: string;
  brinde: string;
  socio: string;
  cidade: string;
}

export function Clients() {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Estados para os Filtros
  const [socioFilter, setSocioFilter] = useState('')
  const [brindeFilter, setBrindeFilter] = useState('')

  // Dados Mockados (Simulando o Banco de Dados)
  const clients: Client[] = [
    { id: 1, nome: 'Carlos Eduardo', empresa: 'Tech Solutions', cargo: 'CEO', brinde: 'Brinde VIP', socio: 'Marcio Gama', cidade: 'São Paulo/SP' },
    { id: 2, nome: 'Ana Paula', empresa: 'Retail Corp', cargo: 'Diretora', brinde: 'Brinde Médio', socio: 'Rodrigo Salomão', cidade: 'Rio de Janeiro/RJ' },
    { id: 3, nome: 'Roberto Alves', empresa: 'Logística SA', cargo: 'Gerente', brinde: 'Brinde Médio', socio: 'Marcio Gama', cidade: 'Curitiba/PR' },
    { id: 4, nome: 'Fernanda Lima', empresa: 'Finance Group', cargo: 'CFO', brinde: 'Brinde VIP', socio: 'Outro Sócio', cidade: 'Belo Horizonte/MG' },
    { id: 5, nome: 'Juliana Costa', empresa: 'Mkt Digital', cargo: 'Head', brinde: 'Outro', socio: 'Rodrigo Salomão', cidade: 'São Paulo/SP' },
  ]

  // 1. Extrair opções únicas para os filtros automaticamente baseados nos dados
  const uniqueSocios = Array.from(new Set(clients.map(c => c.socio)))
  const uniqueBrindes = Array.from(new Set(clients.map(c => c.brinde)))

  // 2. Lógica de Filtragem
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSocio = socioFilter ? client.socio === socioFilter : true
      const matchesBrinde = brindeFilter ? client.brinde === brindeFilter : true
      return matchesSocio && matchesBrinde
    })
  }, [clients, socioFilter, brindeFilter])

  // Função para limpar filtros
  const clearFilters = () => {
    setSocioFilter('')
    setBrindeFilter('')
  }

  return (
    <div className="h-full flex flex-col">
      <NewClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Barra de Ferramentas */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        
        {/* Filtros Funcionais */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
           
           {/* Dropdown Filtro Sócio */}
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
             <select 
                value={socioFilter}
                onChange={(e) => setSocioFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#112240] cursor-pointer"
             >
                <option value="">Todos os Sócios</option>
                {uniqueSocios.map(socio => (
                  <option key={socio} value={socio}>{socio}</option>
                ))}
             </select>
           </div>

           {/* Dropdown Filtro Brinde */}
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
             <select 
                value={brindeFilter}
                onChange={(e) => setBrindeFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#112240] cursor-pointer"
             >
                <option value="">Todos os Brindes</option>
                {uniqueBrindes.map(brinde => (
                  <option key={brinde} value={brinde}>{brinde}</option>
                ))}
             </select>
           </div>
           
           {/* Botão Limpar (aparece só se tiver filtro ativo) */}
           {(socioFilter || brindeFilter) && (
             <button 
               onClick={clearFilters}
               className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center"
             >
               <X className="h-3 w-3 mr-1" /> Limpar
             </button>
           )}

           <div className="h-6 w-px bg-gray-300 mx-2"></div>

           {/* Alternar Visualização */}
           <div className="flex bg-gray-200 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-[#112240]' : 'text-gray-500 hover:text-gray-700'}`}
                title="Lista"
              >
                <LayoutList className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow text-[#112240]' : 'text-gray-500 hover:text-gray-700'}`}
                title="Cards"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
           </div>
        </div>

        {/* Botão Adicionar */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[#112240] text-white rounded-lg hover:bg-[#1a3a6c] transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Conteúdo da Lista Filtrada */}
      <div className="flex-1 overflow-auto">
        
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>Nenhum cliente encontrado com os filtros selecionados.</p>
            <button onClick={clearFilters} className="text-[#112240] font-bold hover:underline mt-2">Limpar filtros</button>
          </div>
        ) : (
          <>
            {/* MODO LISTA (TABELA) */}
            {viewMode === 'list' && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brinde</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sócio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{client.nome}</span>
                            <span className="text-xs text-gray-500">{client.empresa}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cargo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.brinde === 'Brinde VIP' ? 'bg-purple-100 text-purple-800' : 
                            client.brinde === 'Brinde Médio' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.brinde}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.socio}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cidade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MODO CARDS */}
            {viewMode === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            client.brinde === 'Brinde VIP' ? 'bg-purple-100 text-purple-800' : 
                            client.brinde === 'Brinde Médio' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.brinde}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                          {client.nome.charAt(0)}
                      </div>
                      <div>
                          <h3 className="text-lg font-medium text-gray-900">{client.nome}</h3>
                          <p className="text-sm text-gray-500">{client.empresa}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong className="font-medium text-gray-700">Cargo:</strong> {client.cargo}</p>
                      <p><strong className="font-medium text-gray-700">Sócio:</strong> {client.socio}</p>
                      <p><strong className="font-medium text-gray-700">Local:</strong> {client.cidade}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button className="text-[#112240] font-medium text-sm hover:underline">Ver Detalhes</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
