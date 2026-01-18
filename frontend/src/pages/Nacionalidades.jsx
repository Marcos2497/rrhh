import { useState, useEffect } from 'react';
import {
    getNacionalidades,
    createNacionalidad,
    updateNacionalidad,
    deleteNacionalidad,
} from '../services/api';
import NacionalidadForm from '../components/NacionalidadForm';
import NacionalidadList from '../components/NacionalidadList';

const Nacionalidades = () => {
    const [nacionalidades, setNacionalidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingNac, setEditingNac] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadNacionalidades();
    }, [search]);

    const loadNacionalidades = async () => {
        try {
            setLoading(true);
            const data = await getNacionalidades(search);
            setNacionalidades(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingNac(null);
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleEdit = (nac) => {
        setEditingNac(nac);
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (data) => {
        try {
            if (editingNac) {
                await updateNacionalidad(editingNac.id, data);
                setSuccess('Nacionalidad actualizada correctamente');
            } else {
                await createNacionalidad(data);
                setSuccess('Nacionalidad creada correctamente');
            }
            setShowModal(false);
            loadNacionalidades();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (nac) => {
        if (!confirm(`¿Estás seguro de eliminar la nacionalidad "${nac.nombre}"?`)) {
            return;
        }

        try {
            await deleteNacionalidad(nac.id);
            setSuccess('Nacionalidad eliminada correctamente');
            loadNacionalidades();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingNac(null);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Nacionalidades</h1>
                <p className="page-subtitle">Gestiona las nacionalidades del sistema</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                    <button onClick={() => setSuccess('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <div className="filter-group">
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Buscar nacionalidad..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nueva Nacionalidad
                    </button>
                </div>

                <NacionalidadList
                    nacionalidades={nacionalidades}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    loading={loading}
                />
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingNac ? 'Editar' : 'Nueva'} Nacionalidad
                            </h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <NacionalidadForm
                                nacionalidad={editingNac}
                                onSubmit={handleSubmit}
                                onCancel={handleCloseModal}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Nacionalidades;
