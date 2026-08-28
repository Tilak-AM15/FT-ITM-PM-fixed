import React, {
  useEffect,
} from 'react';

import {
  X,
} from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}) => {

  // =========================================================
  // ESC KEY
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === 'Escape'
      ) {
        onClose?.();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    isOpen,
    onClose,
  ]);

  // =========================================================
  // BODY SCROLL LOCK
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen]);

  // =========================================================
  // DON'T RENDER
  // =========================================================

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // MODAL
  // =========================================================

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >

      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onMouseDown={(event) => {
          /*
           * Close only when the backdrop itself is clicked.
           * Clicking inside modal will not close it.
           */
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose?.();
          }
        }}
      />

      {/* =====================================================
          MODAL CONTAINER
      ====================================================== */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-[1500px]
          max-h-[94vh]
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-slate-950
          shadow-2xl
          shadow-black/60
          flex
          flex-col
        "
      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-white/10 bg-slate-950 shrink-0">

          <div className="min-w-0">

            <h2
              id="modal-title"
              className="text-base sm:text-lg font-bold text-white truncate"
            >
              {title}
            </h2>

            <p className="text-[10px] text-slate-500 mt-0.5">
              Future Transformation
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              shrink-0
              w-9
              h-9
              rounded-lg
              border
              border-white/10
              bg-white/5
              flex
              items-center
              justify-center
              text-slate-400
              hover:text-white
              hover:bg-white/10
              transition
            "
            aria-label="Close modal"
          >

            <X className="w-5 h-5" />

          </button>

        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div className="flex-1 min-h-0 overflow-y-auto">

          <div className="w-full px-5 sm:px-6 lg:px-8 py-5">

            {children}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Modal;
