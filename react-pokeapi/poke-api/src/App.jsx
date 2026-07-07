import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [vistaActual, setVistaActual] = useState('inicio'); 

  const [pokemones, setPokemones] = useState([]); 
  
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [exito, setExito] = useState('');

 /**
  * 
  */
  const [busquedaId, setBusquedaId] = useState('');

  const [pokemonBuscado, setPokemonBuscado] = useState(null);

  const [formData, setFormData] = useState({ id: '', name: '', height: '', weight: '' });

  const [modoEdicion, setModoEdicion] = useState(false);

 
  useEffect(() => {
    const cargarPokemonesIniciales = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=12');
        const data = await response.json();
        
        
        const listaDetallada = await Promise.all(
          data.results.map(async (poke) => {
            const res = await fetch(poke.url);
            return res.json();
          })
        );
        
        
        setPokemones(listaDetallada);
      } catch (err) {
        setError('Error al cargar la PokeAPI');
      } finally {
        setLoading(false);
      }
    };

    
    if (pokemones.length === 0) {
      cargarPokemonesIniciales();
    }
  }, []);

  
  useEffect(() => {

    setError('');

    setExito('');

    setPokemonBuscado(null);

  }, [vistaActual]);

  
  const buscarPorId = async (e) => {
    e.preventDefault();
    if (busquedaId.trim() === '') {
      setError('Debes ingresar un ID o Nombre');
      return;
    }

    setError('');
    setExito('');
    
    
    const encontradoLocal = pokemones.find(p => 
      p.id.toString() === busquedaId || p.name.toLowerCase() === busquedaId.toLowerCase()
    );

    if (encontradoLocal) {
      setPokemonBuscado(encontradoLocal);
      return;
    }

   
    setLoading(true);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${busquedaId.toLowerCase()}`);
      if (!response.ok) throw new Error('No se encontró el Pokémon');
      const data = await response.json();
      setPokemonBuscado(data);
    } catch (err) {
      setError(err.message);
      setPokemonBuscado(null);
    } finally {
      setLoading(false);
    }
  };

 
  const guardarPokemon = (e) => {
    e.preventDefault();
    
    
    if (formData.name.trim() === '' || formData.height === '' || formData.weight === '') {
      setError('Todos los datos son obligatorios');
      return;
    }

    setError('');
    setExito('');

    if (modoEdicion) {
      
      const listaActualizada = pokemones.map(p => {
        if (p.id === formData.id) {
          return { ...p, name: formData.name, height: formData.height, weight: formData.weight };
        }
        return p;
      });
      setPokemones(listaActualizada);
      setExito('¡Pokemon actualizado correctamente!');
    } else {
      
      const nuevoId = Math.floor(Math.random() * 1000) + 1000; 
      const nuevoPokemon = {
        id: nuevoId,
        name: formData.name,
        height: formData.height,
        weight: formData.weight,
        sprites: { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png' } 
      };
      
      setPokemones([nuevoPokemon, ...pokemones]); 
      setExito(`¡Nuevo Pokemon creado con el ID: ${nuevoId}!`);
      setFormData({ id: '', name: '', height: '', weight: '' }); 
    }
  };

  
  const eliminarPokemon = (id) => {
    if (!window.confirm('¿Estas seguro de eliminar este Pokemon de la lista?')) return;

  
    const listaFiltrada = pokemones.filter(p => p.id !== id);
    setPokemones(listaFiltrada);
    
    setExito('Pokemon eliminado correctamente.');
    setPokemonBuscado(null);
    setVistaActual('inicio'); 
  };

  const prepararEdicion = (poke) => {
    setFormData({
      id: poke.id,
      name: poke.name,
      height: poke.height,
      weight: poke.weight
    });
    setModoEdicion(true);
    setVistaActual('crear');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger mb-4 shadow">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Pokédex CRUD (React)</span>
          <div className="navbar-nav ms-auto">
            <button className={`nav-link btn text-white ${vistaActual === 'inicio' ? 'fw-bold text-decoration-underline' : ''}`} 
            onClick={() => setVistaActual('inicio')}>Ver Todos</button>
            <button className={`nav-link btn text-white ${vistaActual === 'buscar' ? 'fw-bold text-decoration-underline' : ''}`} 
            onClick={() => setVistaActual('buscar')}>Buscar (ID)</button>
            <button className={`nav-link btn text-white ${vistaActual === 'crear' ? 'fw-bold text-decoration-underline' : ''}`} 
            onClick={() => {
              setVistaActual('crear');
              setModoEdicion(false);
              setFormData({ id: '', name: '', height: '', weight: '' });
            }}>Crear (POST)</button>
          </div>
        </div>
      </nav>

      <div className="container">
        {error && <div className="alert alert-danger shadow-sm">{error}</div>}
        {exito && <div className="alert alert-success shadow-sm">{exito}</div>}
        {loading && <div className="alert alert-info shadow-sm">Conectando con la PokeAPI...</div>}

       
        {vistaActual === 'inicio' && (
          <div className="card shadow">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">Lista de Pokémon (GET)</h4>
            </div>
            <div className="card-body">
              <div className="row">
                {pokemones.map((poke) => (
                  <div className="col-md-3 mb-4" key={poke.id}>
                    <div className="card h-100 text-center border-danger shadow-sm">
                      <div className="card-body">
                        <img src={poke.sprites?.front_default} alt={poke.name} className="img-fluid mb-2" style={{ minHeight: '96px' }}/>
                        <h5 className="card-title text-capitalize fw-bold">
                          {poke.name}</h5>
                        <p className="card-text mb-0"><small>ID: 
                          {poke.id}</small></p>
                        <button className="btn btn-sm btn-outline-danger mt-2 w-100" 
                        onClick={() => eliminarPokemon(poke.id)}
                        >Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        
        {vistaActual === 'buscar' && (
          <div className="card shadow border-danger" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">Buscar Pokémon (GET BY ID)</h4>
            </div>
            <div className="card-body">
              <form onSubmit={buscarPorId} className="mb-4">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="ID o Nombre (Ej: 1 o bulbasaur)" value={busquedaId} 
                  onChange={(e) => setBusquedaId(e.target.value)} />
                  <button type="submit" className="btn btn-danger">Buscar</button>
                </div>
              </form>

              {pokemonBuscado && (
                <div className="card border-danger mt-3 shadow-sm">
                  <div className="card-body text-center">
                    <h2 className="text-capitalize fw-bold">{pokemonBuscado.name}</h2>
                    <img src={pokemonBuscado.sprites?.front_default} alt={pokemonBuscado.name} className="img-fluid my-3" />
                    <p><strong>ID:</strong> {pokemonBuscado.id}</p>
                    <p><strong>Altura:</strong> {pokemonBuscado.height}</p>
                    <p><strong>Peso:</strong> {pokemonBuscado.weight}</p>
                    
                    <div className="mt-3">
                      <button className="btn btn-warning me-2 fw-bold" 
                      onClick={() => prepararEdicion(pokemonBuscado)}>
                        Editar (PUT)</button>
                      <button className="btn btn-dark fw-bold" 
                      onClick={() => eliminarPokemon(pokemonBuscado.id)}>
                        Eliminar (DELETE)</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

       
        {vistaActual === 'crear' && (
          <div className="card shadow border-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">{modoEdicion ? 'Editar Pokémon (PUT)' : 'Crear Pokémon (POST)'}</h4>
            </div>
            <div className="card-body">
              <form onSubmit={guardarPokemon}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nombre *</label>
                  <input type="text" className="form-control" placeholder="Ej: Agumon"
                   value={formData.name} 
                   onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Altura *</label>
                  <input type="number" className="form-control" placeholder="Ej: 5"
                   value={formData.height} 
                   onChange={(e) => setFormData({...formData, height: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Peso *</label>
                  <input type="number" className="form-control" placeholder="Ej: 80"
                   value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-danger fw-bold">
                    {modoEdicion ? 'Guardar Cambios' : 'Registrar Nuevo Pokemon'}
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