import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Search, Users, Database, MapPin, Shield, Share2, Star, AlertTriangle, Cpu, Globe } from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Modern Button Component
export const CyberButton = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses = "relative overflow-hidden font-rajdhani font-semibold tracking-wide transition-all duration-300 ease-out";
  
  const variants = {
    primary: "cyber-btn",
    secondary: "neon-btn",
    outline: "border border-space-cyan text-space-cyan hover:bg-space-cyan hover:text-space-dark",
    ghost: "text-space-white hover:bg-space-cyan/10 hover:text-space-cyan"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Modern Card Component
export const GlassCard = ({ children, className = "", hover = true, ...props }) => {
  return (
    <motion.div
      className={`glass-card ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Modern Icon Component
export const CyberIcon = ({ icon: Icon, size = 24, className = "", ...props }) => {
  return (
    <motion.div
      variants={iconVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      <Icon size={size} />
    </motion.div>
  );
};

// Hero Section Component
export const HeroSection = ({ title, subtitle, description, primaryAction, secondaryAction, children }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-space-gradient">
        <div className="absolute inset-0 bg-radial-glow animate-pulse-slow" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-space-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-space-neon/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="cyber-brand text-4xl md:text-6xl lg:text-7xl mb-6 animate-glow"
          >
            {title}
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-space-silver mb-4 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>
          
          <motion.p
            variants={itemVariants}
            className="text-lg text-space-silver/80 mb-8 max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {primaryAction && (
              <CyberButton variant="primary" size="lg">
                <Rocket className="w-5 h-5 mr-2" />
                {primaryAction}
              </CyberButton>
            )}
            
            {secondaryAction && (
              <CyberButton variant="secondary" size="lg">
                <Search className="w-5 h-5 mr-2" />
                {secondaryAction}
              </CyberButton>
            )}
          </motion.div>
          
          {children}
        </motion.div>
      </div>
    </section>
  );
};

// Stats Section Component
export const StatsSection = ({ stats }) => {
  return (
    <section className="py-20 bg-space-dark/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center"
            >
              <GlassCard className="p-6">
                <CyberIcon 
                  icon={stat.icon} 
                  size={48} 
                  className="text-space-cyan mb-4 mx-auto" 
                />
                <h3 className="text-3xl md:text-4xl font-bold text-space-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-space-silver text-sm md:text-base">
                  {stat.label}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Features Section Component
export const FeaturesSection = ({ features }) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
            Características Principales
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-space-silver max-w-3xl mx-auto">
            Descubre las herramientas avanzadas que hacen de nuestro simulador la mejor opción para la exploración espacial
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <GlassCard className="p-8 text-center h-full">
                <CyberIcon 
                  icon={feature.icon} 
                  size={64} 
                  className="text-space-cyan mb-6 mx-auto" 
                />
                <h3 className="text-2xl font-bold text-space-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-space-silver leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Asteroid Card Component
export const AsteroidCard = ({ asteroid, onSimulate, isAuthenticated }) => {
  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-lg font-semibold text-space-white truncate" title={asteroid.name}>
          {asteroid.name}
        </h4>
        {asteroid.is_potentially_hazardous_asteroid && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="cyber-badge-warning flex items-center gap-1"
          >
            <AlertTriangle size={16} />
            <span className="text-xs font-semibold">PELIGROSO</span>
          </motion.div>
        )}
      </div>
      
      <div className="space-y-3 mb-6 flex-grow">
        <div>
          <span className="text-space-silver text-sm">Diámetro:</span>
          <p className="text-space-white font-semibold">
            {asteroid.calculatedProperties?.averageDiameter 
              ? `${(asteroid.calculatedProperties.averageDiameter / 1000).toFixed(2)} km`
              : 'Desconocido'
            }
          </p>
        </div>
        
        <div>
          <span className="text-space-silver text-sm">Velocidad:</span>
          <p className="text-space-white font-semibold">
            {asteroid.calculatedProperties?.averageVelocity 
              ? `${asteroid.calculatedProperties.averageVelocity.toFixed(2)} km/s`
              : 'Desconocido'
            }
          </p>
        </div>
        
        {asteroid.calculatedProperties?.kineticEnergy && (
          <div>
            <span className="text-space-silver text-sm">Energía Cinética:</span>
            <p className="text-space-white font-semibold">
              {(asteroid.calculatedProperties.kineticEnergy / 1e15).toExponential(2)} PJ
            </p>
          </div>
        )}
      </div>
      
      <CyberButton
        variant={isAuthenticated ? "primary" : "outline"}
        size="sm"
        className="w-full"
        onClick={() => onSimulate(asteroid)}
      >
        {isAuthenticated ? (
          <>
            <Rocket className="w-4 h-4 mr-2" />
            Simular Impacto
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            Registrarse para Simular
          </>
        )}
      </CyberButton>
    </GlassCard>
  );
};

// Featured Asteroids Section
export const FeaturedAsteroidsSection = ({ asteroids, onSimulate, isAuthenticated }) => {
  return (
    <section className="py-20 bg-space-dark/30">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
            Asteroides Destacados
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-space-silver max-w-3xl mx-auto">
            Explora los asteroides más interesantes cerca de la Tierra con datos reales de la NASA
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {asteroids?.map((asteroid, index) => (
            <motion.div
              key={asteroid._id}
              variants={itemVariants}
            >
              <AsteroidCard
                asteroid={asteroid}
                onSimulate={onSimulate}
                isAuthenticated={isAuthenticated}
              />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <CyberButton variant="secondary" size="lg">
            <Globe className="w-5 h-5 mr-2" />
            Ver Todos los Asteroides
          </CyberButton>
        </motion.div>
      </div>
    </section>
  );
};

export default {
  CyberButton,
  GlassCard,
  CyberIcon,
  HeroSection,
  StatsSection,
  FeaturesSection,
  AsteroidCard,
  FeaturedAsteroidsSection
};
