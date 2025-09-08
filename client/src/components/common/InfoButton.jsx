import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function InfoButton({ text }) {
  const [show, setShow] = useState(false);

  const renderText = () => {
    if (Array.isArray(text)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {text.map((item, index) => (
            <li key={index} className="text-xs text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-xs text-gray-700">{text}</p>;
  };

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-gray-800 hover:text-black focus:outline-none"
      >
        <InformationCircleIcon className="h-4 w-4" />
      </button>
      {show && (
        <div className="absolute left-6 top-0 z-10 w-72 bg-white border border-gray-300 rounded-lg shadow-lg px-2 py-2">
          {renderText()}
        </div>
      )}
    </div>
  );
}
