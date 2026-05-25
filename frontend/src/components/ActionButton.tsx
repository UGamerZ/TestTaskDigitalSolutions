import React from 'react';
import type { ActionButtonProps } from '../types';

export const ActionButton: React.FC<ActionButtonProps> = React.memo(({ onClick, label, variant = 'blue' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
        green: 'bg-green-600 text-white hover:bg-green-700',
        red: 'bg-red-50 text-red-600 hover:bg-red-100'
    };
    
    return (
        <button 
            onClick={onClick}
            className={`${colors[variant]} text-xs font-bold px-3 py-1.5 rounded transition-colors`}
        >
            {label}
        </button>
    );
});

ActionButton.displayName = 'ActionButton';
