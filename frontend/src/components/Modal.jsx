import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-4xl',
}) => {

  // Prevent the page behind the popup from scrolling
  useEffect(() => {
    if (!isOpen) return;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [isOpen]);


  // Close with ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        p-4
        sm:p-6
      "
    >

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-black/70
          backdrop-blur-sm
        "
        onClick={onClose}
      />


      {/* =====================================================
          POPUP
      ====================================================== */}

      <div
        className={`
          relative
          z-10
          w-full
          ${maxWidth}
          max-h-[90vh]
          bg-slate-900
          rounded-2xl
          border
          border-white/10
          shadow-2xl
          overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ===================================================
            POPUP HEADER
        ==================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-4
            bg-slate-900
            border-b
            border-white/10
          "
        >

          <div className="min-w-0">

            <h2
              className="
                text-xl
                font-bold
                text-white
                truncate
              "
            >
              {title}
            </h2>

            <p
              className="
                text-[10px]
                text-slate-500
                uppercase
                tracking-wider
                mt-1
              "
            >
              Future Transformation
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="
              flex
              items-center
              justify-center
              w-9
              h-9
              ml-4
              shrink-0
              rounded-lg
              bg-slate-800
              border
              border-white/10
              text-slate-400
              hover:bg-slate-700
              hover:text-white
              transition
            "
          >
            <X className="w-5 h-5" />
          </button>

        </div>


        {/* ===================================================
            SCROLLABLE POPUP CONTENT
        ==================================================== */}

        <div
          className="
            max-h-[calc(90vh-80px)]
            overflow-y-auto
            overflow-x-auto
            overscroll-contain
          "
          style={{
            scrollbarWidth: 'auto',
          }}
        >

          <div
            className="
              p-5
              sm:p-6
            "
          >

            {children}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Modal;
