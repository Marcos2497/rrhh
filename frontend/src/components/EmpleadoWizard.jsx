import { useState, useEffect } from 'react';
import StepTracker from './StepTracker';
import { createEmpleado, updateEmpleado, getNacionalidades, getProvincias, getCiudades } from '../services/api';

const GENEROS = [
    { value: 'femenino', label: 'Femenino' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'otro', label: 'Otro' },
];

const ESTADOS_CIVILES = [
    { value: 'soltero', label: 'Soltero/a' },
    { value: 'casado', label: 'Casado/a' },
    { value: 'divorciado', label: 'Divorciado/a' },
    { value: 'viudo', label: 'Viudo/a' },
];

const TIPOS_DOCUMENTO = [
    { value: 'cedula', label: 'Cédula' },
    { value: 'pasaporte', label: 'Pasaporte' },
];

// Tooltip content for Argentine labor law
const TOOLTIP_EDAD_MINIMA = `En Argentina, la edad mínima para trabajar es 16 años, según la Ley 26.390 de Prohibición del Trabajo Infantil y Protección del Trabajo Adolescente.

Entre 16 y 18 años, los adolescentes pueden trabajar con autorización de sus padres o tutores, en una jornada reducida de hasta 6 horas diarias o 36 horas semanales, y sin realizar tareas nocturnas, peligrosas o insalubres.

Como excepción, los adolescentes de 14 a 16 años solo pueden trabajar en empresas familiares, en jornadas más reducidas (máximo 3 horas diarias y 15 horas semanales), con autorización administrativa y siempre que no se vea afectada su escolaridad.`;

// Componente de error de campo
const FieldError = ({ message }) => {
    if (!message) return null;
    return <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{message}</span>;
};

const EmpleadoWizard = ({ empleado: empleadoToEdit, onClose, onSuccess }) => {
    const isEditMode = !!empleadoToEdit;
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [showTooltipEdad, setShowTooltipEdad] = useState(false);

    // Datos externos
    const [nacionalidades, setNacionalidades] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);

    // Form data - Paso 1: Información básica
    const [info, setInfo] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        tipoDocumento: 'cedula',
        numeroDocumento: '',
        cuil: '',
        fechaNacimiento: '',
        nacionalidad: '',
        genero: '',
        estadoCivil: '',
    });

    // Form data - Paso 2: Dirección
    const [direccion, setDireccion] = useState({
        calle: '',
        numero: '',
        piso: '',
        departamento: '',
        codigoPostal: '',
        provinciaId: '',
        provinciaNombre: '',
        ciudadId: '',
        ciudadNombre: '',
    });

    const steps = [
        { number: 1, title: 'Información Básica' },
        { number: 2, title: 'Dirección' },
    ];

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    // Cargar datos del empleado si es edición
    useEffect(() => {
        if (empleadoToEdit) {
            setInfo({
                nombre: empleadoToEdit.nombre || '',
                apellido: empleadoToEdit.apellido || '',
                email: empleadoToEdit.email || '',
                telefono: empleadoToEdit.telefono || '',
                tipoDocumento: empleadoToEdit.tipoDocumento || 'cedula',
                numeroDocumento: empleadoToEdit.numeroDocumento || '',
                cuil: empleadoToEdit.cuil || '',
                fechaNacimiento: empleadoToEdit.fechaNacimiento || '',
                nacionalidad: empleadoToEdit.nacionalidad || '',
                genero: empleadoToEdit.genero || '',
                estadoCivil: empleadoToEdit.estadoCivil || '',
            });
            setDireccion({
                calle: empleadoToEdit.calle || '',
                numero: empleadoToEdit.numero || '',
                piso: empleadoToEdit.piso || '',
                departamento: empleadoToEdit.departamento || '',
                codigoPostal: empleadoToEdit.codigoPostal || '',
                provinciaId: empleadoToEdit.provinciaId || '',
                provinciaNombre: empleadoToEdit.provinciaNombre || '',
                ciudadId: empleadoToEdit.ciudadId || '',
                ciudadNombre: empleadoToEdit.ciudadNombre || '',
            });
        }
    }, [empleadoToEdit]);

    const loadInitialData = async () => {
        try {
            const [nacs, provs] = await Promise.all([
                getNacionalidades(),
                getProvincias(),
            ]);
            setNacionalidades(nacs);
            setProvincias(provs);
        } catch (err) {
            console.error('Error cargando datos:', err);
        }
    };

    // Cargar ciudades cuando cambia la provincia
    useEffect(() => {
        if (direccion.provinciaId) {
            loadCiudades(direccion.provinciaId);
        } else {
            setCiudades([]);
        }
    }, [direccion.provinciaId]);



    const loadCiudades = async (provinciaId) => {
        try {
            const data = await getCiudades(provinciaId);
            setCiudades(data);
        } catch (err) {
            console.error('Error cargando ciudades:', err);
        }
    };



    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field);
    };

    const validateField = (field) => {
        const errors = { ...fieldErrors };

        // Step 1 validations
        if (field === 'nombre' && !info.nombre?.trim()) errors.nombre = 'El nombre es requerido';
        else if (field === 'nombre') delete errors.nombre;

        if (field === 'apellido' && !info.apellido?.trim()) errors.apellido = 'El apellido es requerido';
        else if (field === 'apellido') delete errors.apellido;

        if (field === 'email') {
            if (!info.email?.trim()) errors.email = 'El email es requerido';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errors.email = 'Email inválido';
            else delete errors.email;
        }

        if (field === 'numeroDocumento' && !info.numeroDocumento?.trim()) errors.numeroDocumento = 'El documento es requerido';
        else if (field === 'numeroDocumento') delete errors.numeroDocumento;

        if (field === 'fechaNacimiento' && !info.fechaNacimiento?.trim()) errors.fechaNacimiento = 'La fecha es requerida';
        else if (field === 'fechaNacimiento') delete errors.fechaNacimiento;

        if (field === 'nacionalidad' && !info.nacionalidad?.trim()) errors.nacionalidad = 'La nacionalidad es requerida';
        else if (field === 'nacionalidad') delete errors.nacionalidad;

        if (field === 'genero' && !info.genero?.trim()) errors.genero = 'El género es requerido';
        else if (field === 'genero') delete errors.genero;

        if (field === 'estadoCivil' && !info.estadoCivil?.trim()) errors.estadoCivil = 'El estado civil es requerido';
        else if (field === 'estadoCivil') delete errors.estadoCivil;

        // Step 2 validations
        if (field === 'calle' && !direccion.calle?.trim()) errors.calle = 'La calle es requerida';
        else if (field === 'calle') delete errors.calle;

        if (field === 'numero' && !direccion.numero?.trim()) errors.numero = 'El número es requerido';
        else if (field === 'numero') delete errors.numero;

        if (field === 'provinciaId' && !direccion.provinciaId) errors.provinciaId = 'La provincia es requerida';
        else if (field === 'provinciaId') delete errors.provinciaId;



        setFieldErrors(errors);
    };

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setInfo(prev => ({ ...prev, [name]: value }));
        setError('');
        if (touched[name]) validateField(name);
    };

    const handleDireccionChange = (e) => {
        const { name, value } = e.target;

        if (name === 'provinciaId') {
            const prov = provincias.find(p => p.id === value);
            setDireccion(prev => ({
                ...prev,
                provinciaId: value,
                provinciaNombre: prov?.nombre || '',
                ciudadId: '',
                ciudadNombre: '',
            }));
        } else if (name === 'ciudadId') {
            const city = ciudades.find(c => c.id === value);
            setDireccion(prev => ({
                ...prev,
                ciudadId: value,
                ciudadNombre: city?.nombre || '',
            }));
        } else {
            setDireccion(prev => ({ ...prev, [name]: value }));
        }
        setError('');
        if (touched[name]) validateField(name);
    };



    const validateStep = () => {
        const errors = {};

        if (currentStep === 1) {
            if (!info.nombre?.trim()) errors.nombre = 'El nombre es requerido';
            if (!info.apellido?.trim()) errors.apellido = 'El apellido es requerido';
            if (!info.email?.trim()) errors.email = 'El email es requerido';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errors.email = 'Email inválido';

            // Validación de documento
            if (!info.numeroDocumento?.trim()) {
                errors.numeroDocumento = 'El documento es requerido';
            } else if (!/^(\d{8}|[MF]\d{7})$/.test(info.numeroDocumento)) {
                errors.numeroDocumento = 'El documento debe ser 8 números o comenzar con M/F seguido de 7 números';
            }

            // Validación de fecha de nacimiento
            if (!info.fechaNacimiento?.trim()) {
                errors.fechaNacimiento = 'La fecha es requerida';
            } else {
                const birthDate = new Date(info.fechaNacimiento);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // No puede ser futura
                if (birthDate > today) {
                    errors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura';
                } else {
                    // Calcular edad
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    if (age < 14) {
                        errors.fechaNacimiento = 'El empleado debe tener al menos 14 años';
                    }
                }
            }

            if (!info.nacionalidad?.trim()) errors.nacionalidad = 'La nacionalidad es requerida';
            if (!info.genero?.trim()) errors.genero = 'El género es requerido';
            if (!info.estadoCivil?.trim()) errors.estadoCivil = 'El estado civil es requerido';
        }

        if (currentStep === 2) {
            if (!direccion.calle?.trim()) errors.calle = 'La calle es requerida';
            if (!direccion.numero?.trim()) errors.numero = 'El número es requerido';
            if (!direccion.provinciaId) errors.provinciaId = 'La provincia es requerida';
        }



        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            setError('Por favor completa todos los campos obligatorios');
            // Mark all fields as touched
            const allTouched = {};
            Object.keys(errors).forEach(key => { allTouched[key] = true; });
            setTouched(prev => ({ ...prev, ...allTouched }));
            return false;
        }

        setError('');
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 2));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        setError('');

        try {
            const data = {
                ...info,
                ...direccion,
            };

            if (isEditMode) {
                await updateEmpleado(empleadoToEdit.id, data);
                onSuccess();
            } else {
                const nuevoEmpleado = await createEmpleado(data);
                onSuccess(nuevoEmpleado);
            }
        } catch (err) {
            const errorMessage = err.message.toLowerCase();
            // Detect step 1 field errors (nombre, apellido, email, documento, cuil, fecha nacimiento, nacionalidad, género, estado civil)
            const step1Fields = ['nombre', 'apellido', 'email', 'documento', 'cuil', 'fecha', 'nacimiento', 'nacionalidad', 'género', 'genero', 'estado civil', 'estadocivil', 'edad', 'años'];
            const isStep1Error = step1Fields.some(field => errorMessage.includes(field));

            if (isStep1Error) {
                setCurrentStep(1);
                // Set specific field errors based on error message
                if (errorMessage.includes('email')) {
                    if (errorMessage.includes('unique') || errorMessage.includes('existe') || errorMessage.includes('duplicado') || errorMessage.includes('registrado')) {
                        setFieldErrors(prev => ({ ...prev, email: 'Este email ya está registrado' }));
                    } else {
                        setFieldErrors(prev => ({ ...prev, email: 'Debe ser un email válido' }));
                    }
                    setTouched(prev => ({ ...prev, email: true }));
                }
                if (errorMessage.includes('documento')) {
                    setFieldErrors(prev => ({ ...prev, numeroDocumento: err.message }));
                    setTouched(prev => ({ ...prev, numeroDocumento: true }));
                }
                if (errorMessage.includes('cuil')) {
                    setFieldErrors(prev => ({ ...prev, cuil: err.message }));
                    setTouched(prev => ({ ...prev, cuil: true }));
                }
                if (errorMessage.includes('apellido')) {
                    setFieldErrors(prev => ({ ...prev, apellido: err.message }));
                    setTouched(prev => ({ ...prev, apellido: true }));
                }
                if (errorMessage.includes('nombre') && !errorMessage.includes('apellido')) {
                    setFieldErrors(prev => ({ ...prev, nombre: err.message }));
                    setTouched(prev => ({ ...prev, nombre: true }));
                }
                // Handle fechaNacimiento errors (futura, edad, años, nacimiento)
                if (errorMessage.includes('fecha') || errorMessage.includes('nacimiento') ||
                    errorMessage.includes('futura') || errorMessage.includes('edad') ||
                    errorMessage.includes('años') || errorMessage.includes('14')) {
                    setFieldErrors(prev => ({ ...prev, fechaNacimiento: err.message }));
                    setTouched(prev => ({ ...prev, fechaNacimiento: true }));
                }
            }
            // Always show the error message in the banner
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Nombre *</label>
                    <input
                        type="text"
                        name="nombre"
                        className={`form-input ${touched.nombre && fieldErrors.nombre ? 'input-error' : ''}`}
                        value={info.nombre}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('nombre')}
                        placeholder="Ingrese el nombre"
                    />
                    <FieldError message={touched.nombre && fieldErrors.nombre} />
                </div>
                <div className="form-group">
                    <label className="form-label">Apellido *</label>
                    <input
                        type="text"
                        name="apellido"
                        className={`form-input ${touched.apellido && fieldErrors.apellido ? 'input-error' : ''}`}
                        value={info.apellido}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('apellido')}
                        placeholder="Ingrese el apellido"
                    />
                    <FieldError message={touched.apellido && fieldErrors.apellido} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                        type="email"
                        name="email"
                        className={`form-input ${touched.email && fieldErrors.email ? 'input-error' : ''}`}
                        value={info.email}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('email')}
                        placeholder="email@ejemplo.com"
                    />
                    <FieldError message={touched.email && fieldErrors.email} />
                </div>
                <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        className="form-input"
                        value={info.telefono}
                        onChange={handleInfoChange}
                        placeholder="+54 11 1234-5678"
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Tipo de Documento *</label>
                    <select
                        name="tipoDocumento"
                        className="form-input"
                        value={info.tipoDocumento}
                        onChange={handleInfoChange}
                    >
                        {TIPOS_DOCUMENTO.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Número de Documento *</label>
                    <input
                        type="text"
                        name="numeroDocumento"
                        className={`form-input ${touched.numeroDocumento && fieldErrors.numeroDocumento ? 'input-error' : ''}`}
                        value={info.numeroDocumento}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('numeroDocumento')}
                        placeholder="12345678"
                    />
                    <FieldError message={touched.numeroDocumento && fieldErrors.numeroDocumento} />
                </div>
                <div className="form-group">
                    <label className="form-label">CUIL</label>
                    <input
                        type="text"
                        name="cuil"
                        className={`form-input ${touched.cuil && fieldErrors.cuil ? 'input-error' : ''}`}
                        value={info.cuil}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('cuil')}
                        placeholder="XX-XXXXXXXX-X"
                    />
                    <FieldError message={touched.cuil && fieldErrors.cuil} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Fecha de Nacimiento *
                        <span
                            className="tooltip-icon"
                            onClick={() => setShowTooltipEdad(!showTooltipEdad)}
                        >
                            ?
                        </span>
                    </label>
                    {showTooltipEdad && (
                        <div className="tooltip-info">
                            {TOOLTIP_EDAD_MINIMA.split('\n\n').map((paragraph, i) => (
                                <p key={i} style={{ marginBottom: i < 2 ? '0.75rem' : 0 }}>{paragraph}</p>
                            ))}
                        </div>
                    )}
                    <input
                        type="date"
                        name="fechaNacimiento"
                        className={`form-input ${touched.fechaNacimiento && fieldErrors.fechaNacimiento ? 'input-error' : ''}`}
                        value={info.fechaNacimiento}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('fechaNacimiento')}
                    />
                    <FieldError message={touched.fechaNacimiento && fieldErrors.fechaNacimiento} />
                </div>
                <div className="form-group">
                    <label className="form-label">Nacionalidad *</label>
                    <select
                        name="nacionalidad"
                        className={`form-input ${touched.nacionalidad && fieldErrors.nacionalidad ? 'input-error' : ''}`}
                        value={info.nacionalidad}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('nacionalidad')}
                    >
                        <option value="">Seleccionar nacionalidad</option>
                        {nacionalidades.map(nac => (
                            <option key={nac} value={nac}>{nac}</option>
                        ))}
                    </select>
                    <FieldError message={touched.nacionalidad && fieldErrors.nacionalidad} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Género *</label>
                    <select
                        name="genero"
                        className={`form-input ${touched.genero && fieldErrors.genero ? 'input-error' : ''}`}
                        value={info.genero}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('genero')}
                    >
                        <option value="">Seleccionar género</option>
                        {GENEROS.map(g => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                    </select>
                    <FieldError message={touched.genero && fieldErrors.genero} />
                </div>
                <div className="form-group">
                    <label className="form-label">Estado Civil *</label>
                    <select
                        name="estadoCivil"
                        className={`form-input ${touched.estadoCivil && fieldErrors.estadoCivil ? 'input-error' : ''}`}
                        value={info.estadoCivil}
                        onChange={handleInfoChange}
                        onBlur={() => handleBlur('estadoCivil')}
                    >
                        <option value="">Seleccionar estado civil</option>
                        {ESTADOS_CIVILES.map(e => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                    </select>
                    <FieldError message={touched.estadoCivil && fieldErrors.estadoCivil} />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Calle *</label>
                    <input
                        type="text"
                        name="calle"
                        className={`form-input ${touched.calle && fieldErrors.calle ? 'input-error' : ''}`}
                        value={direccion.calle}
                        onChange={handleDireccionChange}
                        onBlur={() => handleBlur('calle')}
                        placeholder="Nombre de la calle"
                    />
                    <FieldError message={touched.calle && fieldErrors.calle} />
                </div>
                <div className="form-group">
                    <label className="form-label">Número *</label>
                    <input
                        type="text"
                        name="numero"
                        className={`form-input ${touched.numero && fieldErrors.numero ? 'input-error' : ''}`}
                        value={direccion.numero}
                        onChange={handleDireccionChange}
                        onBlur={() => handleBlur('numero')}
                        placeholder="123"
                    />
                    <FieldError message={touched.numero && fieldErrors.numero} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Piso</label>
                    <input
                        type="text"
                        name="piso"
                        className="form-input"
                        value={direccion.piso}
                        onChange={handleDireccionChange}
                        placeholder="1"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Departamento</label>
                    <input
                        type="text"
                        name="departamento"
                        className="form-input"
                        value={direccion.departamento}
                        onChange={handleDireccionChange}
                        placeholder="A"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Código Postal</label>
                    <input
                        type="text"
                        name="codigoPostal"
                        className="form-input"
                        value={direccion.codigoPostal}
                        onChange={handleDireccionChange}
                        placeholder="1234"
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Provincia *</label>
                    <select
                        name="provinciaId"
                        className={`form-input ${touched.provinciaId && fieldErrors.provinciaId ? 'input-error' : ''}`}
                        value={direccion.provinciaId}
                        onChange={handleDireccionChange}
                        onBlur={() => handleBlur('provinciaId')}
                    >
                        <option value="">Seleccionar provincia</option>
                        {provincias.map(prov => (
                            <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                        ))}
                    </select>
                    <FieldError message={touched.provinciaId && fieldErrors.provinciaId} />
                </div>
                <div className="form-group">
                    <label className="form-label">Ciudad</label>
                    <select
                        name="ciudadId"
                        className="form-input"
                        value={direccion.ciudadId}
                        onChange={handleDireccionChange}
                        disabled={!direccion.provinciaId}
                    >
                        <option value="">
                            {direccion.provinciaId ? 'Seleccionar ciudad' : 'Primero seleccione provincia'}
                        </option>
                        {ciudades.map(city => (
                            <option key={city.id} value={city.id}>{city.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );



    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '950px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditMode ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '2rem' }}>
                    <StepTracker steps={steps} currentStep={currentStep} />

                    <div style={{ marginTop: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {steps[currentStep - 1].title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {currentStep === 1 && 'Ingresa los datos básicos del empleado'}
                            {currentStep === 2 && 'Ingresa la dirección del empleado'}
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)' }}>
                    <div>
                        {currentStep > 1 && (
                            <button className="btn btn-secondary" onClick={prevStep}>
                                Anterior
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        {currentStep < 2 ? (
                            <button className="btn btn-primary" onClick={nextStep}>
                                Siguiente
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')} Empleado
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmpleadoWizard;
