import React from 'react'

function Logo({className = '', ...props}) {
  return (
    <h3 className={`poppins-bold text-primary ${className}`}>
      BlaBla
    </h3>
  )
}

export default Logo
