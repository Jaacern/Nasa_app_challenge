import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import OrbitView from '../components/3D/OrbitView';
import api from '../utils/api';

const OrbitViewer = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hazardFilter, setHazardFilter] = useState('all'); // 'all', 'hazardous', 'nonhazardous'

  const loadAsteroids = async () => {
    try {
      setLoading(true);
      setError('');
      // Pull a reasonable number to keep render light
      const { data } = await api.get('/api/asteroids?limit=99&sortBy=close_approach_data.0.epoch_date_close_approach&sortOrder=asc');
  setAsteroids(data.asteroids || []);
  setSelectedAsteroid((data.asteroids && data.asteroids[0]) || null);
    } catch (e) {
      console.error('Failed to load asteroids', e);
      setError(e?.response?.data?.error || 'Failed to load asteroids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAsteroids();
  }, []);

  // Filtrar asteroides según el filtro de peligrosidad
  const filteredAsteroids = asteroids.filter(a => {
    if (hazardFilter === 'hazardous') return a.is_potentially_hazardous_asteroid;
    if (hazardFilter === 'nonhazardous') return !a.is_potentially_hazardous_asteroid;
    return true;
  });

  return (
    <div className="py-4" style={{
      minHeight: '100vh',
      marginTop: '70px', // Compensa la altura del navbar
      background: 'radial-gradient(ellipse at center, #111 60%, #000 100%)',
      backgroundImage: `url('https://raw.githubusercontent.com/microsoft/Azure-3D-Toolkit/main/docs/assets/stars-bg.png')`,
      backgroundSize: 'cover',
      backgroundRepeat: 'repeat',
      backgroundPosition: 'center',
    }}>
      <Container>
        <Row className="mb-3 align-items-center">
          <Col>
            <h2 className="mb-0">Earth Orbit Viewer</h2>
            <small className="text-muted">Animated orbits derived from close approach data</small>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={loadAsteroids} disabled={loading}>
              {loading ? (
                <><Spinner size="sm" className="me-2" />Refreshing...</>
              ) : (
                <>Refresh</>
              )}
            </Button>
          </Col>
        </Row>

        {/* Filtro de peligrosidad */}
        {asteroids.length > 0 && (
          <Row className="mb-3">
            <Col md={3}>
              <label htmlFor="hazard-filter" className="form-label">Filtrar por peligrosidad:</label>
              <select
                id="hazard-filter"
                className="form-select"
                value={hazardFilter}
                onChange={e => {
                  setHazardFilter(e.target.value);
                  setSelectedAsteroid(null); // Reinicia selección al cambiar filtro
                }}
              >
                <option value="all">Todos</option>
                <option value="hazardous">Peligrosos</option>
                <option value="nonhazardous">No peligrosos</option>
              </select>
            </Col>
            <Col md={5}>
              <label htmlFor="asteroid-select" className="form-label">Selecciona un asteroide:</label>
              <select
                id="asteroid-select"
                className="form-select"
                value={selectedAsteroid ? selectedAsteroid._id : 'all'}
                onChange={e => {
                  if (e.target.value === 'all') {
                    setSelectedAsteroid(null);
                  } else {
                    const found = filteredAsteroids.find(a => String(a._id) === e.target.value);
                    setSelectedAsteroid(found || null);
                  }
                }}
              >
                <option value="all">Todos</option>
                {filteredAsteroids.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.name || a.neo_reference_id || a._id}
                  </option>
                ))}
              </select>
            </Col>
          </Row>
        )}

        <Card className="mb-3">
          <Card.Body>
            {error && (
              <div className="alert alert-warning py-2 mb-3">{error}</div>
            )}
            <OrbitView asteroids={selectedAsteroid ? [selectedAsteroid] : filteredAsteroids} />
          </Card.Body>
        </Card>

        {selectedAsteroid && (
          <div className="mt-4 p-3 rounded" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', maxWidth: 400 }}>
            <h5 style={{ color: '#00d4ff' }}>{selectedAsteroid.name || selectedAsteroid.neo_reference_id || selectedAsteroid._id}</h5>
            <div><strong>Diámetro:</strong> {
              Number.isFinite(Number(selectedAsteroid.estimated_diameter?.meters?.estimated_diameter_max))
                ? Number(selectedAsteroid.estimated_diameter.meters.estimated_diameter_max).toFixed(2)
                : selectedAsteroid.estimated_diameter?.meters?.estimated_diameter_max || 'N/A'
            } m</div>
            <div><strong>Velocidad:</strong> {
              Number.isFinite(Number(selectedAsteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second))
                ? Number(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)
                : selectedAsteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 'N/A'
            } km/s</div>
            <div><strong>Fecha de acercamiento:</strong> {selectedAsteroid.close_approach_data?.[0]?.close_approach_date || 'N/A'}</div>
            <div><strong>Peligroso:</strong> {selectedAsteroid.is_potentially_hazardous_asteroid ? 'Sí' : 'No'}</div>
          </div>
        )}

        <div className="text-muted" style={{ fontSize: 12 }}>
          Note: Orbits are simplified for visualization and do not represent exact trajectories.
        </div>
      </Container>
    </div>
  );
};

export default OrbitViewer;


