import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Empleados from './pages/Empleados';
import Nacionalidades from './pages/Nacionalidades';

function App() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/empleados" replace />} />
                    <Route path="/empleados" element={<Empleados />} />
                    <Route path="/nacionalidades" element={<Nacionalidades />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
