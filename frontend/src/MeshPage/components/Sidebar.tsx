import React from 'react';
import { ViewType, NAVIGATION_ITEMS } from '../constants/navigation';

interface SidebarProps {
  isOpen: boolean;
  currentView: ViewType;
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentView, onClose, onNavigate }) => {
  const getButtonClass = (itemId: ViewType) =>
    `w-full text-left text-sm px-3 py-2 rounded border ${
      currentView === itemId
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
    }`;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r transform transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Mi panel</h2>
        <button
          onClick={onClose}
          className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          Cerrar
        </button>
      </div>

      <nav className="p-3 space-y-2">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={getButtonClass(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
