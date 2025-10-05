import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { useTranslation } from '../hooks/useTranslation';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { fetchFeaturedAsteroids, getAsteroidStats, getSimulationStats } = useSimulation();
  const { t } = useTranslation();
  const [featuredAsteroids, setFeaturedAsteroids] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [asteroids, asteroidStats, simulationStats] = await Promise.all([
        fetchFeaturedAsteroids(6),
        getAsteroidStats(),
        getSimulationStats()
      ]);
      
      setFeaturedAsteroids(asteroids);
      setStats({ ...asteroidStats, ...simulationStats });
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section py-5 mt-5">
        <Container>
          <div className="fade-in-animation">
            <Row className="align-items-center min-vh-100">
              <Col lg={6} className="order-2 order-lg-1">
                <h1 className="display-4 fw-bold mb-4 text-glow">
                  {t('zuricatasSimulator')}
                </h1>
                <p className="lead mb-4 text-secondary">
                  {t('exploreAsteroidImpact')}
                </p>
                <p className="mb-4">
                  {t('builtForNasa')}
                </p>
                <div className="d-flex gap-3 flex-wrap justify-content-center justify-content-lg-start">
                  {isAuthenticated ? (
                    <LinkContainer to="/simulator">
                      <Button variant="primary" size="lg" className="hover-scale">
                        <i className="bi bi-rocket-takeoff me-2"></i>
                        {t('startSimulation')}
                      </Button>
                    </LinkContainer>
                  ) : (
                    <LinkContainer to="/register">
                      <Button variant="primary" size="lg" className="hover-scale">
                        <i className="bi bi-person-plus me-2"></i>
                        {t('getStarted')}
                      </Button>
                    </LinkContainer>
                  )}
                  
                  <LinkContainer to="/asteroids">
                    <Button variant="outline-primary" size="lg" className="hover-scale">
                      <i className="bi bi-search me-2"></i>
                      {t('exploreAsteroids')}
                    </Button>
                  </LinkContainer>
                </div>
              </Col>
              
              <Col lg={6} className="order-1 order-lg-2 text-center">
                <div className="hero-animation">
                  <div className="planet-earth">
                    <div className="asteroid-approaching"></div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* Statistics Section */}
      <section className="stats-section py-5 bg-dark">
        <Container>
          <div className="slide-in-animation">
            <Row className="text-center">
              <Col xs={6} md={3} className="mb-4">
                <Card className="glass-effect h-100">
                  <Card.Body className="p-3 p-md-4">
                    <i className="bi bi-asterisk display-4 text-primary mb-2 mb-md-3"></i>
                    <h3 className="fw-bold h4">{stats.totalAsteroids || 0}</h3>
                    <p className="text-muted small">{t('asteroidsTracked')}</p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={6} md={3} className="mb-4">
                <Card className="glass-effect h-100">
                  <Card.Body className="p-3 p-md-4">
                    <i className="bi bi-exclamation-triangle display-4 text-warning mb-2 mb-md-3"></i>
                    <h3 className="fw-bold h4">{stats.hazardousAsteroids || 0}</h3>
                    <p className="text-muted small">{t('potentiallyHazardous')}</p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={6} md={3} className="mb-4">
                <Card className="glass-effect h-100">
                  <Card.Body className="p-3 p-md-4">
                    <i className="bi bi-cpu display-4 text-success mb-2 mb-md-3"></i>
                    <h3 className="fw-bold h4">{stats.totalSimulations || 0}</h3>
                    <p className="text-muted small">{t('simulationsRun')}</p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={6} md={3} className="mb-4">
                <Card className="glass-effect h-100">
                  <Card.Body className="p-3 p-md-4">
                    <i className="bi bi-people display-4 text-info mb-2 mb-md-3"></i>
                    <h3 className="fw-bold h4">{stats.publicSimulations || 0}</h3>
                    <p className="text-muted small">{t('communityShares')}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* Featured Asteroids Section */}
      <section className="featured-section py-5">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center mb-5">{t('featuredNearEarthAsteroids')}</h2>
              <Row>
                {featuredAsteroids?.map((asteroid, index) => (
                  <Col xs={12} sm={6} lg={4} key={asteroid._id} className="mb-4">
                    <Card className="h-100 hover-scale">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 text-truncate" title={asteroid.name}>
                          {asteroid.name}
                        </h6>
                        {asteroid.is_potentially_hazardous_asteroid && (
                          <Badge bg="warning" text="dark">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            {t('hazardous')}
                          </Badge>
                        )}
                      </Card.Header>
                      
                      <Card.Body>
                        <div className="mb-3">
                          <small className="text-muted">{t('diameter')}</small>
                          <div className="fw-bold">
                            {asteroid.calculatedProperties?.averageDiameter 
                              ? `${(asteroid.calculatedProperties.averageDiameter / 1000).toFixed(2)} km`
                              : t('unknown')
                            }
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted">{t('velocity')}</small>
                          <div className="fw-bold">
                            {asteroid.calculatedProperties?.averageVelocity 
                              ? `${asteroid.calculatedProperties.averageVelocity.toFixed(2)} km/s`
                              : t('unknown')
                            }
                          </div>
                        </div>
                        
                        {asteroid.calculatedProperties?.kineticEnergy && (
                          <div className="mb-3">
                            <small className="text-muted">{t('kineticEnergy')}</small>
                            <div className="fw-bold">
                              {(asteroid.calculatedProperties.kineticEnergy / 1e15).toExponential(2)} PJ
                            </div>
                          </div>
                        )}
                      </Card.Body>
                      
                      <Card.Footer>
                        {isAuthenticated ? (
                          <LinkContainer to={{
                            pathname: '/simulator',
                            search: `?asteroid=${asteroid._id}`
                          }}>
                            <Button variant="primary" size="sm" className="w-100">
                              <i className="bi bi-play-circle me-1"></i>
                              {t('simulateImpact')}
                            </Button>
                          </LinkContainer>
                        ) : (
                          <LinkContainer to="/register">
                            <Button variant="outline-primary" size="sm" className="w-100">
                              <i className="bi bi-person-plus me-1"></i>
                              {t('registerToSimulate')}
                            </Button>
                          </LinkContainer>
                        )}
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              <div className="text-center mt-4">
                <LinkContainer to="/asteroids">
                  <Button variant="outline-primary">
                    <i className="bi bi-arrow-right me-2"></i>
                    {t('viewAllAsteroids')}
                  </Button>
                </LinkContainer>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5 bg-dark">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center mb-5">{t('keyFeatures')}</h2>
              <Row>
                <Col xs={12} sm={6} lg={3} className="mb-4">
                  <Card className="glass-effect h-100 text-center">
                    <Card.Body className="p-3 p-md-4">
                      <i className="bi bi-database display-4 text-primary mb-2 mb-md-3"></i>
                      <h5>{t('realNasaData')}</h5>
                      <p className="text-muted small">
                        {t('realNasaDataDesc')}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={12} sm={6} lg={3} className="mb-4">
                  <Card className="glass-effect h-100 text-center">
                    <Card.Body className="p-3 p-md-4">
                      <i className="bi bi-geo-alt display-4 text-success mb-2 mb-md-3"></i>
                      <h5>{t('interactiveMaps')}</h5>
                      <p className="text-muted small">
                        {t('interactiveMapsDesc')}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={12} sm={6} lg={3} className="mb-4">
                  <Card className="glass-effect h-100 text-center">
                    <Card.Body className="p-3 p-md-4">
                      <i className="bi bi-shield-check display-4 text-warning mb-2 mb-md-3"></i>
                      <h5>{t('mitigationPlanning')}</h5>
                      <p className="text-muted small">
                        {t('mitigationPlanningDesc')}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={12} sm={6} lg={3} className="mb-4">
                  <Card className="glass-effect h-100 text-center">
                    <Card.Body className="p-3 p-md-4">
                      <i className="bi bi-people display-4 text-info mb-2 mb-md-3"></i>
                      <h5>{t('communitySharing')}</h5>
                      <p className="text-muted small">
                        {t('communitySharingDesc')}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
