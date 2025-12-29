import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './LoadProgression.css';

function LoadProgression({ darkMode }) {
  const [exercises, setExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedChartExercise, setSelectedChartExercise] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [section, setSection] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [tempChartSection, setTempChartSection] = useState(null);
  const [tempChartExercise, setTempChartExercise] = useState(null);

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
    setShowEditModal(true);
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
        
        // Adicionar novo peso se foi informado
        if (weight.trim()) {
          updates.history = [
            ...ex.history,
            {
              date: new Date().toISOString(),
              weight: parseFloat(weight)
            }
          ];
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
    setShowEditModal(false);
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

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="load-progression-container">
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
                <button className="confirm-button" onClick={handleAddExercise}>
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedExercise && (
          <div className="modal-overlay" onClick={() => {
            setShowEditModal(false);
            setSelectedSection(null);
          }}>
            <div className="modal-content modal-edit" onClick={(e) => e.stopPropagation()}>
              <h2>Editar exercício</h2>
              
              <div className="form-group">
                <label>Nome do exercício</label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Ex: Supino reto"
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
                <label>Adicionar nova carga</label>
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

              <div className="history-section">
                <label>Histórico de cargas</label>
                <div className="history-list">
                  {selectedExercise.history.map((entry, index) => (
                    <div key={index} className="history-item">
                      <div className="history-info">
                        <span className="history-weight">{entry.weight} kg</span>
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
                  ))}
                </div>
              </div>

              <div className="modal-buttons">
                <button className="cancel-button" onClick={() => {
                  setShowEditModal(false);
                  setSelectedExercise(null);
                  setExerciseName('');
                  setWeight('');
                  setSection('');
                  setSelectedSection(null);
                }}>
                  Cancelar
                </button>
                <button className="confirm-button" onClick={handleUpdateExercise}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {exercises.length > 0 && (
          <div className="chart-section">
            <h2 className="chart-title">Progressão de carga</h2>
            
            <div className="exercise-selector">
              <label>Exercício do gráfico:</label>
              <button 
                className="chart-exercise-button"
                onClick={() => setShowChartModal(true)}
              >
                {getSelectedExerciseName()}
              </button>
            </div>

            {showChartModal && (
              <div className="modal-overlay" onClick={() => {
                setShowChartModal(false);
                setTempChartSection(null);
                setTempChartExercise(null);
              }}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Selecionar exercício</h2>
                  
                  <div className="form-group">
                    <label>1. Selecione a categoria</label>
                    <div className="chart-selection-grid">
                      {Object.keys(groupExercisesBySection()).map((sectionName) => (
                        <button
                          key={sectionName}
                          type="button"
                          className={`chart-section-button ${
                            tempChartSection === sectionName ? 'selected' : ''
                          }`}
                          onClick={() => {
                            setTempChartSection(sectionName);
                            setTempChartExercise(null);
                          }}
                        >
                          {sectionName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tempChartSection && (
                    <div className="form-group">
                      <label>2. Selecione o exercício</label>
                      <div className="chart-selection-grid">
                        {getExercisesBySectionForChart(tempChartSection).map((exercise) => (
                          <button
                            key={exercise.id}
                            type="button"
                            className={`chart-section-button ${
                              tempChartExercise === exercise.id ? 'selected' : ''
                            }`}
                            onClick={() => setTempChartExercise(exercise.id)}
                          >
                            {exercise.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="modal-buttons">
                    <button className="cancel-button" onClick={() => {
                      setShowChartModal(false);
                      setTempChartSection(null);
                      setTempChartExercise(null);
                    }}>
                      Cancelar
                    </button>
                    <button 
                      className="confirm-button" 
                      onClick={handleConfirmChartSelection}
                      disabled={!tempChartExercise}
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {getChartData().length > 0 && (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={getChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
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
                    <Tooltip 
                      position={{ y: 0 }}
                      cursor={false}
                      contentStyle={{
                        backgroundColor: darkMode ? '#3a3a3a' : 'white',
                        border: `1px solid ${darkMode ? '#555' : '#e0e0e0'}`,
                        borderRadius: '10px',
                        color: darkMode ? '#ddd' : '#333',
                        fontFamily: 'Montserrat, sans-serif',
                        padding: '12px',
                        boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ 
                        color: darkMode ? '#ddd' : '#333', 
                        fontWeight: 600,
                        marginBottom: '4px',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                      itemStyle={{
                        color: '#FF4500',
                        fontWeight: 600
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="peso" 
                      stroke="#FF4500" 
                      strokeWidth={3}
                      dot={{ fill: '#FF4500', strokeWidth: 2, r: 6, stroke: darkMode ? '#2d2d2d' : 'white' }}
                      activeDot={{ r: 8, stroke: '#FF4500', strokeWidth: 2, fill: 'white' }}
                      fill="url(#colorPeso)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadProgression;
