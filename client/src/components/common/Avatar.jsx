import React from 'react'
import { TrashIcon, PlusIcon } from '@heroicons/react/20/solid'


function Avatar({image = '', text = '', color = '', textSize = 'text-3xl md:text-4xl', className = 'size-36', showIcons = true, hovered = false, fileDisabled = false, onMouseEnter = () => {}, onMouseLeave = () => {}, fileInputRef = null, handleFileChange = () => {}, handleFileClick = () => {}, handleDelete = () => {} }, ref) {
  // console.log(`image: ${image} | text: ${text} | color: ${color} | hovered: ${hovered}`);   
  return (
    <div className="relative inline-block"
      onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {image ? (
        <img
          ref={ref}
          alt=""
          src={image}
          className={`rounded-full object-cover ${className} `}
        />
      ) : (
        <span
          className={`inline-flex items-center justify-center rounded-full border-2 transition-all duration-300 ${className}`}
          style={{ 
            backgroundColor: `${color}33`, // 33 is roughly 20% opacity
            borderColor: color, 
            boxShadow: `0 0 5px ${color}` 
          }}
        >
          <span
            className={`uppercase ${textSize} font-semibold`}
            style={{
              color: color,
              textShadow: `1px 1px 2px ${color}`,
            }}
          >
            {text}
          </span>
        </span>
      )}
      {showIcons && hovered && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 rounded-full overflow-hidden">
          <button onClick={handleFileClick} className="flex items-center justify-center size-10 md:size-12 bg-white text-primary rounded-full hover:bg-gray-100 transition">
            <PlusIcon className="h-6 w-6 md:h-8 md:w-8"/>
          </button>
          {image && (
            <button onClick={handleDelete} className="flex items-center justify-center size-10 md:size-12 bg-white text-primary rounded-full hover:bg-gray-100 transition">
              <TrashIcon className="h-6 w-6 md:h-8 md:w-8"/>
            </button>
          )}
        </div>
      )}
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        disabled={fileDisabled}
        onChange={handleFileChange}
        accept='.jpeg, .jpg, .png, .webp, .svg'
      />
    </div>
  )
}

export default React.forwardRef(Avatar)