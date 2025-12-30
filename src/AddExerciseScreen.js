import React, { useState } from 'react';

function AddExerciseScreen({ onAddExercise, sections, onCancel }) {
  const [exerciseName, setExerciseName] = useState('');
  const [section, setSection] = useState('');
  const [weight, setWeight] = useState('');
  const [step, setStep] = useState(1); // 1: nome, 2: categoria, 3: peso

  // Função para filtrar as tags igual à tela de edição
  const getFilteredSections = () => {
    if (!sections) return [];
    if (!section.trim()) return sections;
    return sections.filter(sec => {
      if (sec.toLowerCase() === section.toLowerCase().trim()) return false;
      return sec.toLowerCase().includes(section.toLowerCase());
    });
  };

  const handleContinue = () => {
    if (step === 1 && exerciseName.trim()) {
      setStep(2);
    } else if (step === 2 && section.trim()) {
      setStep(3);
    }
  };

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
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      handleClose();
    }
  };

  return (
    <div className="edit-screen" style={{ maxWidth: 340, minWidth: 280, width: '100%', maxHeight: 340 }}>
      <div className="edit-header modal-header-flex">
        <h2 className={!exerciseName.trim() ? 'placeholder' : ''}>
          {exerciseName.trim() ? exerciseName : 'Novo exercício'}
        </h2>
        <button
          className="close-modal-button"
          onClick={handleClose}
          aria-label="Fechar"
        >
          &#10005;
        </button>
      </div>
      <div className="edit-content">
        {step === 1 && (
          <>
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
            <div className="modal-buttons">
              <button className="cancel-button" onClick={handleBack}>
                Voltar
              </button>
              <button
                className="confirm-button"
                onClick={handleContinue}
                disabled={!exerciseName.trim()}
              >
                Continuar
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="form-group">
              <label>Seção/Categoria</label>
              <input
                type="text"
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="Ex: Peito, Pernas, Costas..."
                autoFocus
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
            <div className="modal-buttons">
              <button className="cancel-button" onClick={handleBack}>
                Voltar
              </button>
              <button
                className="confirm-button"
                onClick={handleContinue}
                disabled={!section.trim()}
              >
                Continuar
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
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
                  autoFocus
                />
                <span className="weight-unit">kg</span>
              </div>
            </div>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={handleBack}>
                Voltar
              </button>
              <button
                className="confirm-button"
                onClick={handleAdd}
                disabled={!weight.trim()}
              >
                Adicionar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AddExerciseScreen;
