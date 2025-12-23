import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [checkedDays, setCheckedDays] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);

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

  const handleDayClick = (day) => {
    if (!editMode) return;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
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

  const handleCheckIn = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (!checkedDays.includes(dateStr)) {
      const newCheckedDays = [...checkedDays, dateStr];
      setCheckedDays(newCheckedDays);
      localStorage.setItem('checkedDays', JSON.stringify(newCheckedDays));
    }
  };

  const isTodayChecked = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return checkedDays.includes(dateStr);
  };

  const calculateStreak = () => {
    if (checkedDays.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    // Se hoje foi feito check-in, começa contando de hoje
    // Se não foi, começa de ontem (ainda pode fazer hoje)
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (checkedDays.includes(todayStr)) {
      // Hoje já foi feito, conta de hoje pra trás
      while (true) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const dayOfWeek = currentDate.getDay();
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (checkedDays.includes(dateStr)) {
          streak++;
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
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (isWeekendDay) {
          // Fim de semana sem check-in: não quebra a ofensiva
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return streak;
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

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isWeekendDay ? 'weekend' : ''} ${isToday ? 'today' : ''} ${checked ? 'checked' : ''} ${editMode ? 'editable' : ''}`}
          onClick={() => handleDayClick(day)}
          style={{ cursor: editMode ? 'pointer' : 'default' }}
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
        <div className="streak-counter">
          <div className={`streak-number ${isTodayChecked() ? 'active' : 'inactive'}`}>{calculateStreak()}</div>
          <div className="streak-label">dias de ofensiva</div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getProgressPercentage()}%` }}></div>
            <div className="progress-milestones">
              {getProgressMilestones().map((milestone, index) => {
                const streak = calculateStreak();
                const isAchieved = streak >= milestone;
                return (
                  <div 
                    key={index} 
                    className={`milestone ${isAchieved ? 'achieved' : ''}`}
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
            {!isTodayChecked() && <div className="timer">{timeLeft}</div>}
          </div>
          
          <div className="calendar-grid">
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

        <div className="buttons-container">
          <button 
            className={`checkin-button ${isTodayChecked() ? 'disabled' : ''}`}
            onClick={handleCheckIn}
            disabled={isTodayChecked()}
            title={isTodayChecked() ? 'Check-in feito hoje!' : 'Fazer Check-in'}
          >
            <span className="iconify" data-icon="wpf:security-checked"></span>
          </button>

          <button 
            className={`edit-button ${editMode ? 'active' : ''}`}
            onClick={toggleEditMode}
            title={editMode ? 'Sair do modo edição' : 'Editar check-ins'}
          >
            <span className="iconify" data-icon="mingcute:edit-line"></span>
          </button>

          <button 
            className="theme-toggle-button" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            <span className="iconify" data-icon="line-md:light-dark-loop"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
