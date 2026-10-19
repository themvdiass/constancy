import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import './App.css';

const STORAGE_KEY = 'constancy-gym-v1';
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const BRAZIL_NATIONAL_HOLIDAYS = {
  '01-01': 'Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Dia Nacional de Zumbi e da Consciência Negra',
  '12-25': 'Natal',
};
const pad = (value) => String(value).padStart(2, '0');
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const nationalHolidayFor = (key) => {
  const name = BRAZIL_NATIONAL_HOLIDAYS[key.slice(5)];
  return name ? { date: key, name, isNational: true } : null;
};
const parseDate = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};
const todayKey = () => dateKey(new Date());
const weekKey = (key) => {
  const monday = parseDate(key);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return dateKey(monday);
};
const weekEndKey = (startKey) => {
  const sunday = parseDate(startKey);
  sunday.setDate(sunday.getDate() + 6);
  return dateKey(sunday);
};
const addMonthsToKey = (key, months) => {
  const source = parseDate(key);
  const targetMonth = new Date(source.getFullYear(), source.getMonth() + months, 1, 12);
  const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  targetMonth.setDate(Math.min(source.getDate(), lastDay));
  return dateKey(targetMonth);
};

function getWeekDetails(startKey, data) {
  const dates = Array.from({ length: 5 }, (_, index) => {
    const date = parseDate(startKey);
    date.setDate(date.getDate() + index);
    return dateKey(date);
  });
  const holidayDates = dates.filter((key) => nationalHolidayFor(key));
  const workDates = dates.filter((key) => !nationalHolidayFor(key));
  const holidayCount = holidayDates.length;
  const shieldCount = data.shieldUses.filter((key) => weekKey(key) === startKey).length;
  // A saved target affects the week containing its effective date and later weeks,
  // while weeks that ended before the save keep the target they had at the time.
  const settingDate = weekEndKey(startKey);
  const targetSetting = [...(data.weeklyTargetHistory || [])].reverse().find((setting) => setting.effectiveFrom <= settingDate);
  const effectiveTarget = targetSetting?.target ?? 5;
  const required = Math.max(0, effectiveTarget - holidayCount - shieldCount);
  const attendedWorkdays = workDates.filter((key) => data.workouts.includes(key)).length;
  const attendedDates = data.workouts.filter((key) => weekKey(key) === startKey);
  return {
    required,
    attendedWorkdays,
    attendedDates,
    holidayCount,
    shieldCount,
    isComplete: attendedWorkdays >= required,
  };
}

function readData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const weeklyTarget = Number.isInteger(saved.weeklyTarget) ? Math.min(5, Math.max(1, saved.weeklyTarget)) : 5;
    const storedWeeklyTargetHistory = Array.isArray(saved.weeklyTargetHistory) && saved.weeklyTargetHistory.length
      ? saved.weeklyTargetHistory.filter((setting) => Number.isInteger(setting.target) && typeof setting.effectiveFrom === 'string')
      : [{ target: weeklyTarget, effectiveFrom: '0000-01-01', lockedUntil: null }];
    const weeklyTargetHistory = storedWeeklyTargetHistory.length ? storedWeeklyTargetHistory : [{ target: weeklyTarget, effectiveFrom: '0000-01-01', lockedUntil: null }];
    return {
      workouts: Array.isArray(saved.workouts) ? saved.workouts : [],
      shieldUses: Array.isArray(saved.shieldUses) ? saved.shieldUses : [],
      timerByDay: saved.timerByDay && typeof saved.timerByDay === 'object' ? saved.timerByDay : {},
      activeTimer: saved.activeTimer && Number.isFinite(saved.activeTimer.startedAt) ? saved.activeTimer : null,
      pendingTimer: Number.isFinite(saved.pendingTimer) ? Math.max(0, saved.pendingTimer) : 0,
      weeklyTarget,
      weeklyTargetHistory,
    };
  } catch {
    return { workouts: [], shieldUses: [], timerByDay: {}, activeTimer: null, pendingTimer: 0, weeklyTarget: 5, weeklyTargetHistory: [{ target: 5, effectiveFrom: '0000-01-01', lockedUntil: null }] };
  }
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function formatCompactDuration(milliseconds) {
  const totalMinutes = Math.floor(Math.max(0, milliseconds) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h${minutes ? ` ${minutes}m` : ''}` : `${minutes}m`;
}

function App() {
  const [data, setData] = useState(readData);
  const [month, setMonth] = useState(() => new Date());
  const [isCalendarEditing, setIsCalendarEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draftWeeklyTarget, setDraftWeeklyTarget] = useState(data.weeklyTarget);
  const [clockNow, setClockNow] = useState(Date.now);
  const today = todayKey();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!data.activeTimer) return undefined;
    const refreshClock = () => setClockNow(Date.now());
    const interval = window.setInterval(refreshClock, 1000);
    window.addEventListener('focus', refreshClock);
    window.addEventListener('pageshow', refreshClock);
    document.addEventListener('visibilitychange', refreshClock);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshClock);
      window.removeEventListener('pageshow', refreshClock);
      document.removeEventListener('visibilitychange', refreshClock);
    };
  }, [data.activeTimer]);

  const isHoliday = (key) => Boolean(nationalHolidayFor(key));
  const isWorkoutDay = (key) => {
    const day = parseDate(key).getDay();
    return day !== 0 && day !== 6 && !isHoliday(key);
  };
  const attended = (key) => data.workouts.includes(key);
  const shieldUsed = (key) => data.shieldUses.includes(key);

  const currentStreak = useMemo(() => {
    let cursor = parseDate(weekKey(today));
    let count = 0;
    const dates = new Set();
    let isCurrentWeek = true;
    while (dateKey(cursor) <= today) {
      const startKey = dateKey(cursor);
      const details = getWeekDetails(startKey, data);
      const weekIsOver = weekEndKey(startKey) <= today;
      if ((!isCurrentWeek || weekIsOver) && !details.isComplete) {
        // The first week of a streak is partial, so it does not need to meet the full target.
        details.attendedDates.forEach((key) => {
          if (key <= today) dates.add(key);
        });
        count = dates.size;
        break;
      }
      details.attendedDates.forEach((key) => {
        if (key <= today) dates.add(key);
      });
      count = dates.size;
      cursor.setDate(cursor.getDate() - 7);
      isCurrentWeek = false;
    }
    return { count, dates };
  }, [data, today]);
  const streak = currentStreak.count;
  const runningElapsed = data.activeTimer ? Math.max(0, clockNow - data.activeTimer.startedAt) : 0;
  const unsavedTimer = (data.pendingTimer || 0) + runningElapsed;
  const todayTimer = (data.timerByDay[today] || 0) + unsavedTimer;
  const currentStreakStart = [...currentStreak.dates].sort()[0];
  const bestStreak = useMemo(() => {
    const recordedDates = [...data.workouts, ...data.shieldUses].filter((key) => key <= today).sort();
    if (!recordedDates.length) return 0;
    let cursor = parseDate(weekKey(recordedDates[0]));
    const endWeek = weekKey(today);
    let run = 0;
    let best = 0;
    while (dateKey(cursor) <= endWeek) {
      const startKey = dateKey(cursor);
      const details = getWeekDetails(startKey, data);
      const weekIsOver = weekEndKey(startKey) <= today;
      const attendedDates = details.attendedDates.filter((key) => key <= today);
      if (weekIsOver && !details.isComplete) {
        // An incomplete week can start a new streak without meeting its full target.
        run = attendedDates.length;
      } else {
        run += attendedDates.length;
      }
      best = Math.max(best, run);
      cursor.setDate(cursor.getDate() + 7);
    }
    return best;
  }, [data, today]);
  const shieldsEarned = Math.floor(bestStreak / 15);
  const shieldsAvailable = Math.max(0, shieldsEarned - data.shieldUses.length);
  const usedShieldThisWeek = data.shieldUses.some((key) => weekKey(key) === weekKey(today));
  const thisWeek = getWeekDetails(weekKey(today), data);
  const currentTargetSetting = data.weeklyTargetHistory[data.weeklyTargetHistory.length - 1];
  const hasSavedWeeklyTarget = Boolean(currentTargetSetting?.savedAt);
  const weeklyTargetLockedUntil = currentTargetSetting?.lockedUntil;
  const isWeeklyTargetLocked = Boolean(weeklyTargetLockedUntil && today < weeklyTargetLockedUntil);
  const canUseShield = shieldsAvailable > 0 && streak > 0 && isWorkoutDay(today) && !attended(today) && !shieldUsed(today) && !usedShieldThisWeek && thisWeek.attendedWorkdays < thisWeek.required;
  const shieldUnavailableReason = usedShieldThisWeek ? 'Raio já usado nesta semana' : thisWeek.attendedWorkdays >= thisWeek.required ? 'Meta semanal cumprida' : shieldsAvailable === 0 ? 'Sem raios disponíveis' : !isWorkoutDay(today) ? 'Raios podem ser usados em dias úteis' : 'Disponível durante uma ofensiva ativa';
  const streakMilestoneBase = Math.floor(streak / 15) * 15;
  const streakMilestones = [5, 10, 15].map((step) => streakMilestoneBase + step);
  const streakProgress = ((streak - streakMilestoneBase) / 15) * 100;

  const monthLabel = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const monthDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const monthKey = `${month.getFullYear()}-${pad(month.getMonth() + 1)}`;
  const nextWorkout = useMemo(() => {
    let cursor = parseDate(today);
    for (let i = 0; i < 14; i += 1) {
      const key = dateKey(cursor);
      if (isWorkoutDay(key) && !attended(key)) return cursor;
      cursor.setDate(cursor.getDate() + 1);
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, today]);

  function toggleWorkout(key) {
    if (key > today) return;
    setData((current) => {
      const removingWorkout = current.workouts.includes(key);
      if (!removingWorkout) {
        return { ...current, workouts: [...current.workouts, key].sort() };
      }

      const activeTimerDay = current.activeTimer?.date || today;
      const clearCurrentTimer = key === today && activeTimerDay === key;
      const timerByDay = { ...current.timerByDay };
      delete timerByDay[key];

      return {
        ...current,
        workouts: current.workouts.filter((item) => item !== key),
        timerByDay,
        ...(clearCurrentTimer ? { activeTimer: null, pendingTimer: 0 } : {}),
      };
    });
  }

  function editCalendarDay(key) {
    if (shieldUsed(key)) {
      setData((current) => ({
        ...current,
        shieldUses: current.shieldUses.filter((item) => item !== key),
      }));
      return;
    }
    toggleWorkout(key);
  }

  function useShield() {
    if (!canUseShield) return;
    setData((current) => ({ ...current, shieldUses: [...current.shieldUses, today] }));
  }

  function toggleStopwatch() {
    setData((current) => {
      if (current.activeTimer) {
        const elapsed = Math.max(0, Date.now() - current.activeTimer.startedAt);
        return {
          ...current,
          activeTimer: null,
          pendingTimer: (current.pendingTimer || 0) + elapsed,
        };
      }
      if (current.shieldUses.includes(today)) return current;
      return { ...current, activeTimer: { startedAt: Date.now() } };
    });
    setClockNow(Date.now());
  }

  function saveStopwatch() {
    const savedAt = Date.now();
    setData((current) => {
      const elapsed = (current.pendingTimer || 0) + (current.activeTimer ? Math.max(0, savedAt - current.activeTimer.startedAt) : 0);
      if (!elapsed) return current;
      return {
        ...current,
        workouts: current.workouts.includes(today) ? current.workouts : [...current.workouts, today].sort(),
        timerByDay: { ...current.timerByDay, [today]: (current.timerByDay[today] || 0) + elapsed },
        pendingTimer: 0,
        activeTimer: null,
      };
    });
    setClockNow(savedAt);
  }

  function cancelStopwatch() {
    setData((current) => ({ ...current, activeTimer: null, pendingTimer: 0 }));
    setClockNow(Date.now());
  }

  function shiftMonth(amount) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function openSettings() {
    setDraftWeeklyTarget(data.weeklyTarget);
    setIsSettingsOpen(true);
  }

  function saveWeeklyTarget() {
    if (isWeeklyTargetLocked || (draftWeeklyTarget === data.weeklyTarget && hasSavedWeeklyTarget)) return;
    const lockedUntil = addMonthsToKey(today, 3);
    setData((current) => ({
      ...current,
      weeklyTarget: draftWeeklyTarget,
      weeklyTargetHistory: [...current.weeklyTargetHistory, { target: draftWeeklyTarget, effectiveFrom: today, savedAt: today, lockedUntil }],
    }));
    setIsSettingsOpen(false);
  }

  return (
    <main className="app-shell">
      <div className="ambient-effects" aria-hidden="true">
        <span className="ambient-glow ambient-glow-one" />
        <span className="ambient-glow ambient-glow-two" />
        <i className="ambient-spark spark-one">✦</i>
        <i className="ambient-spark spark-two">✧</i>
        <i className="ambient-spark spark-three">✦</i>
        <i className="ambient-spark spark-four">✧</i>
        <i className="ambient-spark spark-five">✦</i>
      </div>
      <div className="page-wrap">
        <section className="welcome-row">
          <div className="welcome-tools">
            <div className="welcome-tool-icons">
              <span className="shield-badge" aria-label={`${shieldsAvailable} ${shieldsAvailable === 1 ? 'raio disponível' : 'raios disponíveis'}`} title={`${shieldsAvailable} ${shieldsAvailable === 1 ? 'raio disponível' : 'raios disponíveis'}`}><Icon icon="mdi:lightning-bolt" aria-hidden="true" /><strong>{shieldsAvailable}</strong></span>
              <button className="settings-icon" type="button" onClick={openSettings} aria-label="Abrir configurações" title="Configurações"><Icon icon="mdi:cog" aria-hidden="true" /></button>
            </div>
            <div className="week-chip"><span className="week-chip-icon">✳</span><span>Meta semanal<br /><strong>{thisWeek.attendedWorkdays}/{thisWeek.required} dias úteis</strong></span></div>
          </div>
        </section>

        {isSettingsOpen && <div className="settings-backdrop" onClick={() => setIsSettingsOpen(false)}>
          <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}>
            <div className="settings-heading"><div><p className="section-kicker">PREFERÊNCIAS</p><h2 id="settings-title">Configurações</h2></div></div>
            <p className="settings-description">Quantos dias úteis você precisa treinar por semana para manter a ofensiva?</p>
            {isWeeklyTargetLocked && <p className="settings-lock-message">Meta bloqueada até {parseDate(weeklyTargetLockedUntil).toLocaleDateString('pt-BR')}. Depois dessa data, você poderá alterá-la novamente.</p>}
            <div className="weekly-target-options" role="group" aria-label="Meta de dias úteis por semana">
              {[1, 2, 3, 4, 5].map((target) => <button key={target} type="button" className={`weekly-target-option ${draftWeeklyTarget === target ? 'is-selected' : ''}`} onClick={() => setDraftWeeklyTarget(target)} disabled={isWeeklyTargetLocked} aria-pressed={draftWeeklyTarget === target}><strong>{target}</strong><span>{target === 1 ? 'dia' : 'dias'}</span></button>)}
            </div>
            <div className="settings-week-status"><span>Nesta semana</span><strong>{thisWeek.attendedWorkdays} de {thisWeek.required} dias necessários</strong></div>
            <div className="settings-actions"><button type="button" className="settings-cancel-button" onClick={() => setIsSettingsOpen(false)}>Cancelar</button><button type="button" className="settings-save-button" onClick={saveWeeklyTarget} disabled={isWeeklyTargetLocked || (draftWeeklyTarget === data.weeklyTarget && hasSavedWeeklyTarget)}>Salvar</button></div>
          </section>
        </div>}

        <section className="streak-focus" aria-label={`Ofensiva atual: ${streak} ${streak === 1 ? 'dia' : 'dias'}`}>
          <div className={`streak-number ${streak === 0 ? 'is-empty' : 'is-active'}`} data-value={streak} aria-hidden="true">{streak}</div>
          <div className="streak-progress" aria-label={`Progresso da ofensiva até ${streakMilestones[2]} dias`}>
            <div className="streak-progress-label"><span>ETAPA ATUAL</span><strong>{streak - streakMilestoneBase} / 15 dias</strong></div>
            <div className="streak-progress-track" role="progressbar" aria-valuemin={streakMilestoneBase} aria-valuemax={streakMilestones[2]} aria-valuenow={streak} aria-label="Progresso da ofensiva">
              <span className="streak-progress-fill" style={{ width: `${streakProgress}%` }} />
              {[streakMilestoneBase, ...streakMilestones].map((milestone) => <span className={`streak-progress-marker ${streak >= milestone ? 'is-reached' : ''}`} key={milestone} style={{ left: `${((milestone - streakMilestoneBase) / 15) * 100}%` }}><i />{milestone}</span>)}
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel calendar-panel">
            <div className="panel-heading"><div><p className="section-kicker">SEU HISTÓRICO</p><h2>Calendário</h2><p className="calendar-hint">{isCalendarEditing ? 'Clique nos dias passados para editar.' : 'Ative “Editar calendário” para alterar dias passados.'}</p></div><div className="month-controls"><button onClick={() => shiftMonth(-1)} aria-label="Mês anterior">‹</button><span>{monthLabel}</span><button onClick={() => shiftMonth(1)} aria-label="Próximo mês">›</button></div></div>
            <div className="calendar-grid calendar-weekdays">{WEEKDAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
            <div className="calendar-grid calendar-days">{Array.from({ length: firstWeekday }, (_, index) => <span className="calendar-empty" key={`empty-${index}`} />)}{Array.from({ length: monthDays }, (_, index) => {
              const day = index + 1;
              const key = `${monthKey}-${pad(day)}`;
              const date = parseDate(key);
              const isToday = key === today;
              const isFuture = key > today;
              const holiday = nationalHolidayFor(key);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const rest = isWeekend || Boolean(holiday);
              const didAttend = attended(key);
              const didUseShield = shieldUsed(key);
              const isStreakException = Boolean(currentStreakStart && rest && !didAttend && key >= currentStreakStart && key <= today);
              const isCurrentStreakDay = currentStreak.dates.has(key);
              const classes = ['calendar-day', isToday && 'is-today', isWeekend && 'is-weekend', didAttend && 'is-attended', didAttend && (isCurrentStreakDay ? 'is-current-streak' : 'is-past-streak'), didUseShield && 'is-shield-used', rest && 'is-rest', isStreakException && 'is-streak-exception', isFuture && 'is-future'].filter(Boolean).join(' ');
              const canEditDay = isCalendarEditing && !isFuture && (!isToday || didUseShield || didAttend);
              const title = didUseShield ? 'Raio usado: clique para retirar e devolver à disponibilidade' : isToday && isCalendarEditing && didAttend ? 'Treino de hoje marcado (clique para remover)' : isToday ? 'Use “Marcar ofensiva de hoje” para registrar hoje' : isFuture ? 'Dia futuro' : !isCalendarEditing ? 'Ative “Editar calendário” para alterar este dia' : isStreakException ? `${holiday ? `${holiday.name} · ` : ''}Pausa na ofensiva atual` : holiday ? `${holiday.name} · treino opcional` : isWeekend ? 'Fim de semana · treino opcional' : didAttend ? (isCurrentStreakDay ? 'Treino da ofensiva atual (clique para remover)' : 'Treino de uma ofensiva anterior (clique para remover)') : 'Clique para marcar treino';
              const dayTimer = data.timerByDay[key] || 0;
              return <button key={key} className={classes} onClick={() => canEditDay && editCalendarDay(key)} disabled={!canEditDay} title={dayTimer ? `${title} · ${formatDuration(dayTimer)} registrados` : title} aria-label={`${day}${holiday ? `, feriado: ${holiday.name}` : ''}${didAttend ? ', treino marcado' : ''}${didUseShield ? ', raio usado; clique para retirar' : ''}${dayTimer ? `, ${formatDuration(dayTimer)} de treino` : ''}`}><span className={didUseShield ? 'shield-glitch-number day-number' : 'day-number'} data-value={didUseShield ? day : undefined}>{day}</span>{dayTimer > 0 && <small className="calendar-day-time">{formatCompactDuration(dayTimer)}</small>}</button>;
            })}</div>
            <section className="stopwatch" aria-label="Cronômetro de treino">
              <div className="stopwatch-info"><p className="section-kicker">CRONÔMETRO</p><strong className="stopwatch-time">{formatDuration(todayTimer)}</strong><small>{data.activeTimer ? 'Contando para hoje' : unsavedTimer > 0 ? 'Tempo pronto para salvar' : 'Tempo salvo hoje'}</small></div>
              <div className="stopwatch-actions">{unsavedTimer > 0 && <><button className="stopwatch-button stopwatch-cancel" type="button" onClick={cancelStopwatch} aria-label="Descartar tempo não salvo" title="Descartar tempo"><Icon icon="mdi:close" aria-hidden="true" /></button><button className="stopwatch-button stopwatch-save" type="button" onClick={saveStopwatch} aria-label="Salvar tempo e marcar dia como feito" title="Salvar tempo"><Icon icon="mdi:check" aria-hidden="true" /></button></>}<button className={`stopwatch-button ${data.activeTimer ? 'is-running' : ''}`} type="button" onClick={toggleStopwatch} disabled={!data.activeTimer && shieldUsed(today)} aria-label={data.activeTimer ? 'Pausar cronômetro' : shieldUsed(today) ? 'Não é possível iniciar: dia protegido por raio' : 'Iniciar cronômetro'} title={data.activeTimer ? 'Pausar cronômetro' : shieldUsed(today) ? 'Não é possível iniciar em um dia protegido por raio' : 'Iniciar cronômetro'}><Icon icon={data.activeTimer ? 'mdi:pause' : 'mdi:play'} aria-hidden="true" /></button></div>
            </section>
          </div>

          <aside className="right-column">
            <div className="action-buttons" aria-label="Ações da ofensiva"><button className={`action-button is-checkin ${attended(today) ? 'is-complete' : ''}`} type="button" onClick={() => toggleWorkout(today)} disabled={attended(today) || shieldUsed(today)} title={attended(today) ? 'Ofensiva marcada hoje' : shieldUsed(today) ? 'Um raio já protege hoje' : 'Marcar ofensiva de hoje'} aria-label={attended(today) ? 'Ofensiva marcada hoje' : 'Marcar ofensiva de hoje'}><Icon icon={attended(today) ? 'mdi:check' : 'mdi:check-circle-outline'} aria-hidden="true"/></button><button className="action-button" type="button" onClick={useShield} disabled={!canUseShield} title={canUseShield ? 'Usar raio hoje' : shieldUnavailableReason} aria-label="Usar raio hoje"><Icon icon="mdi:lightning-bolt" aria-hidden="true"/></button><button className={`action-button ${isCalendarEditing ? 'is-editing' : ''}`} type="button" onClick={() => setIsCalendarEditing((editing) => !editing)} aria-pressed={isCalendarEditing} title={isCalendarEditing ? 'Concluir edição do calendário' : 'Editar calendário'} aria-label={isCalendarEditing ? 'Concluir edição do calendário' : 'Editar calendário'}><Icon icon={isCalendarEditing ? 'mdi:calendar-edit' : 'mdi:pencil-outline'} aria-hidden="true"/></button></div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default App;
