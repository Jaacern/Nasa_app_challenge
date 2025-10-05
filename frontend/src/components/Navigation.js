import React from 'react';
import { Navbar, Nav, Container, Dropdown, Badge, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toggleLanguage, isSpanish } = useLanguage();
  const { t } = useTranslation();

  return (
    <Navbar expand="lg" variant="dark" fixed="top" className="navbar-custom">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="d-flex align-items-center">
            <img 
              src="/logo.png" 
              alt="Zuricatas Logo" 
              style={{ height: '60px', width: 'auto', marginRight: '15px' }}
              className="d-none d-sm-block"
            />
            <img 
              src="/logo.png" 
              alt="Zuricatas Logo" 
              style={{ height: '40px', width: 'auto', marginRight: '10px' }}
              className="d-block d-sm-none"
            />
            <span className="brand-text">Zuricatas</span>
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/asteroids">
              <Nav.Link>
                <i className="bi bi-search me-1"></i>
                {t('exploreAsteroids')}
              </Nav.Link>
            </LinkContainer>
            
            {/* Temporarily disabled simulator link */}
            {/*
            {isAuthenticated && (
              <LinkContainer to="/simulator">
                <Nav.Link>
                  <i className="bi bi-geo-alt me-1"></i>
                  Simulator
                </Nav.Link>
              </LinkContainer>
            )}
            */}
            
            <LinkContainer to="/community">
              <Nav.Link>
                <i className="bi bi-people me-1"></i>
                {t('community')}
              </Nav.Link>
            </LinkContainer>
            
              {/* Leaderboard eliminado */}
            
            <LinkContainer to="/orbits">
              <Nav.Link>
                <i className="bi bi-globe me-1"></i>
                {t('orbits')}
                <Badge bg="info" className="ms-1">3D</Badge>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/3d-test">
              <Nav.Link>
                <i className="bi bi-cpu me-1"></i>
                3D Test
                <Badge bg="success" className="ms-1">NEW</Badge>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/vr">
              <Nav.Link>
                <i className="bi bi-vr me-1"></i>
                {t('vrExperience')}
                <Badge bg="warning" className="ms-1">VR</Badge>
              </Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            {/* Language Toggle Button */}
            <Button
              variant="outline-light"
              size="sm"
              onClick={toggleLanguage}
              className="me-2 language-toggle"
              title={isSpanish ? "Switch to English" : "Cambiar a Español"}
            >
              <i className={`bi ${isSpanish ? 'bi-translate' : 'bi-translate'} d-none d-sm-inline`}></i>
              <span className="d-inline d-sm-none">{isSpanish ? 'EN' : 'ES'}</span>
              <span className="d-none d-sm-inline">{isSpanish ? 'English' : 'Español'}</span>
            </Button>
            
            {isAuthenticated ? (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link>
                    <i className="bi bi-speedometer2 me-1"></i>
                    {t('dashboard')}
                  </Nav.Link>
                </LinkContainer>
                
                <Dropdown align="end">
                  <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center">
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.username}
                    {user?.stats?.points > 0 && (
                      <Badge bg="primary" className="ms-2">
                        {user.stats.points}
                      </Badge>
                    )}
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu className="dropdown-menu-dark">
                    <LinkContainer to="/profile">
                      <Dropdown.Item>
                        <i className="bi bi-person me-2"></i>
                        {t('profile')}
                      </Dropdown.Item>
                    </LinkContainer>
                    
                    <Dropdown.Divider />
                    
                    <Dropdown.Item onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      {t('logout')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    {t('login')}
                  </Nav.Link>
                </LinkContainer>
                
                <LinkContainer to="/register">
                  <Nav.Link>
                    <i className="bi bi-person-plus me-1"></i>
                    {t('register')}
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
