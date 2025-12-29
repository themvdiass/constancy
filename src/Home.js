import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './App.css';

function Home({ darkMode }) {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [checkedDays, setCheckedDays] = useState([]);
  const [blockedDays, setBlockedDays] = useState([]);
  const [gems, setGems] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [shakeGems, setShakeGems] = useState(false);

  const monthNames = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  useEffect(() => {
    const saved = localStorage.getItem('checkedDays');
    if (saved) {
      setCheckedDays(JSON.parse(saved));
    }

    const savedBlocked = localStorage.getItem('blockedDays');
    if (savedBlocked) {
      setBlockedDays(JSON.parse(savedBlocked));
    }

    const savedGems = localStorage.getItem('gems');
    if (savedGems) {
      setGems(Number(savedGems));
    }
  }, []);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    
    if (isRightSwipe) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const isWeekend = (dayOfWeek) => {
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isChecked = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return checkedDays.includes(dateStr);
  };

  const isBlocked = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blockedDays.includes(dateStr);
  };

  const isTodayChecked = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return checkedDays.includes(dateStr);
  };

  const isTodayBlocked = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return blockedDays.includes(dateStr);
  };

  const calculateStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    const todayCheck = isTodayChecked();
    const todayBlock = isTodayBlocked();
    
    if (!todayCheck && !todayBlock) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (true) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const dayOfWeek = currentDate.getDay(); // 0 = domingo, 6 = sábado
      
      const hasCheck = checkedDays.includes(dateStr);
      const hasBlock = blockedDays.includes(dateStr);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (hasCheck || hasBlock) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (isWeekend) {
        // Finais de semana sem check-in não quebram a streak, apenas pula
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const isInCurrentStreak = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayDate = new Date(currentYear, currentMonth, day);
    dayDate.setHours(0, 0, 0, 0);
    
    const todayCheck = isTodayChecked();
    const todayBlock = isTodayBlocked();
    
    let streakStart = new Date(today);
    if (!todayCheck && !todayBlock) {
      streakStart.setDate(streakStart.getDate() - 1);
    }
    
    while (true) {
      const dateStr = `${streakStart.getFullYear()}-${String(streakStart.getMonth() + 1).padStart(2, '0')}-${String(streakStart.getDate()).padStart(2, '0')}`;
      const dayOfWeek = streakStart.getDay(); // 0 = domingo, 6 = sábado
      
      const hasCheck = checkedDays.includes(dateStr);
      const hasBlock = blockedDays.includes(dateStr);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (hasCheck || hasBlock) {
        streakStart.setDate(streakStart.getDate() - 1);
      } else if (isWeekend) {
        // Finais de semana sem check-in não quebram a streak, apenas pula
        streakStart.setDate(streakStart.getDate() - 1);
      } else {
        streakStart.setDate(streakStart.getDate() + 1);
        break;
      }
    }
    
    return dayDate >= streakStart && dayDate <= today;
  };

  const handleCheckIn = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const newCheckedDays = [...checkedDays, dateStr];
    setCheckedDays(newCheckedDays);
    localStorage.setItem('checkedDays', JSON.stringify(newCheckedDays));
    
    const newStreak = calculateStreak() + 1;
    if (newStreak % 15 === 0) {
      const newGems = gems + 1;
      setGems(newGems);
      localStorage.setItem('gems', newGems.toString());
      setShakeGems(true);
      setTimeout(() => setShakeGems(false), 600);
    }
  };

  const handleBlockButtonClick = () => {
    if (gems > 0 && !isTodayBlocked() && !isTodayChecked() && calculateStreak() > 0) {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const newBlockedDays = [...blockedDays, dateStr];
      setBlockedDays(newBlockedDays);
      localStorage.setItem('blockedDays', JSON.stringify(newBlockedDays));
      
      const newGems = gems - 1;
      setGems(newGems);
      localStorage.setItem('gems', newGems.toString());
    }
  };

  const handleDayClick = (day) => {
    if (!editMode) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(currentYear, currentMonth, day);
    dayDate.setHours(0, 0, 0, 0);
    
    if (dayDate > today) return;
    
    const checked = isChecked(day);
    const blocked = isBlocked(day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (!checked && !blocked) {
      const newCheckedDays = [...checkedDays, dateStr];
      setCheckedDays(newCheckedDays);
      localStorage.setItem('checkedDays', JSON.stringify(newCheckedDays));
    } else if (checked) {
      const newCheckedDays = checkedDays.filter(d => d !== dateStr);
      setCheckedDays(newCheckedDays);
      localStorage.setItem('checkedDays', JSON.stringify(newCheckedDays));
    } else if (blocked) {
      const newBlockedDays = blockedDays.filter(d => d !== dateStr);
      setBlockedDays(newBlockedDays);
      localStorage.setItem('blockedDays', JSON.stringify(newBlockedDays));
      
      const newGems = gems + 1;
      setGems(newGems);
      localStorage.setItem('gems', newGems.toString());
    }
  };

  const formatStreakStartDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCheck = isTodayChecked();
    const todayBlock = isTodayBlocked();
    
    let streakStart = new Date(today);
    if (!todayCheck && !todayBlock) {
      streakStart.setDate(streakStart.getDate() - 1);
    }
    
    while (true) {
      const dateStr = `${streakStart.getFullYear()}-${String(streakStart.getMonth() + 1).padStart(2, '0')}-${String(streakStart.getDate()).padStart(2, '0')}`;
      
      const hasCheck = checkedDays.includes(dateStr);
      const hasBlock = blockedDays.includes(dateStr);
      
      if (hasCheck || hasBlock) {
        streakStart.setDate(streakStart.getDate() - 1);
      } else {
        streakStart.setDate(streakStart.getDate() + 1);
        break;
      }
    }
    
    const day = String(streakStart.getDate()).padStart(2, '0');
    const month = String(streakStart.getMonth() + 1).padStart(2, '0');
    const year = streakStart.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const hasCalendarSixRows = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalCells = firstDay + daysInMonth;
    return totalCells > 35;
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (firstDay + day - 1) % 7;
      const isWeekendDay = isWeekend(dayOfWeek);
      const today = new Date();
      const isToday = day === today.getDate() && 
                      currentMonth === today.getMonth() && 
                      currentYear === today.getFullYear();
      const checked = isChecked(day);
      const blocked = isBlocked(day);
      const isInStreak = checked && isInCurrentStreak(day);
      const isOldStreak = checked && !isInStreak;
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const dayDate = new Date(currentYear, currentMonth, day);
      dayDate.setHours(0, 0, 0, 0);
      const isFuture = dayDate > todayDate;
      
      const todayIncomplete = !isTodayChecked() && !isTodayBlocked();
      const isPast = dayDate < todayDate;

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isWeekendDay ? 'weekend' : ''} ${isToday ? 'today' : ''} ${isInStreak ? 'checked' : ''} ${isOldStreak ? 'old-streak' : ''} ${blocked ? 'blocked' : ''} ${editMode ? 'editable' : ''} ${isFuture ? 'future' : ''}`}
          onClick={() => handleDayClick(day)}
          style={{ cursor: editMode && !isFuture ? 'pointer' : 'default' }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const getProgressMilestones = () => {
    const streak = calculateStreak();
    const baseValue = Math.floor(streak / 15) * 15;
    return [baseValue, baseValue + 5, baseValue + 10, baseValue + 15];
  };

  const getProgressPercentage = () => {
    const streak = calculateStreak();
    const milestones = getProgressMilestones();
    const start = milestones[0];
    const end = milestones[3];
    const range = end - start;
    const current = streak - start;
    return (current / range) * 100;
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="header-top">
          <div className={`gem-counter ${shakeGems ? 'shake' : ''}`}>
            <Icon icon="ri:diamond-fill" className="icon" />
            <span className="gem-count">{gems}</span>
          </div>
        </div>
        
        <div className="streak-counter">
          <div className={`streak-number ${isTodayChecked() ? 'active' : isTodayBlocked() ? 'blocked' : 'inactive'}`}>{calculateStreak()}</div>
          <div className="streak-label">{calculateStreak() === 1 ? 'dia de ofensiva' : 'dias de ofensiva'}</div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className={`progress-fill ${isTodayBlocked() ? 'blocked' : !isTodayChecked() && !isTodayBlocked() ? 'inactive' : ''}`} style={{ width: `${getProgressPercentage()}%` }}></div>
            <div className="progress-milestones">
              {getProgressMilestones().map((milestone, index) => {
                const streak = calculateStreak();
                const isAchieved = streak >= milestone;
                return (
                  <div 
                    key={index} 
                    className={`milestone ${isAchieved ? 'achieved' : ''} ${isTodayBlocked() && isAchieved ? 'blocked' : !isTodayChecked() && !isTodayBlocked() && isAchieved ? 'inactive' : ''}`}
                    style={{ left: `${(index / 3) * 100}%` }}
                  >
                    <div className="milestone-marker"></div>
                    <div className="milestone-label">{milestone}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="calendar">
          <div className="calendar-header">
            <h2>{monthNames[currentMonth]} {currentYear}</h2>
            {!isTodayChecked() && !isTodayBlocked() ? (
              <div className="timer">{timeLeft}</div>
            ) : isTodayBlocked() ? (
              <div className="timer blocked">
                <Icon icon="ri:diamond-fill" className="icon" />
                <span className="timer-text">Bloqueio utilizado</span>
              </div>
            ) : (
              <div className="timer completed">
                <Icon icon="heroicons-solid:lightning-bolt" className="icon" />
                <span className="timer-text">Treino concluído</span>
              </div>
            )}
          </div>
          
          <div 
            className="calendar-grid"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="weekdays">
              {weekDays.map((day, index) => (
                <div 
                  key={day} 
                  className={`weekday ${isWeekend(index) ? 'weekend' : ''}`}
                >
                  {day}
                </div>
              ))}
            </div>
            
            <div className="days">
              {renderCalendar()}
            </div>
          </div>
        </div>

        <div className="motivation-message">
          {isTodayBlocked() ? (
            <p>
              Você usou um <span className="highlight-block">bloqueio de ofensiva</span>. Consiga um novo bloqueio ao completar 15 dias de ofensiva!
            </p>
          ) : calculateStreak() > 0 ? (
            <p>Você está em uma ofensiva desde <span className="highlight-date">{formatStreakStartDate()}</span>. Parabéns!</p>
          ) : (
            <p>Treine hoje para dar início a uma nova ofensiva. <span className="highlight-focus">Foco!</span></p>
          )}
        </div>

        <div className={`buttons-container ${hasCalendarSixRows() ? 'six-rows' : ''}`}>
          <button 
            className={`checkin-button ${isTodayChecked() || isTodayBlocked() ? 'disabled' : ''}`}
            onClick={handleCheckIn}
            disabled={isTodayChecked() || isTodayBlocked()}
            title={isTodayChecked() ? 'Check-in feito hoje!' : isTodayBlocked() ? 'Bloqueio usado hoje!' : 'Fazer Check-in'}
          >
            <Icon icon="carbon:calendar-add" className="icon" />
          </button>

          <button 
            className={`block-button ${isTodayBlocked() || gems <= 0 || isTodayChecked() || calculateStreak() === 0 ? 'disabled' : ''}`}
            onClick={handleBlockButtonClick}
            title={
              isTodayBlocked() 
                ? 'Bloqueio já usado hoje!' 
                : gems <= 0 
                  ? 'Sem bloqueios disponíveis' 
                  : isTodayChecked()
                    ? 'Check-in já feito hoje'
                    : calculateStreak() === 0
                      ? 'Sem ofensiva ativa para proteger'
                      : 'Usar bloqueio'
            }
          >
            <Icon icon="ri:diamond-fill" className="icon" />
          </button>

          <button 
            className={`edit-button ${editMode ? 'active' : ''}`}
            onClick={toggleEditMode}
            title={editMode ? 'Sair do modo edição' : 'Editar check-ins'}
          >
            <Icon icon="mingcute:edit-line" className="icon" />
          </button>

          <button 
            className="navigation-button" 
            onClick={() => navigate('/progressao-de-carga')}
            title="Progressão de carga"
          >
            <Icon icon="mdi:weight-lifter" className="icon" />
            <span className="new-badge">NOVO</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
