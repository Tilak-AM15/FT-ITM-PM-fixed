import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-4xl',
}) => {

  // =========================================================
  // LOCK BACKGROUND SCROLL
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);


  // =========================================================
  // ESC KEY
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [isOpen, onClose]);


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
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        p-4
      "
    >

      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-black/70
        "
        onClick={onClose}
      />


      {/* =====================================================
          MODAL BOX
      ====================================================== */}

      <div
        className={`
          relative
          z-10
          ${maxWidth}
          w-full
          max-h-[90vh]
          rounded-2xl
          bg-slate-900
          border
          border-white/10
          shadow-2xl
          flex
          flex-col
          overflow-hidden
        `}
      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            shrink-0
            px-5
            py-4
            border-b
            border-white/10
            bg-slate-900
          "
        >

          <div className="min-w-0">

            <h2
              className="
                text-lg
                font-bold
                text-white
                truncate
              "
            >
              {title}
            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="
              ml-4
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-white/10
              bg-white/5
              text-slate-400
              hover:bg-white/10
              hover:text-white
              transition
            "
            aria-label="Close"
          >

            <X className="w-5 h-5" />

          </button>

        </div>


        {/* ===================================================
            SCROLLABLE BODY
        ==================================================== */}

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            overflow-x-hidden
            bg-slate-900
          "
        >

          <div
            className="
              w-full
              px-4
              py-5
              sm:px-6
              lg:px-7
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
