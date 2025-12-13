import React from 'react';

interface SidebarOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

const SidebarOverlay: React.FC<SidebarOverlayProps> = ({ isVisible, onClick }) => {
  if (!isVisible) return null;
  
  return (
    <div
      className="fixed inset-0 z-40 bg-black/30"
      onClick={onClick}
    />
  );
};

export default SidebarOverlay;
