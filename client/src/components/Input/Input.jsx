import React from 'react'

function Input({ 
  label = '', 
  name = '', 
  type = 'text', 
  className = '', 
  error = '', 
  disabled = false, 
  ...props 
}, ref) {
  return (
    <div className='w-full'>
      {label && <label htmlFor={name} className="inline-block mb-1 pl-1 text-gray-300">{label}</label>}
      <input id={name} ref={ref} name={name} type={type} disabled={disabled} className={`bg-indigo-100 py-2 px-3 w-full border border-gray-300 rounded-md  text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-indigo-300 transition ${className}`} {...props}/>
      {error && (
        <span className="text-red-500 text-sm mt-1 block">
          {error}
        </span>
      )}
    </div>
  )
}

export default React.forwardRef(Input)

