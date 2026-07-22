import React from 'react';
import { Menu, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface TopBarProps {
  title: string;
  icon?: React.ReactNode;
  toggleSidebar?: () => void;
  weekRange?: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onExport?: () => void;
}

export default function TopBar({ title, icon, toggleSidebar, weekRange, onPrevWeek, onNextWeek, onExport }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="page-title">
        {toggleSidebar && (
          <button className="md:hidden mr-2 btn-icon" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
        )}
        {icon}
        {title}
        
        {weekRange && (
          <div className="week-nav ml-4">
            <button className="btn-icon" onClick={onPrevWeek}>
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <span style={{ fontWeight: 600 }}>{weekRange}</span>
            <button className="btn-icon" onClick={onNextWeek}>
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {onExport && (
          <button className="btn-secondary flex items-center gap-2" onClick={onExport}>
            <Download size={16} /> Exportar PDF
          </button>
        )}
      </div>
    </header>
  );
}