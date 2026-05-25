import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ListPane } from './components/ListPane';
import { elementsApi } from './api/elements';

export default function App() {
  const queryClient = useQueryClient();
  const [newId, setNewId] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Sync selected IDs from server on mount
  useEffect(() => {
    elementsApi.getSelection().then(data => {
        setSelectedIds(data.ids);
    });
  }, []);

  const selectionMutation = useMutation({
    mutationFn: (ids: number[]) => elementsApi.updateSelection(ids),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['elements'] });
    }
  });

  const creationMutation = useMutation({
    mutationFn: (id: number) => elementsApi.addElement(id),
    onSuccess: () => {
        setNewId('');
        queryClient.invalidateQueries({ queryKey: ['elements', 'available'] });
    }
  });

  const handleUpdate = (ids: number[]) => {
      setSelectedIds(ids);
      selectionMutation.mutate(ids);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor)
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
        const oldIds = [...selectedIds];
        const oldIdx = oldIds.indexOf(Number(active.id));
        const newIdx = oldIds.indexOf(Number(over.id));
        
        if (oldIdx !== -1 && newIdx !== -1) {
            const newIds = arrayMove(oldIds, oldIdx, newIdx);
            handleUpdate(newIds);
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased p-8">
      <nav className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
            <h1 className="text-3xl font-black text-slate-900 leading-none">SYSTEM <span className="text-blue-600">REGISTRY</span></h1>
            <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">Test task for Digital Solutions</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-4">
            <div className="flex flex-col">
                <input 
                    type="number" 
                    placeholder="Inject ID"
                    className="border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm font-bold w-40 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={newId} 
                    onChange={e => setNewId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && creationMutation.mutate(parseInt(newId))}
                />
            </div>
            <button 
                onClick={() => creationMutation.mutate(parseInt(newId))}
                disabled={!newId || creationMutation.isPending}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-black hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-lg flex items-center space-x-2"
            >
                {creationMutation.isPending ? 'PROCESSING...' : 'APPEND TO REPO'}
            </button>
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <ListPane type="available" onMove={handleUpdate} localIds={selectedIds} />
            <ListPane type="selected" onMove={handleUpdate} localIds={selectedIds} />
        </DndContext>
      </main>

      <footer className="mt-10 border-t border-slate-200 pt-8 flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
        <span>By Vladislav Lazutchenko (UGamerZ)</span>
      </footer>
    </div>
  );
}
