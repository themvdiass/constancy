import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import './App.css';

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [checkedDays, setCheckedDays] = useState([]);
  const [blockedDays, setBlockedDays] = useState([]);
  const [gems, setGems] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
    
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  useEffect(() => {
    // Adicionar/remover classe dark-mode do html quando darkMode mudar
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      // Atualizar theme-color para mobile
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#2d2d2d');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      // Atualizar theme-color para mobile
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    }
  }, [darkMode]);

  useEffect(() => {
    // Atualizar theme-color meta tag quando darkMode muda
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', darkMode ? '#2d2d2d' : '#ffffff');
    }
  }, [darkMode]);

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
      // Próximo mês
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    
    if (isRightSwipe) {
      // Mês anterior
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const handleDayClick = (day) => {
    if (!editMode) return;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Bloquear edição de dias futuros
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(currentYear, currentMonth, day);
    clickedDate.setHours(0, 0, 0, 0);
    if (clickedDate > today) return;

    // Remover bloqueio manualmente no modo edição
    if (blockedDays.includes(dateStr)) {
      const newBlocked = blockedDays.filter(d => d !== dateStr);
      setBlockedDays(newBlocked);
      localStorage.setItem('blockedDays', JSON.stringify(newBlocked));
      return;
    }
    
    if (checkedDays.includes(dateStr)) {
      // Remover check-in
      const newCheckedDays = checkedDays.filter(d => d !== dateStr);
      setCheckedDays(newCheckedDays);
      localStorage.setItem('checkedDays', JSON.stringify(newCheckedDays));
    } else {
      // Adicionar check-in
      const newCheckedDays = [...checkedDays, dateStr];
      setCheckedDays(newCheckedDays);
      localStorage.setItem('checkedDays', JSON.stringify(newCheckedDays));
    }
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      
      const diff = midnight - now;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Atualizar mês e ano automaticamente todos os dias
    const updateDate = () => {
      const now = new Date();
      setCurrentMonth(now.getMonth());
      setCurrentYear(now.getFullYear());
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Atualizar mês e ano automaticamente todos os dias
    const updateDate = () => {
      const now = new Date();
      setCurrentMonth(now.getMonth());
      setCurrentYear(now.getFullYear());
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, []);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isWeekend = (dayIndex) => {
    return dayIndex === 0 || dayIndex === 6;
  };

  const isChecked = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return checkedDays.includes(dateStr);
  };

  const isBlocked = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blockedDays.includes(dateStr);
  };

  const handleCheckIn = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (!checkedDays.includes(dateStr) && !blockedDays.includes(dateStr)) {
      const newCheckedDays = [...checkedDays, dateStr];
      setCheckedDays(newCheckedDays);
      localStorage.setItem('checkedDays', JSON.stringify(newCheckedDays));
    }
  };

  const handleUseBlock = () => {
    const today = new Date();
    const isWeekendDay = today.getDay() === 0 || today.getDay() === 6;
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Não pode usar bloqueio em finais de semana
    if (isWeekendDay) return;
    // Precisa ter gemas
    if (gems <= 0) return;
    // Não pode usar se já fez check-in ou já usou bloqueio
    if (checkedDays.includes(dateStr) || blockedDays.includes(dateStr)) return;

    const newBlockedDays = [...blockedDays, dateStr];
    setBlockedDays(newBlockedDays);
    localStorage.setItem('blockedDays', JSON.stringify(newBlockedDays));
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

  const isTodayCompleted = () => {
    return isTodayChecked() || isTodayBlocked();
  };

  const calculateStreak = () => {
    if (checkedDays.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    // Se hoje foi feito check-in ou bloqueio, começa contando de hoje
    // Se não foi, começa de ontem (ainda pode fazer hoje)
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (checkedDays.includes(todayStr) || blockedDays.includes(todayStr)) {
      // Hoje já foi feito check-in ou bloqueio, conta de hoje pra trás
      while (true) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const dayOfWeek = currentDate.getDay();
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (checkedDays.includes(dateStr)) {
          // Check-in conta para o streak (inclusive finais de semana)
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (blockedDays.includes(dateStr) && !isWeekendDay) {
          // Bloqueio protege mas não conta para o streak (só em dia de semana)
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (isWeekendDay) {
          // Fim de semana sem check-in: não quebra a ofensiva mas não conta
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Hoje ainda não foi feito, verifica de ontem pra trás
      currentDate.setDate(currentDate.getDate() - 1);
      
      while (true) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const dayOfWeek = currentDate.getDay();
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (checkedDays.includes(dateStr)) {
          // Check-in conta para o streak (inclusive finais de semana)
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (blockedDays.includes(dateStr) && !isWeekendDay) {
          // Bloqueio protege mas não conta para o streak (só em dia de semana)
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (isWeekendDay) {
          // Fim de semana sem check-in: não quebra a ofensiva mas não conta
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return streak;
  };

  useEffect(() => {
    // Calcular gemas disponíveis: 1 gema a cada 15 dias seguidos de check-in
    // Percorre todo o histórico e soma todas as gemas ganhas
    let totalGemsEarned = 0;
    
    if (checkedDays.length > 0) {
      // Ordenar dias por data
      const sortedDays = [...checkedDays].sort();
      
      let currentStreak = 0;
      let previousDate = null;
      
      for (const dateStr of sortedDays) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const currentDate = new Date(year, month - 1, day);
        
        if (previousDate === null) {
          // Primeiro dia
          currentStreak = 1;
        } else {
          // Verificar se é consecutivo (ignorando finais de semana sem check-in)
          let checkDate = new Date(previousDate);
          checkDate.setDate(checkDate.getDate() + 1);
          let consecutive = false;
          
          // Procurar até 7 dias à frente (para cobrir finais de semana longos)
          for (let i = 0; i < 7; i++) {
            if (checkDate.getTime() === currentDate.getTime()) {
              consecutive = true;
              break;
            }
            
            // Se não é fim de semana, quebrou a sequência
            const dayOfWeek = checkDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              break;
            }
            
            checkDate.setDate(checkDate.getDate() + 1);
          }
          
          if (consecutive) {
            currentStreak++;
            
            // A cada 15 dias, ganha 1 gema
            if (currentStreak % 15 === 0) {
              totalGemsEarned++;
            }
          } else {
            // Resetar streak
            currentStreak = 1;
          }
        }
        
        previousDate = currentDate;
      }
    }
    
    const gemsUsed = blockedDays.length;
    const availableGems = totalGemsEarned - gemsUsed;
    
    if (gems !== availableGems) {
      setGems(availableGems);
      localStorage.setItem('gems', String(availableGems));
    }
  }, [checkedDays, blockedDays]);

  const getStreakStartDate = () => {
    if (checkedDays.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(today);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let startDate = null;

    if (checkedDays.includes(todayStr) || blockedDays.includes(todayStr)) {
      // Hoje já foi feito check-in ou bloqueio, percorre de hoje pra trás
      while (true) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const dayOfWeek = currentDate.getDay();
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (checkedDays.includes(dateStr)) {
          startDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (blockedDays.includes(dateStr) && !isWeekendDay) {
          // Bloqueio protege mas não é o início da streak
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (isWeekendDay) {
          // Fim de semana sem check-in: não quebra a ofensiva
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Hoje ainda não foi feito, verifica de ontem pra trás
      currentDate.setDate(currentDate.getDate() - 1);
      
      while (true) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const dayOfWeek = currentDate.getDay();
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (checkedDays.includes(dateStr)) {
          startDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (blockedDays.includes(dateStr) && !isWeekendDay) {
          // Bloqueio protege mas não é o início da streak
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (isWeekendDay) {
          // Fim de semana sem check-in: não quebra a ofensiva
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return startDate;
  };

  const formatStreakStartDate = () => {
    const startDate = getStreakStartDate();
    if (!startDate) return '';

    const fullMonthNames = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const day = startDate.getDate();
    const month = fullMonthNames[startDate.getMonth()];
    const year = startDate.getFullYear();

    return `${day} de ${month} de ${year}`;
  };

  const isInCurrentStreak = (day) => {
    // Verifica se um dia checked faz parte da streak atual
    const startDate = getStreakStartDate();
    if (!startDate) return false;
    
    const dayDate = new Date(currentYear, currentMonth, day);
    dayDate.setHours(0, 0, 0, 0);
    
    return dayDate >= startDate;
  };

  const isInActiveStreak = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(0, 0, 0, 0);
    
    // Se é data futura, não está na ofensiva
    if (checkDate > today) return false;
    
    const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const checkDayOfWeek = checkDate.getDay();
    const isCheckDateWeekend = checkDayOfWeek === 0 || checkDayOfWeek === 6;
    
    // Se não é fim de semana, não precisa destacar
    if (!isCheckDateWeekend) return false;
    
    // Se já fez check-in nesse fim de semana, não precisa destacar
    if (checkedDays.includes(checkDateStr)) return false;
    
    // Verificar se está dentro da ofensiva ativa
    let currentDate = new Date(today);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Começa de hoje ou ontem dependendo se fez check-in hoje
    if (!checkedDays.includes(todayStr)) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    let hasCheckinBefore = false;
    
    // Percorrer do ponto inicial até o dia em questão
    while (currentDate >= checkDate) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const dayOfWeek = currentDate.getDay();
      const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (checkedDays.includes(dateStr)) {
        hasCheckinBefore = true;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (isWeekendDay) {
        // Fim de semana sem check-in: pode continuar, mas precisa ter check-in antes
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Dia útil sem check-in: quebrou a ofensiva
        return false;
      }
    }
    
    // Para estar na ofensiva, precisa ter pelo menos um check-in antes do fim de semana
    if (!hasCheckinBefore) return false;
    
    // Verificar se tem continuidade depois do fim de semana (não quebrou)
    currentDate = new Date(checkDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    let foundCheckinAfter = false;
    
    // Olhar alguns dias à frente para ver se a ofensiva continuou
    while (currentDate <= today) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const dayOfWeek = currentDate.getDay();
      const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (checkedDays.includes(dateStr)) {
        foundCheckinAfter = true;
        break;
      } else if (isWeekendDay) {
        // Outro fim de semana: continuar procurando
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (currentDate > today) {
        // Ainda não chegou esse dia, pode fazer check-in
        break;
      } else {
        // Dia útil passou sem check-in: quebrou
        return false;
      }
    }
    
    // Se chegou até hoje sem quebrar, está na ofensiva
    return true;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Células vazias antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Dias do mês
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
      
      // Verificar se é dia futuro
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const dayDate = new Date(currentYear, currentMonth, day);
      dayDate.setHours(0, 0, 0, 0);
      const isFuture = dayDate > todayDate;
      
      // Se hoje não foi feito check-in nem bloqueio, dias passados ficam cinza
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
          <div className="gem-counter">
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

        <div className="buttons-container">
          <button 
            className={`checkin-button ${isTodayChecked() || isTodayBlocked() ? 'disabled' : ''}`}
            onClick={handleCheckIn}
            disabled={isTodayChecked() || isTodayBlocked()}
            title={isTodayChecked() ? 'Check-in feito hoje!' : isTodayBlocked() ? 'Bloqueio usado hoje!' : 'Fazer Check-in'}
          >
            <Icon icon="carbon:calendar-add" className="icon" />
          </button>

          <button 
            className={`block-button ${isTodayBlocked() || gems <= 0 || isTodayChecked() ? 'disabled' : ''}`}
            onClick={handleUseBlock}
            disabled={isTodayBlocked() || gems <= 0 || isTodayChecked()}
            title={
              isTodayBlocked() 
                ? 'Bloqueio já usado hoje!' 
                : gems <= 0 
                  ? 'Sem bloqueios disponíveis' 
                  : isTodayChecked()
                    ? 'Check-in já feito hoje'
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
            className="theme-toggle-button" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            <Icon icon="line-md:light-dark-loop" className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
