import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './LoadProgression.css';

function AddExerciseScreen({ onAddExercise, sections }) {
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [section, setSection] = useState('');
  const navigate = useNavigate();

  const handleAdd = () => {
    if (exerciseName.trim() && weight.trim() && section.trim()) {
      onAddExercise({
        id: Date.now(),
        name: exerciseName.trim(),
        section: section.trim(),
        history: [
          {
            date: new Date().toISOString(),
            weight: parseFloat(weight)
          }
        ]
      });
      navigate('/progressao-de-carga');
    }
  };

  const handleCancel = () => {
    navigate('/progressao-de-carga');
  };

  // Função para filtrar as tags igual à tela de edição
  const getFilteredSections = () => {
    if (!sections) return [];
    if (!section.trim()) return sections;
    return sections.filter(sec => {
      if (sec.toLowerCase() === section.toLowerCase().trim()) return false;
      return sec.toLowerCase().includes(section.toLowerCase());
    });
  };

  return (
    <div className="edit-screen" style={{ minHeight: '100vh', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="edit-header">
        <h2 className={!exerciseName.trim() ? 'placeholder' : ''}>
          {exerciseName.trim() ? exerciseName : 'Novo exercício'}
        </h2>
      </div>
      <div className="edit-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <div className="form-group">
          <label>Nome do exercício</label>
          <input
            type="text"
            value={exerciseName}
            onChange={e => setExerciseName(e.target.value)}
            placeholder="Ex: Supino reto"
            autoFocus
            className={exerciseName.trim() ? '' : 'input-error'}
          />
        </div>
        <div className="form-group">
          <label>Seção/Categoria</label>
          <input
            type="text"
            value={section}
            onChange={e => setSection(e.target.value)}
            placeholder="Ex: Peito, Pernas, Costas..."
          />
          {sections && sections.length > 0 && (
            <div className="section-tags">
              {getFilteredSections().map((sec, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="section-tag"
                  onClick={() => setSection(sec)}
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
              onChange={e => setWeight(e.target.value)}
              placeholder="0"
              step="0.5"
              min="0"
            />
            <span className="weight-unit">kg</span>
          </div>
        </div>
      </div>
      <div className="modal-buttons" style={{ position: 'static', marginTop: 'auto' }}>
        <button className="cancel-button" onClick={handleCancel}>
          Cancelar
        </button>
        <button
          className="confirm-button"
          onClick={handleAdd}
          disabled={!exerciseName.trim() || !weight.trim() || !section.trim()}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

export default AddExerciseScreen;
