import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Clock, CheckCircle2, Circle, X, Pencil, Trash2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
}

const COLUMNS = [
  { id: 'todo', title: 'A Fazer', color: 'orange', icon: <Clock className="h-5 w-5" /> },
  { id: 'in_progress', title: 'Em Progresso', color: 'blue', icon: <Circle className="h-5 w-5" /> },
  { id: 'done', title: 'Concluídos', color: 'green', icon: <CheckCircle2 className="h-5 w-5" /> },
];

export function Kanban() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Task['status'];
    
    // Atualização Otimista no Front
    const updatedTasks = tasks.map(t => t.id === draggableId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    // Atualização no Banco
    await supabase.from('tasks').update({ status: newStatus }).eq('id', draggableId);
  };

  const getColumnColor = (color: string) => {
    const mapping: any = {
      orange: 'bg-orange-50 border-orange-200 text-orange-700 header-orange',
      blue: 'bg-blue-50 border-blue-200 text-blue-700 header-blue',
      green: 'bg-green-50 border-green-200 text-green-700 header-green',
    };
    return mapping[color];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#112240]">Kanban de Tarefas</h1>
        <p className="text-sm text-gray-500">Gerencie suas tarefas de forma visual</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <div key={column.id} className={`flex-shrink-0 w-80 lg:w-96 flex flex-col rounded-xl border ${getColumnColor(column.color).split(' header')[0]}`}>
              {/* Header Coluna */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-700">
                  <span className={column.color === 'orange' ? 'text-orange-600' : column.color === 'blue' ? 'text-blue-600' : 'text-green-600'}>
                    {column.icon}
                  </span>
                  {column.title}
                </div>
                <span className="bg-gray-200/50 px-2 py-0.5 rounded-full text-xs font-bold text-gray-600">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>

              {/* Botão Nova Tarefa */}
              <div className="px-4 mb-2">
                <button className={`w-full py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm ${
                  column.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : 
                  column.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                }`}>
                  <Plus className="h-4 w-4" /> Nova Tarefa
                </button>
              </div>

              {/* Área de Drop */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                  >
                    {tasks.filter(t => t.status === column.id).length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                        <Plus className="h-10 w-10 mb-2" />
                        <span className="text-sm">Nenhuma tarefa</span>
                      </div>
                    )}
                    
                    {tasks.filter(t => t.status === column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 hover:border-gray-300 transition-all group ${
                              snapshot.isDragging ? 'shadow-xl rotate-2 border-blue-400' : ''
                            }`}
                          >
                            <h4 className="font-bold text-gray-800 text-sm mb-1">{task.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold">
                                {task.priority}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal Detalhes (Print 2) */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
            <div className="bg-[#112240] p-6 text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">Detalhes da Tarefa</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Pencil className="h-5 w-5" /></button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"><Trash2 className="h-5 w-5" /></button>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Título</label>
                <h3 className="text-xl font-bold text-gray-800">{selectedTask.title}</h3>
              </div>

              <div className="mb-8">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Descrição</label>
                <p className="text-gray-600 leading-relaxed">{selectedTask.description || 'Sem descrição.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Prioridade</label>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-bold">{selectedTask.priority}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Status</label>
                  <span className="text-sm font-bold text-gray-700 capitalize">
                    {COLUMNS.find(c => c.id === selectedTask.status)?.title}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-400 font-medium">
                CRIADO EM {new Date(selectedTask.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
