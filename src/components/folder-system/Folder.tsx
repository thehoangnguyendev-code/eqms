import React, { useState } from 'react';
import './Folder.css';

interface Offset {
  x: number;
  y: number;
}

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const Folder: React.FC<FolderProps> = ({ 
  color = '#5227FF', 
  size = 1, 
  items = [], 
  className = '', 
  isOpen: externalOpen, 
  onOpenChange 
}) => {
  const maxItems = 3;
  const papers = [...items].slice(0, maxItems);
  while (papers.length < maxItems) {
    papers.push(
      <div key={`placeholder-${papers.length}`} className="flex flex-col gap-1.5 p-3 pointer-events-none opacity-80 scale-90">
        <div className="w-[85%] h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.3 }} />
        <div className="w-full h-0.5 bg-slate-100 rounded-full" />
        <div className="w-full h-0.5 bg-slate-100 rounded-full" />
        <div className="w-4/5 h-0.5 bg-slate-50 rounded-full" />
      </div>
    );
  }

  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  
  const [paperOffsets, setPaperOffsets] = useState<Offset[]>(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor('#ffffff', 0.1);
  const paper2 = darkenColor('#ffffff', 0.05);
  const paper3 = '#ffffff';

  const handlePointerEnter = () => {
    if (externalOpen === undefined) setInternalOpen(true);
    onOpenChange?.(true);
  };

  const handlePointerLeave = () => {
    if (externalOpen === undefined) setInternalOpen(false);
    onOpenChange?.(false);
    setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
  };

  const handlePaperPointerMove = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (!open) return;
    // On touch devices, don't follow the finger exactly as it covers the element
    if (e.pointerType === 'touch') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperPointerLeave = (index: number) => {
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const folderStyle = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3
  } as React.CSSProperties;

  const folderClassName = `folder ${open ? 'open' : ''}`.trim();
  const scaleStyle = { transform: `scale(${size})` };

  return (
    <div 
      style={scaleStyle} 
      className={className}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className={folderClassName} style={folderStyle}>
        <div className="folder__back">
          {papers.map((item, i) => (
            <div
              key={i}
              className={`paper paper-${i + 1}`}
              onPointerMove={e => handlePaperPointerMove(e, i)}
              onPointerLeave={() => handlePaperPointerLeave(i)}
              style={
                open
                  ? {
                      '--magnet-x': `${paperOffsets[i]?.x || 0}px`,
                      '--magnet-y': `${paperOffsets[i]?.y || 0}px`
                    } as React.CSSProperties
                  : {}
              }
            >
              {item}
            </div>
          ))}
          <div className="folder__front"></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
