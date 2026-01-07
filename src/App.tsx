import { Grid, LogOut, UserCircle, Menu, X } from 'lucide-react'

export default function App() {
  // Simulando a cor de fundo da sua sidebar (#112240)
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* OPÇÃO 1: BADGE TECH (Moderno) */}
        <div className="bg-[#112240] w-64 h-40 p-6 rounded-xl shadow-xl flex flex-col relative">
          <p className="absolute top-2 right-2 text-[10px] text-white/30">Opção 1</p>
          <img src="/logo-branca.png" alt="Salomão" className="h-8 w-auto object-contain block mb-2" />
          
          {/* Implementação Opção 1 */}
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 w-fit">
            <span className="text-[10px] font-bold text-blue-200 tracking-wider">CRM SYSTEM</span>
          </div>
        </div>

        {/* OPÇÃO 2: TIPOGRAFIA PREMIUM (Clássico) */}
        <div className="bg-[#112240] w-64 h-40 p-6 rounded-xl shadow-xl flex flex-col relative">
          <p className="absolute top-2 right-2 text-[10px] text-white/30">Opção 2</p>
          <img src="/logo-branca.png" alt="Salomão" className="h-8 w-auto object-contain block mb-1" />
          
          {/* Implementação Opção 2 */}
          <div className="pl-0.5">
            <p className="text-[9px] text-gray-400 font-medium tracking-[0.35em] uppercase opacity-80">
              Módulo CRM
            </p>
          </div>
        </div>

        {/* OPÇÃO 3: LINHA VERTICAL (Estrutural) */}
        <div className="bg-[#112240] w-64 h-40 p-6 rounded-xl shadow-xl flex flex-col relative">
          <p className="absolute top-2 right-2 text-[10px] text-white/30">Opção 3</p>
          <img src="/logo-branca.png" alt="Salomão" className="h-8 w-auto object-contain block mb-2" />
          
          {/* Implementação Opção 3 */}
          <div className="flex items-center gap-3 border-l-2 border-blue-500/50 pl-3 ml-0.5 h-6">
            <span className="text-xs font-bold text-gray-300 tracking-widest">CRM</span>
          </div>
        </div>

        {/* OPÇÃO 4: CARD GLASS (Robusto) */}
        <div className="bg-[#112240] w-64 h-40 p-6 rounded-xl shadow-xl flex flex-col relative">
          <p className="absolute top-2 right-2 text-[10px] text-white/30">Opção 4</p>
          <img src="/logo-branca.png" alt="Salomão" className="h-8 w-auto object-contain block mb-3" />
          
          {/* Implementação Opção 4 */}
          <div className="bg-white/5 rounded-md py-1 px-3 flex items-center justify-center border border-white/10 w-full">
            <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Gestão CRM</span>
          </div>
        </div>

        {/* OPÇÃO 5: ASSINATURA (Minimalista) */}
        <div className="bg-[#112240] w-64 h-40 p-6 rounded-xl shadow-xl flex flex-col relative">
          <p className="absolute top-2 right-2 text-[10px] text-white/30">Opção 5</p>
          <img src="/logo-branca.png" alt="Salomão" className="h-9 w-auto object-contain block" />
          
          {/* Implementação Opção 5 */}
          <div className="flex justify-end -mt-1 pr-1">
            <span className="text-[9px] font-bold text-blue-300/80 tracking-widest">
              v1.6 • CRM
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}