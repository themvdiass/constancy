import React, { useRef, useState } from 'react';
import { Icon } from '@iconify/react';

// Barra de arrastar para resetar tudo (arrasta para a esquerda)
export default function DragResetBar({ onReset }) {
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [completed, setCompleted] = useState(false);
  const barRef = useRef(null);

  const handleDragStart = (e) => {
    setDragging(true);
    setCompleted(false);
    setDragX(0);
    e.preventDefault();
  };

  const handleDrag = (e) => {
    if (!dragging) return;
    let clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    let x = rect.right - clientX; // arrasta da direita para a esquerda
    x = Math.max(0, Math.min(x, rect.width));
    setDragX(x);
    if (x > rect.width * 0.92 && !completed) {
      setCompleted(true);
      setTimeout(() => {
        setDragging(false);
        setDragX(0);
        setCompleted(false);
        onReset();
      }, 200);
    }
  };

  const handleDragEnd = () => {
    setDragging(false);
    setDragX(0);
    setCompleted(false);
  };

  return (
    <div
      ref={barRef}
      className="drag-reset-bar"
      style={{
        width: 300,
        height: 40,
        background: 'linear-gradient(135deg, #b80f0f 0%, #ff6b3f 100%)',
        borderRadius: 22,
        position: 'relative',
        userSelect: 'none',
        boxShadow: dragging ? '0 4px 16px rgba(255,111,60,0.18)' : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'background 0.3s',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onMouseMove={dragging ? handleDrag : undefined}
      onTouchMove={dragging ? handleDrag : undefined}
      onMouseUp={handleDragEnd}
      onMouseLeave={dragging ? handleDragEnd : undefined}
      onTouchEnd={handleDragEnd}
    >
      {/* Barra de progresso visual ao arrastar */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: dragging ? dragX : 0,
          background: 'rgba(255,255,255,0.25)',
          borderRadius: 22,
          transition: dragging ? 'none' : 'width 0.3s',
          pointerEvents: 'none',
        }}
      />
      {/* Ícone de lixeira centralizado */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          userSelect: 'none',
        }}
      >
        <Icon icon="mdi:trash" color="#fff" width="28" height="28" />
      </div>
    </div>
  );
}
