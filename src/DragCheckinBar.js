import React, { useRef, useState } from 'react';
import { Icon } from '@iconify/react';

// Barra de arrastar para check-in
export default function DragCheckinBar({ checkedInToday, onCheckin }) {
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [completed, setCompleted] = useState(false);
  const barRef = useRef(null);

  const handleDragStart = (e) => {
    if (checkedInToday) return;
    setDragging(true);
    setCompleted(false);
    setDragX(0);
    e.preventDefault();
  };

  const handleDrag = (e) => {
    if (!dragging || checkedInToday) return;
    let clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    setDragX(x);
    if (x > rect.width * 0.92 && !completed) {
      setCompleted(true);
      setTimeout(() => {
        setDragging(false);
        setDragX(0);
        setCompleted(false);
        onCheckin();
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
      className="drag-checkin-bar"
      style={{
        width: 350,
        height: 50,
        background: checkedInToday ? 'linear-gradient(90deg, #a8b5d1 0%, #9ca3b8 100%)' : 'linear-gradient(90deg, #ff9500 0%, #ff6b3f 100%)',
        borderRadius: 22,
        position: 'relative',
        userSelect: 'none',
        opacity: checkedInToday ? 0.6 : 1,
        boxShadow: dragging ? '0 4px 16px rgba(255,111,60,0.18)' : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: checkedInToday ? 'not-allowed' : 'pointer',
        transition: 'background 0.3s, opacity 0.3s',
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
          left: 0,
          top: 0,
          bottom: 0,
          width: dragging ? dragX : 0,
          background: 'rgba(255,255,255,0.25)',
          borderRadius: 22,
          transition: dragging ? 'none' : 'width 0.3s',
          pointerEvents: 'none',
        }}
      />
      {/* Animação de brilho rápida, delay de 2s entre ciclos, mais diagonal */}
      {/* Animação de brilho removida */}
      {/* Texto e ícone de seta */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        //   gap: 5,
          zIndex: 2,
          userSelect: 'none',
        }}
      >
        {checkedInToday ? (
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Check-in realizado!</span>
        ) : (
          <>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Deslize para check-in</span>
            <Icon icon="icon-park-outline:right" color="#fff" width="20" height="20" />
          </>
        )}
      </div>
      {/* Animação CSS removida */}
    </div>
  );
}
