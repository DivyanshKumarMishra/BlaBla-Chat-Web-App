import React from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

function Drawer({
  open = false,
  setOpen = () => {},
  side = 'right', // 'left' | 'right' | 'top' | 'bottom'
  title = '',
  background = 'bg-white',
  width,  // e.g., 'w-[500px] max-w-[90vw]'
  height, // e.g., 'h-[300px] max-h-[50vh]'
  children,
}) {
  const positionClasses = {
    right: 'inset-y-0 right-0 pl-10',
    left: 'inset-y-0 left-0 pr-10',
    top: 'inset-x-0 top-0 pb-10',
    bottom: 'right-0 bottom-0 pt-10',
  };

  const transformClasses = {
    right: 'data-[closed]:translate-x-full',
    left: 'data-[closed]:-translate-x-full',
    top: 'data-[closed]:-translate-y-full',
    bottom: 'data-[closed]:translate-y-full',
  };

  const sizeClasses = `${width ?? ''} ${height ?? ''}`;

  const flexDirection = side === 'top' || side === 'bottom' ? 'flex-col' : 'flex';

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <div className="fixed inset-0" aria-hidden="true" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`pointer-events-none fixed ${positionClasses[side]} ${flexDirection}`}>
            <DialogPanel
              transition
              className={`pointer-events-auto transform transition duration-500 ease-in-out sm:duration-700 shadow-xl ${transformClasses[side]} ${sizeClasses} ${background}`}
            >
              <div className="flex h-full flex-col overflow-y-auto py-3">
                <div className="relative px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    {title && <DialogTitle className="text-base font-semibold text-gray-900">{title}</DialogTitle>}
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="absolute top-0 right-0 mr-4 p-1 rounded-full bg-white text-primary hover:text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="size-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative mt-3 flex-1 px-4 sm:px-6">{children}</div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default Drawer