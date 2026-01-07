import { useState, useEffect, Fragment } from 'react'
import { supabase } from '../lib/supabase'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDown, Plus, Pencil, Trash2, Check, Gift } from 'lucide-react'

interface BrindeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function BrindeSelector({ value, onChange }: BrindeSelectorProps) {
  const [brindes, setBrindes] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingBrinde, setEditingBrinde] = useState<any>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    fetchBrindes()
  }, [])

  const fetchBrindes = async () => {
    const { data } = await supabase
      .from('tipos_brinde')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (data) setBrindes(data)
  }

  const handleAdd = () => {
    setModalMode('add')
    setInputValue('')
    setIsModalOpen(true)
  }

  const handleEdit = (brinde: any) => {
    setModalMode('edit')
    setEditingBrinde(brinde)
    setInputValue(brinde.nome)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!inputValue.trim()) {
      alert('Digite um nome para o tipo de brinde')
      return
    }

    try {
      if (modalMode === 'add') {
        // Criar novo tipo de brinde
        const { error } = await supabase
          .from('tipos_brinde')
          .insert([{ nome: inputValue.trim() }])
        
        if (error) throw error
        
        // Se for o primeiro brinde criado pelo usuário, seleciona automaticamente
        onChange(inputValue.trim())
      } else {
        // Editar tipo de brinde existente
        const { error } = await supabase
          .from('tipos_brinde')
          .update({ nome: inputValue.trim() })
          .eq('id', editingBrinde.id)
        
        if (error) throw error

        // Atualizar em TODOS os registros que usam este brinde
        await supabase
          .from('clientes')
          .update({ tipo_brinde: inputValue.trim() })
          .eq('tipo_brinde', editingBrinde.nome)

        await supabase
          .from('magistrados')
          .update({ tipo_brinde: inputValue.trim() })
          .eq('tipo_brinde', editingBrinde.nome)

        // Se o brinde selecionado for o que está sendo editado, atualiza o valor
        if (value === editingBrinde.nome) {
          onChange(inputValue.trim())
        }
      }

      setIsModalOpen(false)
      setInputValue('')
      setEditingBrinde(null)
      await fetchBrindes()
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`)
    }
  }

  const handleDelete = async (brinde: any) => {
    if (!confirm(`Tem certeza que deseja remover "${brinde.nome}"?\n\nOs registros que usam este tipo manterão o nome, mas ele não aparecerá mais no menu.`)) {
      return
    }

    try {
      // Soft delete - marca como inativo
      const { error } = await supabase
        .from('tipos_brinde')
        .update({ ativo: false })
        .eq('id', brinde.id)
      
      if (error) throw error

      // Se o brinde removido era o selecionado, limpa a seleção
      if (value === brinde.nome) {
        onChange('')
      }

      await fetchBrindes()
    } catch (error: any) {
      alert(`Erro ao remover: ${error.message}`)
    }
  }

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">{value || 'Selecione o tipo de brinde'}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {/* Botão Adicionar Novo */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleAdd}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-2 border-b border-gray-200 ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Adicionar Novo Tipo</span>
                </button>
              )}
            </Menu.Item>

            {/* Lista de Brindes */}
            {brindes.map((brinde) => (
              <Menu.Item key={brinde.id}>
                {({ active }) => (
                  <div
                    className={`px-4 py-2 flex items-center justify-between group ${
                      active ? 'bg-gray-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => onChange(brinde.nome)}
                      className="flex-1 text-left flex items-center gap-2"
                    >
                      {value === brinde.nome && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                      <span className={value === brinde.nome ? 'font-medium text-blue-600' : 'text-gray-700'}>
                        {brinde.nome}
                      </span>
                    </button>

                    {/* Botões de Editar/Excluir (aparecem no hover) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(brinde)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(brinde)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </Menu.Item>
            ))}

            {brindes.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhum tipo de brinde cadastrado
              </div>
            )}
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Modal de Adicionar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {modalMode === 'add' ? 'Adicionar Tipo de Brinde' : 'Editar Tipo de Brinde'}
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Tipo
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Ex: Brinde VIP, Brinde Premium..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setInputValue('')
                  setEditingBrinde(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {modalMode === 'add' ? 'Adicionar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}