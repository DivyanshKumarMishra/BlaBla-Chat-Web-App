import React from 'react';

function Logo({
  className = '',
  label = 'BlaBla',
  textColor = 'text-primary',
  ...props
}) {
  return <h3 className={`poppins-bold ${textColor} ${className}`}>{label}</h3>;
}

export default Logo;
