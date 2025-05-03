import React from 'react'

const ColorPicker = ({ label = 'Pick a color:', value = '#ff0000', required = false, onChange = () => {}, ...props }) => {
  return (
    <div className="flex flex-row gap-2">
      <label htmlFor='color' className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="color"
        id='color'
        value={value}
        onChange={onChange}
        {...props}
        required={required}
        className="w-6 h-6 p-0 border-0 cursor-pointer"
      />
    </div>
  )
}

export default ColorPicker
