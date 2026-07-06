import { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [vistaActual, setVistaActual] = useState('inicio'); 
  const [objetos, setObjetos] = useState([]);
  const [objetoBuscado, setObjetoBuscado] = useState(null);
  
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  
  const [busquedaId, setBusquedaId] = useState('');
  const [formData, setFormData] = useState({ id: '', name: '', color: '', price: '' });
  const [modoEdicion, setModoEdicion] = useState(false);

  const API_URL = 'https://api.restful-api.dev/objects';

  
  useEffect(() => {
    setError('');
    setExito('');
    setObjetoBuscado(null);
    if (vistaActual === 'inicio') obtenerTodos();
  }, [vistaActual]);

  
  const obtenerTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setObjetos(data.slice(0, 10)); 
    } catch (err) {
      setError('Error al obtener los datos');
    } finally {
      setLoading(false);
    }
  };

  
  const buscarPorId = async (e) => {
    e.preventDefault();
    if (busquedaId.trim() === '') {
      setError('Debes ingresar un ID válido');
      return;
    }

    setLoading(true);
    setError('');
    setExito('');
    try {
      const response = await fetch(`${API_URL}/${busquedaId}`);
      if (!response.ok) throw new Error('No se encontró el objeto');
      const data = await response.json();
      setObjetoBuscado(data);
    } catch (err) {
      setError(err.message);
      setObjetoBuscado(null);
    } finally {
      setLoading(false);
    }
  };

  
  const guardarObjeto = async (e) => {
    e.preventDefault();
    
    
    if (formData.name.trim() === '' || formData.color.trim() === '' || formData.price === '') {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    setError('');
    setExito('');

    const payload = {
      name: formData.name,
      data: {
        color: formData.color,
        price: Number(formData.price)
      }
    };

    try {
      const url = modoEdicion ? `${API_URL}/${formData.id}` : API_URL;
      const method = modoEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al procesar la solicitud. Recuerda que solo puedes editar objetos creados por ti.');
      
      const data = await response.json();
      setExito(`Objeto ${modoEdicion ? 'actualizado' : 'creado'} exitosamente! ID: ${data.id}`);
      
      if (!modoEdicion) {
        setFormData({ id: '', name: '', color: '', price: '' }); 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const eliminarObjeto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este objeto?')) return;

    setLoading(true);
    setError('');
    setExito('');

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar. Solo puedes borrar objetos que tú hayas creado.');
      
      setExito('Objeto eliminado correctamente');
      setObjetoBuscado(null);
      if (vistaActual === 'inicio') obtenerTodos();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const prepararEdicion = (obj) => {
    setFormData({
      id: obj.id,
      name: obj.name,
      color: obj.data?.color || '',
      price: obj.data?.price || ''
    });
    setModoEdicion(true);
    setVistaActual('crear');
  };

  

  return (
    <div>
     
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow">
        <div className="container">
          <span className="navbar-brand mb-0 h1"> Device Manager API</span>
          <div className="navbar-nav ms-auto">
            <button className={`nav-link btn ${vistaActual === 'inicio' ? 'active' : ''}`} 
            onClick={() => setVistaActual('inicio')}>Ver Todos</button>
            <button className={`nav-link btn ${vistaActual === 'buscar' ? 'active' : ''}`}
             onClick={() => setVistaActual('buscar')}>Buscar por ID</button>
            <button className={`nav-link btn ${vistaActual === 'crear' ? 'active' : ''}`} 
            onClick={() => {
              setVistaActual('crear');
              setModoEdicion(false);
              setFormData({ id: '', name: '', color: '', price: '' });
            }}>Crear Nuevo</button>
          </div>
        </div>
      </nav>

      <div className="container">
        
        {error && <div className="alert alert-danger shadow-sm">{error}</div>}
        {exito && <div className="alert alert-success shadow-sm">{exito}</div>}
        {loading && <div className="alert alert-info shadow-sm">Procesando solicitud...</div>}

        
        {vistaActual === 'inicio' && (
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Lista de Objetos (GET)</h4>
            </div>
            <div className="card-body">
              <div className="row">
                {objetos.map((obj) => (
                  <div className="col-md-4 mb-3" key={obj.id}>
                    <div className="card h-100 border-primary">
                      <div className="card-body">
                        <h5 className="card-title">{obj.name}</h5>
                        <p className="card-text mb-1"><strong>ID:</strong> {obj.id}</p>
                        {obj.data && (
                          <div className="small text-muted">
                            {Object.entries(obj.data).map(([key, value]) => (
                              <div key={key}>{key}: {value}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

       
        {vistaActual === 'buscar' && (
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Buscar Objeto (GET BY ID)</h4>
            </div>
            <div className="card-body">
              <form onSubmit={buscarPorId} className="mb-4">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ingresa el ID del objeto (Ej: 1, 2, o tu ID generado)"
                    value={busquedaId}
                    onChange={(e) => setBusquedaId(e.target.value)}
                  />
                  <button type="submit" className="btn btn-success">Buscar</button>
                </div>
              </form>

              {objetoBuscado && (
                <div className="card border-success mt-3">
                  <div className="card-body text-center">
                    <h3>{objetoBuscado.name}</h3>
                    <p><strong>ID:</strong> {objetoBuscado.id}</p>
                    {objetoBuscado.data && (
                       <ul className="list-unstyled">
                         {Object.entries(objetoBuscado.data).map(([key, value]) => (
                           <li key={key}><strong>{key}:</strong> {value}</li>
                         ))}
                       </ul>
                    )}
                    <div className="mt-3">
                      <button className="btn btn-warning me-2" 
                      onClick={() => prepararEdicion(objetoBuscado)}>Editar (PUT)</button>
                      <button className="btn btn-danger" 
                      onClick={() => eliminarObjeto(objetoBuscado.id)}>Eliminar (DELETE)</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      
        {vistaActual === 'crear' && (
          <div className="card shadow" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header bg-warning text-dark">
              <h4 className="mb-0">{modoEdicion ? 'Editar Objeto (PUT)' : 'Crear Objeto (POST)'}</h4>
            </div>
            <div className="card-body">
              <form onSubmit={guardarObjeto}>
                <div className="mb-3">
                  <label className="form-label">Nombre del Dispositivo *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Color *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Precio ($) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-warning text-dark fw-bold">
                    {modoEdicion ? 'Actualizar Objeto' : 'Guardar Nuevo Objeto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;