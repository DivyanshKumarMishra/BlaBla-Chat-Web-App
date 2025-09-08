import React from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/20/solid';

function Avatar(
  {
    image = '',
    text = '',
    textSize = 'text-3xl md:text-4xl',
    className = 'size-36',
    showIcons = true,
    hovered = false,
    fileDisabled = false,
    useImageFit = false,
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    fileInputRef = null,
    handleFileChange = () => {},
    handleFileClick = () => {},
    handleDelete = () => {},
  },
  ref
) {
  // console.log(`image: ${image} | text: ${text} | color: ${color} | hovered: ${hovered}`);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {image ? (
        <img
          ref={ref}
          alt=""
          src={image}
          className={`rounded-full object-cover ${className}`}
          style={{width: useImageFit ? 'fit-content' : ''}}
        />
      ) : (
        <span
          className={`inline-flex items-center justify-center rounded-full border-2 border-primary transition-all duration-300 ${className}`}
        >
          <span className={`uppercase ${textSize} font-semibold text-primary`}>{text}</span>
        </span>
      )}
      {showIcons && hovered && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 rounded-full overflow-hidden">
          <button
            onClick={handleFileClick}
            className="flex items-center justify-center size-10 md:size-12 bg-white text-primary rounded-full hover:bg-gray-100 transition"
          >
            <PlusIcon className="h-6 w-6 md:h-8 md:w-8" />
          </button>
          {image && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center size-10 md:size-12 bg-white text-primary rounded-full hover:bg-gray-100 transition"
            >
              <TrashIcon className="h-6 w-6 md:h-8 md:w-8" />
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
        accept=".jpeg, .jpg, .png, .webp, .svg"
      />
    </div>
  );
}

export default React.forwardRef(Avatar);
