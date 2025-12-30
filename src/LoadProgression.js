import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import './LoadProgression.css';

function LoadProgression({ darkMode }) {
  const [exercises, setExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list' ou 'edit'
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedChartExercise, setSelectedChartExercise] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [section, setSection] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [tempChartSection, setTempChartSection] = useState(null);
  const [tempChartExercise, setTempChartExercise] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('exercises');
    if (saved) {
      const loadedExercises = JSON.parse(saved);
      // Migrar dados antigos para novo formato com history
      const migratedExercises = loadedExercises.map(ex => {
        if (!ex.history && ex.weight !== undefined) {
          // Formato antigo: converter para novo formato
          return {
            id: ex.id,
            name: ex.name,
            history: [
              {
                date: new Date().toISOString(),
                weight: ex.weight
              }
            ]
          };
        }
        return ex;
      });
      setExercises(migratedExercises);
      // Salvar no novo formato
      localStorage.setItem('exercises', JSON.stringify(migratedExercises));
      
      // Selecionar primeiro exercício para o gráfico
      if (migratedExercises.length > 0) {
        setSelectedChartExercise(migratedExercises[0].id);
      }
    }
  }, []);

  // Controlar overlay no body quando modais estiverem abertos
  useEffect(() => {
    if (showModal || showChartModal) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [showModal, showChartModal]);

  const handleAddExercise = () => {
    if (exerciseName.trim() && weight.trim() && section.trim()) {
      const newExercise = {
        id: Date.now(),
        name: exerciseName.trim(),
        section: section.trim(),
        history: [
          {
            date: new Date().toISOString(),
            weight: parseFloat(weight)
          }
        ]
      };
      const newExercises = [...exercises, newExercise];
      setExercises(newExercises);
      localStorage.setItem('exercises', JSON.stringify(newExercises));
      
      // Selecionar automaticamente o novo exercício no gráfico
      setSelectedChartExercise(newExercise.id);
      
      setExerciseName('');
      setWeight('');
      setSection('');
      setSelectedSection(null);
      setShowModal(false);
    }
  };

  const handleDeleteExercise = (id, e) => {
    e.stopPropagation();
    const newExercises = exercises.filter(ex => ex.id !== id);
    setExercises(newExercises);
    localStorage.setItem('exercises', JSON.stringify(newExercises));
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setExerciseName(exercise.name);
    setSection(exercise.section || '');
    setWeight('');
    
    // Definir hoveredPoint com o último valor do histórico
    if (exercise.history && exercise.history.length > 0) {
      const lastEntry = exercise.history[exercise.history.length - 1];
      setHoveredPoint({
        date: formatDate(lastEntry.date),
        peso: lastEntry.weight
      });
    } else {
      setHoveredPoint(null);
    }
    
    setCurrentView('edit');
  };

  const handleAddWeight = () => {
    if (!selectedExercise || !weight.trim()) return;
    
    const updatedExercises = exercises.map(ex => {
      if (ex.id === selectedExercise.id) {
        return {
          ...ex,
          history: [
            ...ex.history,
            {
              date: new Date().toISOString(),
              weight: parseFloat(weight)
            }
          ]
        };
      }
      return ex;
    });
    
    setExercises(updatedExercises);
    localStorage.setItem('exercises', JSON.stringify(updatedExercises));
    
    // Atualizar o exercício selecionado com o novo histórico
    const updatedSelected = updatedExercises.find(ex => ex.id === selectedExercise.id);
    if (updatedSelected) {
      setSelectedExercise(updatedSelected);
      
      // Atualizar hoveredPoint com o novo valor adicionado
      const lastEntry = updatedSelected.history[updatedSelected.history.length - 1];
      setHoveredPoint({
        date: formatDate(lastEntry.date),
        peso: lastEntry.weight
      });
    }
    
    setWeight('');
  };

  const handleUpdateExercise = () => {
    if (!selectedExercise) return;
    
    const updatedExercises = exercises.map(ex => {
      if (ex.id === selectedExercise.id) {
        const updates = { ...ex };
        
        // Atualizar nome se foi alterado
        if (exerciseName.trim() && exerciseName.trim() !== ex.name) {
          updates.name = exerciseName.trim();
        }
        
        // Atualizar seção se foi alterada
        if (section.trim() && section.trim() !== ex.section) {
          updates.section = section.trim();
        }
        
        return updates;
      }
      return ex;
    });
    
    // Remover exercícios sem histórico
    const filteredExercises = updatedExercises.filter(ex => ex.history && ex.history.length > 0);
    
    setExercises(filteredExercises);
    localStorage.setItem('exercises', JSON.stringify(filteredExercises));
    setExerciseName('');
    setWeight('');
    setSection('');
    setSelectedSection(null);
    setSelectedExercise(null);
    setCurrentView('list');
  };

  const handleDeleteWeight = (exerciseId, weightIndex) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          history: ex.history.filter((_, index) => index !== weightIndex)
        };
      }
      return ex;
    });
    
    setExercises(updatedExercises);
    localStorage.setItem('exercises', JSON.stringify(updatedExercises));
    
    // Atualizar o exercício selecionado no modal
    if (selectedExercise && selectedExercise.id === exerciseId) {
      const updatedSelected = updatedExercises.find(ex => ex.id === exerciseId);
      if (updatedSelected) {
        setSelectedExercise(updatedSelected);
      }
    }
  };

  const getLatestWeight = (exercise) => {
    if (!exercise.history || exercise.history.length === 0) {
      return 0;
    }
    return exercise.history[exercise.history.length - 1].weight;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getChartData = () => {
    if (!selectedChartExercise) return [];
    
    const exercise = exercises.find(ex => ex.id === selectedChartExercise);
    if (!exercise || !exercise.history) return [];
    
    return exercise.history.map(entry => ({
      date: formatDate(entry.date),
      peso: entry.weight
    }));
  };

  const getUniqueSections = () => {
    const sections = exercises.map(ex => ex.section || 'Sem categoria').filter(Boolean);
    return [...new Set(sections)].sort();
  };

  const groupExercisesBySection = () => {
    const grouped = {};
    exercises.forEach(exercise => {
      const sectionName = exercise.section || 'Sem categoria';
      if (!grouped[sectionName]) {
        grouped[sectionName] = [];
      }
      grouped[sectionName].push(exercise);
    });
    return grouped;
  };

  const getFilteredSections = () => {
    const allSections = getUniqueSections();
    if (!section.trim()) return allSections;
    
    return allSections.filter(sec => {
      // Se o texto digitado for exatamente igual à seção, não mostrar
      if (sec.toLowerCase() === section.toLowerCase().trim()) {
        return false;
      }
      // Caso contrário, mostrar se a seção contém o texto digitado
      return sec.toLowerCase().includes(section.toLowerCase());
    });
  };

  const handleSectionChange = (value) => {
    setSection(value);
  };

  const handleSectionClick = (sec) => {
    setSection(sec);
  };

  const handleConfirmChartSelection = () => {
    if (tempChartExercise) {
      setSelectedChartExercise(tempChartExercise);
      setHoveredPoint(null);
      setShowChartModal(false);
      setTempChartSection(null);
      setTempChartExercise(null);
    }
  };

  const getExercisesBySectionForChart = (sectionName) => {
    return exercises.filter(ex => (ex.section || 'Sem categoria') === sectionName);
  };

  const getSelectedExerciseName = () => {
    const exercise = exercises.find(ex => ex.id === selectedChartExercise);
    return exercise ? exercise.name : 'Selecionar exercício';
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedExercise(null);
    setExerciseName('');
    setWeight('');
    setSection('');
    setSelectedSection(null);
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="load-progression-container">
        {currentView === 'list' && (
          <>
            <h1 className="page-title">Exercícios</h1>
        
        <button className="add-exercise-button" onClick={() => setShowModal(true)}>
          <Icon icon="pajamas:todo-add" className="add-icon" />
          Adicionar exercício
        </button>

        {exercises.length === 0 && (
          <div className="empty-state" onClick={() => setShowModal(true)}>
            <Icon icon="pajamas:todo-add" className="empty-icon" />
            <span>Adicione um exercício para começar</span>
          </div>
        )}

        {exercises.length > 0 && (
          <div className="exercises-list">
            {Object.entries(groupExercisesBySection()).map(([sectionName, sectionExercises]) => (
              <div key={sectionName} className="section-group">
                <h3 className="section-title">{sectionName}</h3>
                {sectionExercises.map((exercise) => (
                  <div 
                    key={exercise.id} 
                    className="exercise-item"
                    onClick={() => handleExerciseClick(exercise)}
                  >
                    <div className="exercise-info">
                      <span className="exercise-name">{exercise.name}</span>
                      <span className="exercise-weight">{getLatestWeight(exercise)} kg</span>
                    </div>
                    <button 
                      className="delete-button"
                      onClick={(e) => handleDeleteExercise(exercise.id, e)}
                      title="Remover exercício"
                    >
                      <Icon icon="mdi:close" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Adicionar exercício</h2>
              
              <div className="form-group">
                <label>Nome do exercício</label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Ex: Supino reto"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Seção/Categoria</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  placeholder="Ex: Peito, Pernas, Costas..."
                />
                {getUniqueSections().length > 0 && getFilteredSections().length > 0 && (
                  <div className="section-tags">
                    {getFilteredSections().map((sec, index) => (
                      <button
                        key={index}
                        type="button"
                        className="section-tag"
                        onClick={() => handleSectionClick(sec)}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Peso inicial</label>
                <div className="weight-input-container">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                    step="0.5"
                    min="0"
                  />
                  <span className="weight-unit">kg</span>
                </div>
              </div>

              <div className="modal-buttons">
                <button className="cancel-button" onClick={() => {
                  setShowModal(false);
                  setSelectedSection(null);
                }}>
                  Cancelar
                </button>
                <button 
                  className="confirm-button" 
                  onClick={handleAddExercise}
                  disabled={!exerciseName.trim() || !weight.trim() || !section.trim()}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {currentView === 'edit' && selectedExercise && (
          <div className="edit-screen">
            <div className="edit-header">
              <h2 className={!exerciseName ? 'placeholder' : ''}>
                {exerciseName || selectedExercise.name}
              </h2>
            </div>
            
            <div className="edit-content">
              
              <div className="form-group">
                <label>Nome do exercício</label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Ex: Supino reto"
                  className={exerciseName.trim() ? '' : 'input-error'}
                />
              </div>

              <div className="form-group">
                <label>Seção/Categoria</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  placeholder="Ex: Peito, Pernas, Costas..."
                />
                {getUniqueSections().length > 0 && (
                  <div className="section-tags">
                    {getFilteredSections().map((sec, index) => (
                      <button
                        key={index}
                        type="button"
                        className="section-tag"
                        onClick={() => handleSectionClick(sec)}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="add-weight-label">
                  <Icon icon="fluent:flash-add-20-filled" style={{ marginRight: '6px', fontSize: '1.1rem', verticalAlign: 'middle', color: '#FF4500' }} />
                  Nova carga
                </label>
                <div className="weight-input-container">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                    step="0.5"
                    min="0"
                  />
                  <span className="weight-unit">kg</span>
                </div>
                <button 
                  className="add-weight-button"
                  onClick={handleAddWeight}
                  disabled={!weight.trim()}
                >
                  <Icon icon="fluent:flash-add-20-filled" />
                  Adicionar carga
                </button>
              </div>

              {selectedExercise.history.length >= 1 && (
                <div className="chart-section-modal">
                  <label>Progressão de carga</label>
                  {hoveredPoint && hoveredPoint.date && (
                    <div className="chart-info-box">
                      <span className="chart-info-date">{hoveredPoint.date}</span>
                      <span className="chart-info-weight">{hoveredPoint.peso} kg</span>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart 
                      data={[
                        { date: '', peso: 0 },
                        ...selectedExercise.history.map(entry => ({
                          date: formatDate(entry.date),
                          peso: entry.weight
                        }))
                      ]} 
                      margin={{ top: 10, right: 20, left: -30, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4500" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#FF4500" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke={darkMode ? '#555' : '#ccc'}
                        tick={false}
                        axisLine={{ stroke: darkMode ? '#555' : '#e0e0e0' }}
                      />
                      <YAxis 
                        stroke={darkMode ? '#aaa' : '#666'}
                        style={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                        axisLine={{ stroke: darkMode ? '#555' : '#e0e0e0' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#FF4500" 
                        strokeWidth={3}
                        dot={(props) => {
                          const { cx, cy, payload, index } = props;
                          if (!payload.date || payload.peso === 0) return null;
                          
                          const isActive = hoveredPoint && hoveredPoint.date === payload.date && hoveredPoint.peso === payload.peso;
                          
                          return (
                            <circle
                              key={index}
                              cx={cx}
                              cy={cy}
                              r={isActive ? 8 : 6}
                              fill={isActive ? 'white' : '#FF4500'}
                              stroke="#FF4500"
                              strokeWidth={2}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setHoveredPoint(payload)}
                            />
                          );
                        }}
                        activeDot={false}
                        fill="url(#colorPeso)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="history-section">
                <label>Histórico de cargas</label>
                <div className="history-list">
                  {selectedExercise.history.map((entry, index) => {
                    const previousWeight = index > 0 ? selectedExercise.history[index - 1].weight : null;
                    const difference = previousWeight !== null ? entry.weight - previousWeight : null;
                    
                    return (
                      <div key={index} className="history-item">
                        <div className="history-info">
                          <div>
                            <span className="history-weight">{entry.weight} kg</span>
                            {difference !== null && difference !== 0 && (
                              <span className={`history-difference ${difference > 0 ? 'positive' : 'negative'}`}>
                                {' '}({difference > 0 ? '+' : ''}{difference.toFixed(1)} kg)
                              </span>
                            )}
                          </div>
                          <span className="history-date">{formatDate(entry.date)}</span>
                        </div>
                        <button 
                          className="delete-history-button"
                          onClick={() => handleDeleteWeight(selectedExercise.id, index)}
                          title="Remover esta carga"
                        >
                          <Icon icon="mdi:close" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-buttons">
                <button className="cancel-button" onClick={handleBackToList}>
                  Cancelar
                </button>
                <button 
                  className="confirm-button" 
                  onClick={handleUpdateExercise}
                  disabled={!exerciseName.trim()}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadProgression;
