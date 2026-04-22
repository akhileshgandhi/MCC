import React from 'react';
import '../CustomCss/Loader.css';
import { LoaderProps } from '../types/LoaderProps';

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  color = '#004C8E', 
  text,
  fullScreen = false,
  logo = require('../CustomAssets/MCCLogoPhotoroom.png')
}) => {
  const sizeClasses = {
    small: 'loader-small',
    medium: 'loader-medium',
    large: 'loader-large'
  };

  const containerClass = fullScreen 
    ? 'loader-container-fullscreen' 
    : 'loader-container';

  return (
    <div className={containerClass}>
      <div className="loader-wrapper">
        {logo ? (
          <div className="loader-logo-container">
            <div 
              className={`loader-circle ${sizeClasses[size]}`}
              style={{ borderColor: `${color}20`, borderTopColor: color }}
            />
            <img src={logo} alt="Logo" className="loader-logo" />
          </div>
        ) : (
          <div 
            className={`loader ${sizeClasses[size]}`}
            style={{ borderColor: `${color}20`, borderTopColor: color }}
          />
        )}
        {text && <p className="loader-text">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;
