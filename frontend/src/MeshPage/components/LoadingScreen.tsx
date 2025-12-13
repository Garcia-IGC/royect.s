import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-xl shadow px-4 py-3 text-sm text-gray-700">
        Cargando mallas…
      </div>
    </div>
  );
};

export default LoadingScreen;
