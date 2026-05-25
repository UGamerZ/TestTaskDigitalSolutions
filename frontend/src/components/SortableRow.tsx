import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionButton } from './ActionButton';

interface SortableRowProps {
    id: number;
    onAction?: (id: number) => void;
    actionLabel?: string;
    isSortable: boolean;
}

export const SortableRow: React.FC<SortableRowProps> = React.memo(({ id, onAction, actionLabel, isSortable }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id.toString(), disabled: !isSortable });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border-b bg-white flex justify-between items-center group transition-shadow ${
        isDragging ? 'shadow-2xl' : ''
      } ${
        isSortable ? 'cursor-grab active:cursor-grabbing border-l-2 border-l-transparent hover:border-l-blue-400' : ''
      }`}
    >
      <div className="flex items-center space-x-3" {...(isSortable ? listeners : {})} {...(isSortable ? attributes : {})}>
        {isSortable && <div className="text-gray-300 group-hover:text-blue-400 select-none">⠿</div>}
        <span className="font-mono text-sm font-medium text-slate-600">#{id}</span>
      </div>
      {onAction && actionLabel && (
        <ActionButton 
            onClick={() => onAction(id)} 
            label={actionLabel} 
            variant={actionLabel === 'Select' ? 'blue' : 'red'} 
        />
      )}
    </div>
  );
});

SortableRow.displayName = 'SortableRow';
