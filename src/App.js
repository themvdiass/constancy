  // Impede rolagem apenas se todo o conteúdo couber na tela
  useEffect(() => {
    function updateScrollLock() {
      const root = document.getElementById('root');
      if (!root) return;
      if (root.scrollHeight <= window.innerHeight) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    }
    updateScrollLock();
    window.addEventListener('resize', updateScrollLock);
    return () => window.removeEventListener('resize', updateScrollLock);
  }, []);
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import './App.css';

import fireIcon from './assets/fire.png';
import DragCheckinBar from './DragCheckinBar';
import DragResetBar from './DragResetBar';

function App() {
  const [streak, setStreak] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkInDates, setCheckInDates] = useState([]);
  const [isPressed, setIsPressed] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const pressTimerRef = useRef(null);

  const today = new Date();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Carregar dados do localStorage ao montar
  useEffect(() => {
    const savedData = localStorage.getItem('checkInData');
    if (savedData) {
      const { lastCheckInDate: savedDate, checkInDates: savedDates } = JSON.parse(savedData);
      const dates = savedDates || [];
      setCheckInDates(dates);
      setLastCheckInDate(savedDate || null);

      // determinar se já fez check-in hoje e calcular streak baseado no histórico
      const setDates = new Set(dates);
      const todayString = new Date().toISOString().split('T')[0];
      setCheckedInToday(setDates.has(todayString));
      setStreak(computeStreakFromSet(setDates));
    }
  }, []);

  // helper: formata date para YYYY-MM-DD
  const toISODate = (d) => d.toISOString().split('T')[0];

  // contar dias de prática no mês atual
  const getDaysOfPracticeThisMonth = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return checkInDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date.getFullYear() === year && date.getMonth() === month;
    }).length;
  };
  const computeStreakFromSet = (dateSet) => {
    const todayStr = toISODate(new Date());
    const oneDay = 24 * 60 * 60 * 1000;

    // começar em hoje se marcado, senão em ontem
    let curr = dateSet.has(todayStr) ? new Date() : new Date(Date.now() - oneDay);
    let count = 0;

    while (true) {
      const s = toISODate(curr);
      if (dateSet.has(s)) {
        count += 1;
        curr = new Date(curr.getTime() - oneDay);
      } else {
        break;
      }
    }

    return count;
  };

  // Monitorar mudanças de mês
  useEffect(() => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, [today]);

  const handleMouseDown = () => {
    if (checkedInToday) return;
    
    setIsPressed(true);
    setPressProgress(0);
    let progress = 0;

    pressTimerRef.current = setInterval(() => {
      progress += 100 / 20; // 2 segundos = 2000ms, atualiza a cada 100ms
      setPressProgress(Math.min(progress, 100));

      if (progress >= 100) {
        clearInterval(pressTimerRef.current);
        completeCheckInForDate(new Date());
        setIsPressed(false);
      }
    }, 100);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    clearInterval(pressTimerRef.current);
    setPressProgress(0);
  };

  const handleTouchStart = () => {
    handleMouseDown();
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const [showCheckinAnimation, setShowCheckinAnimation] = useState(false);

  const completeCheckInForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const todayDate = new Date();
    const todayDateString = todayDate.toISOString().split('T')[0];

    if (dateString === todayDateString) {
      // Check-in de hoje
      if (!checkedInToday) {
        const newCheckInDates = [...checkInDates, dateString];

        setCheckInDates(newCheckInDates);
        setLastCheckInDate(date.toISOString());
        setCheckedInToday(true);

        // Feedback tátil (vibração)
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(200);
        }

        // Animação de sucesso
        setShowCheckinAnimation(true);
        setTimeout(() => setShowCheckinAnimation(false), 1800);

        // recalcula streak a partir do histórico atualizado
        const newSet = new Set(newCheckInDates);
        const newStreak = computeStreakFromSet(newSet);
        setStreak(newStreak);

        localStorage.setItem('checkInData', JSON.stringify({
          lastCheckInDate: date.toISOString(),
          checkInDates: newCheckInDates
        }));
      }
    } else {
      // Check-in de data passada
      if (!checkInDates.includes(dateString)) {
        const newCheckInDates = [...checkInDates, dateString];
        setCheckInDates(newCheckInDates);

        // recalcula streak (pode aumentar se marcar dias consecutivos até ontem)
        const newSet = new Set(newCheckInDates);
        const newStreak = computeStreakFromSet(newSet);
        setStreak(newStreak);

        localStorage.setItem('checkInData', JSON.stringify({
          lastCheckInDate: lastCheckInDate,
          checkInDates: newCheckInDates
        }));
      }
    }
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dateString = clickedDate.toISOString().split('T')[0];
    const todayDateString = new Date().toISOString().split('T')[0];

    // Se é um dia passado
    if (clickedDate < new Date(todayDateString) || dateString !== todayDateString) {
      if (!checkInDates.includes(dateString)) {
        completeCheckInForDate(clickedDate);
      }
    } else if (dateString === todayDateString && !checkedInToday) {
      // Se é hoje e ainda não fez check-in, mostrar o botão de pressão
      // O botão de pressão é o principal, então não fazer nada aqui
    }
  };

  const isDayCheckedIn = (day) => {
    const dateString = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return checkInDates.includes(dateString);
  };

  const isConsecutiveCheckedIn = (day) => {
    const dateString = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    const prevDateString = new Date(currentYear, currentMonth, day - 1).toISOString().split('T')[0];
    const nextDateString = new Date(currentYear, currentMonth, day + 1).toISOString().split('T')[0];

    const isPrevChecked = checkInDates.includes(prevDateString);
    const isNextChecked = checkInDates.includes(nextDateString);

    return { isPrevChecked, isNextChecked };
  };

  const getSequenceLineWidth = () => {
    if (checkInDates.length === 0) return 0;
    
    // Encontrar o último dia checado
    const lastCheckedDay = Math.max(
      ...checkInDates.map(date => {
        const d = new Date(date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear ? d.getDate() : 0;
      })
    );
    
    if (lastCheckedDay === 0) return 0;
    
    // Calcular a percentagem baseada na posição do último dia checado
    // Cada coluna tem aproximadamente 14.28% de width (100% / 7 colunas)
    // Mais o gap entre eles
    const columnWidth = 100 / 7;
    const gapPercentage = (10 / (60 * 7)) * 100; // 10px gap em 60px de largura estimada
    const singleDayPercentage = columnWidth + gapPercentage;
    
    return lastCheckedDay * singleDayPercentage;
  };

  const getDayClass = (day) => {
    const isToday = day === today.getDate() && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const isCheckedIn = isDayCheckedIn(day);

    if (isToday && isCheckedIn) {
      return 'day today-checked';
    } else if (isToday && !isCheckedIn) {
      return 'day today-unchecked';
    } else if (isCheckedIn) {
      return 'day checked';
    } else {
      return 'day unchecked';
    }
  };

  return (
    <div className="App">
      {/* animação de sucesso removida conforme solicitado */}
      <div className="container">

        {/* Dias de ofensiva */}
        <div className="streak-container">
          <div className={`streak-display ${streak === 0 ? 'grayscale' : ''}`}>
            <div className={`streak-content${checkedInToday ? '' : ' grayscale'}`}> 
              <div className="streak-number">{streak}</div>
              <div className="streak-label">{streak === 1 ? 'dia de ofensiva!' : 'dias de ofensiva!'}</div>
            </div>
            <img src={fireIcon} alt="fire" className={`streak-icon${checkedInToday ? '' : ' grayscale'}`} />
          </div>
        </div>

        {/* Meta de ofensiva */}
        <div className="goals-container" style={{ marginTop: 10 }}>
          <h3>Meta de ofensiva</h3>
          {(() => {
            // Base deslizante de 15 em 15: 0,5,10,15 -> quando atingir 15 vira 15,20,25,30 etc.
            const base = Math.floor(streak / 15) * 15;
            const goals = [
              { target: base, label: `${base}` },
              { target: base + 5, label: `${base + 5}` },
              { target: base + 10, label: `${base + 10}` },
              { target: base + 15, label: `${base + 15}` }
            ];

            // A barra é contínua entre `base` e `base + 15` (atinge 100% ao chegar no último alvo)
            const raw = streak - base;
            const progressPercent = Math.max(0, Math.min((raw / 15) * 100, 100));

            return (
              <div className="goals-bar-wrapper">
                <div className="goals-bar-container">
                  <div className="goals-bar">
                    <div
                      className="goals-bar-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  <div className="goals-markers">
                    {goals.map((goal, idx) => {
                      const markerPosition = ((goal.target - base) / 15) * 100;
                      const completed = streak >= goal.target;
                      return (
                        <div
                          key={idx}
                          className={`goal-marker ${completed ? 'completed' : ''}`}
                          style={{ left: `${markerPosition}%` }}
                        >
                          <span className="marker-label">{goal.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Mantenha sua ofensiva */}
        <div className="motivation-box">
          <img src={fireIcon} alt="fire" className="motivation-icon" />
          <div className="motivation-text">
            <strong>Mantenha a sua ofensiva perfeita:</strong> Siga focado(a) todos os dias!
          </div>
        </div>

        <div className="calendar" style={{ marginBottom: 0 }}>
          <div className="calendar-header">
            <h2>{new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' ')}</h2>
          </div>

          <div className="calendar-box">
            <div className="weekday-header">
              {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
                <div key={d} className="weekday-cell">{d}</div>
              ))}
            </div>

            {(() => {
              // gerar semanas do mês (matriz de semanas com 7 colunas)
              const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
              const weeks = [];
              let week = new Array(7).fill(null);
              let day = 1;

              // preencher primeira semana
              for (let i = firstWeekday; i < 7; i++) {
                week[i] = day;
                day += 1;
              }
              weeks.push(week);

              while (day <= daysInMonth) {
                week = new Array(7).fill(null);
                for (let i = 0; i < 7 && day <= daysInMonth; i++) {
                  week[i] = day;
                  day += 1;
                }
                weeks.push(week);
              }

              return weeks.map((wk, idx) => {
                return (
                  <div className="week-row" key={idx}>
                    <div className="week-grid">
                      {wk.map((d, i) => {
                        if (!d) return <div key={i} className="day empty"></div>;
                        const cls = getDayClass(d);
                        const { isPrevChecked, isNextChecked } = isConsecutiveCheckedIn(d);
                        const isToday = d === today.getDate() && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                        const pulseClass = isToday ? 'pulse-today' : '';
                        if (isToday) {
                          return (
                            <div
                              key={i}
                              className={`${cls} ${isPrevChecked ? 'connected-left' : ''} ${isNextChecked ? 'connected-right' : ''} ${pulseClass}`}
                              onMouseDown={checkedInToday ? undefined : handleMouseDown}
                              onMouseUp={checkedInToday ? undefined : handleMouseUp}
                              onMouseLeave={checkedInToday ? undefined : handleMouseUp}
                              onTouchStart={checkedInToday ? undefined : handleTouchStart}
                              onTouchEnd={checkedInToday ? undefined : handleTouchEnd}
                              style={{ cursor: checkedInToday ? 'default' : 'pointer', position: 'relative' }}
                            >
                              {d}
                              {/* Barra de progresso visual ao pressionar */}
                              {isPressed && !checkedInToday && (
                                <div style={{
                                  position: 'absolute',
                                  left: 0,
                                  bottom: 0,
                                  height: 4,
                                  width: `${pressProgress}%`,
                                  background: 'rgba(255, 111, 60, 0.5)',
                                  borderRadius: 2,
                                  transition: 'width 0.1s linear',
                                  zIndex: 2
                                }} />
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={i}
                              className={`${cls} ${isPrevChecked ? 'connected-left' : ''} ${isNextChecked ? 'connected-right' : ''}`}
                              style={{ cursor: 'default' }}
                            >
                              {d}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>


        {/* Barra de arrastar para check-in */}
        <div style={{ marginTop: 20, marginBottom: 0, display: 'flex', justifyContent: 'center' }}>
          <DragCheckinBar
            checkedInToday={checkedInToday}
            onCheckin={() => completeCheckInForDate(new Date())}
          />
        </div>

        {/* Barra de arrastar para resetar tudo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <DragResetBar
            onReset={() => {
              setCheckInDates([]);
              setLastCheckInDate(null);
              setCheckedInToday(false);
              setStreak(0);
              localStorage.removeItem('checkInData');
            }}
          />
        </div>


        {/* Mensagem removida conforme solicitado */}
      </div>
    </div>
  );
}

export default App;
