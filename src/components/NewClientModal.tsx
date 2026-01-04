import { useState } from 'react'
import { X, Search } from 'lucide-react'

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewClientModal({ isOpen, onClose }: NewClientModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    cargo: '',
    tipoBrinde: 'Brinde Médio',
    outroBrinde: '',
    quantidade: 1,
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    email: '',
    socio: '',
    observacoes: ''
  })

  const [loadingCep, setLoadingCep] = useState(false)
  const [isNewSocio, setIsNewSocio] = useState(false)

  // Sócios pré-cadastrados (Exemplo)
  const socios = ['Marcio Gama', 'Rodrigo Salomão', 'Outro Sócio']

  if (!isOpen) return null

  // Máscara de CEP (99999-999)
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2')
    }
    setFormData({ ...formData, cep: value })
  }

  // Buscar Endereço via ViaCEP
  const handleCepBlur = async () => {
    const cepClean = formData.cep.replace(/\D/g, '')
    if (cepClean.length === 8) {
      setLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error)
      }
      setLoadingCep(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Dados salvos:", formData)
    // AQUI ENTRARÁ A LÓGICA DO SUPABASE FUTURAMENTE
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#112240]">Novo Cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Coluna 1: Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Dados Cadastrais</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
              <input required type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#112240] focus:ring-1 focus:ring-[#112240]" 
                value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
                  value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cargo</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
                  value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            {/* Sócio Responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Sócio Responsável</label>
              {!isNewSocio ? (
                <select 
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.socio}
                  onChange={(e) => {
                    if(e.target.value === 'new') setIsNewSocio(true)
                    else setFormData({...formData, socio: e.target.value})
                  }}
                >
                  <option value="">Selecione...</option>
                  {socios.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="new" className="font-bold text-blue-600">+ Adicionar Novo...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                   <input type="text" placeholder="Nome do novo sócio" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" autoFocus
                     onChange={e => setFormData({...formData, socio: e.target.value})} />
                   <button type="button" onClick={() => setIsNewSocio(false)} className="mt-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">Cancelar</button>
                </div>
              )}
            </div>
          </div>

          {/* Coluna 2: Brinde e Endereço */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Brinde & Logística</h3>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Brinde</label>
                  <select 
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.tipoBrinde}
                    onChange={e => setFormData({...formData, tipoBrinde: e.target.value})}
                  >
                    <option value="Brinde Médio">Brinde Médio</option>
                    <option value="Brinde VIP">Brinde VIP</option>
                    <option value="Outro">Outro</option>
                  </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                 <input type="number" min="1" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
                   value={formData.quantidade} onChange={e => setFormData({...formData, quantidade: Number(e.target.value)})} />
               </div>
            </div>

            {formData.tipoBrinde === 'Outro' && (
               <div>
                 <label className="block text-sm font-medium text-gray-700">Especifique o Brinde</label>
                 <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-yellow-50" 
                   value={formData.outroBrinde} onChange={e => setFormData({...formData, outroBrinde: e.target.value})} placeholder="Ex: Cesta de Natal" />
               </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <div className="relative">
                  <input type="text" maxLength={9} className="mt-1 block w-full rounded-md border border-gray-300 pl-3 pr-8 py-2" 
                    value={formData.cep} onChange={handleCepChange} onBlur={handleCepBlur} placeholder="00000-000" />
                  {loadingCep && <div className="absolute right-2 top-3 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                </div>
              </div>
              <div className="col-span-2">
                 <label className="block text-sm font-medium text-gray-700">Endereço</label>
                 <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50" 
                   value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">Número</label>
                 <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
                   value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">Complemento</label>
                 <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
                   value={formData.complemento} onChange={e => setFormData({...formData, complemento: e.target.value})} />
               </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
               <div>
                 <label className="block text-sm font-medium text-gray-700">Bairro</label>
                 <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 bg-gray-50" 
                   value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">Cidade</label>
                 <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 bg-gray-50" 
                   value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">UF</label>
                 <input type="text" maxLength={2} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 bg-gray-50 uppercase" 
                   value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} />
               </div>
            </div>
          </div>

          {/* Observações - Ocupa toda a largura */}
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700">Observações</label>
             <textarea rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
               value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})}></textarea>
          </div>

          {/* Botões de Ação */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
             <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
             <button type="submit" className="px-6 py-2 text-white bg-[#112240] hover:bg-[#1a3a6c] rounded-lg font-medium">Salvar Cliente</button>
          </div>

        </form>
      </div>
    </div>
  )
}
