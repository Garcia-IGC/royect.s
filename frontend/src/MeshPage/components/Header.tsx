import React from 'react';

interface HeaderProps {
  rut: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ rut, onMenuClick }) => {
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="text-sm px-3 py-2 rounded-md bg-white/80 hover:bg-white shadow border border-gray-200"
        >
          ☰
        </button>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Mallas Curriculares</h1>
        <p className="text-sm text-gray-600">RUT: {rut}</p>
      </div>
    </>
  );
};

export default Header;
