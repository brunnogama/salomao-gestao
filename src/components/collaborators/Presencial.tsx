import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, Search, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'

interface PresenceRecord {
  id: string;
  nome: string;
  data: string; // Formatado BR
  hora: string;
  rawDate: Date; // Para ordenação futura
}

export function Presencial() {
  const [records, setRecords] = useState<PresenceRecord[]>([])
  const [fileName, setFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = XLSX.utils.sheet_to_json(ws)

      const processedData: PresenceRecord[] = data.map((row: any, index) => {
        // Formato esperado: "2025-11-19 16:54:41"
        const tempoRaw = row['Tempo'] || ''
        let dataFormatada = '-'
        let horaFormatada = '-'
        let dataObjeto = new Date()

        if (typeof tempoRaw === 'string' && tempoRaw.includes(' ')) {
          const [datePart, timePart] = tempoRaw.split(' ')
          const [year, month, day] = datePart.split('-')
          
          dataFormatada = `${day}/${month}/${year}`
          horaFormatada = timePart
          dataObjeto = new Date(tempoRaw)
        }

        return {
          id: `row-${index}`,
          nome: row['Nome'] || 'Desconhecido',
          data: dataFormatada,
          hora: horaFormatada,
          rawDate: dataObjeto
        }
      })

      setRecords(processedData)
    }
    reader.readAsBinaryString(file)
  }

  const handleTriggerUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 space-y-6">
      
      {/* Header da Página com Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#112240]">Controle de Presença</h2>
          <p className="text-sm text-gray-500">Importe a planilha da portaria para visualizar os acessos.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão de Upload Escondido */}
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          
          <button 
            onClick={handleTriggerUpload}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Importar XLSX</span>
          </button>
        </div>
      </div>

      {/* Área de Conteúdo */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        {/* Barra de Filtros (Placeholder Visual) */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {records.length > 0 ? (
               <span>Mostrando <strong>{records.length}</strong> registros do arquivo <em>{fileName}</em></span>
            ) : (
               <span>Nenhum arquivo importado.</span>
            )}
          </div>
          <div className="flex gap-2">
             <button className="p-2 text-gray-400 hover:text-[#112240] transition-colors" title="Filtrar"><Filter className="h-4 w-4" /></button>
             <button className="p-2 text-gray-400 hover:text-[#112240] transition-colors" title="Buscar"><Search className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <Upload className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aguardando importação</p>
              <p className="text-sm">Clique em "Importar XLSX" para começar</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-200">Nome do Colaborador</th>
                  <th className="px-6 py-4 border-b border-gray-200 w-48">Data</th>
                  <th className="px-6 py-4 border-b border-gray-200 w-48">Hora de Entrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50/50 transition-colors group text-sm text-gray-700">
                    <td className="px-6 py-3 font-medium text-[#112240]">{record.nome}</td>
                    <td className="px-6 py-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200 font-mono">
                        {record.data}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                        <span className="text-gray-500 font-mono">
                            {record.hora}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
