import { useState, useEffect } from 'react';

const NacionalidadForm = ({ nacionalidad, onSubmit, onCancel }) => {
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (nacionalidad) {
            setNombre(nacionalidad.nombre);
        }
    }, [nacionalidad]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        if (nombre.length < 2) {
            setError('El nombre debe tener al menos 2 caracteres');
            return;
        }

        onSubmit({ nombre: nombre.trim() });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">
                    Nombre <span className="required">*</span>
                </label>
                <input
                    type="text"
                    className={`form-input ${error ? 'error' : ''}`}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Argentina"
                    autoFocus
                />
                {error && <span className="form-error">{error}</span>}
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                    {nacionalidad ? 'Actualizar' : 'Crear'} Nacionalidad
                </button>
            </div>
        </form>
    );
};

export default NacionalidadForm;
