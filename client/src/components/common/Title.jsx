import React from 'react'

function Title({text = '', className = '', ...props}) {
  return (
    <h6 className={`uppercase tracking-widest text-white text-sm font-light pl-4 ${className}`} {...props}>
      {text}
    </h6>
  )
}

export default Title
