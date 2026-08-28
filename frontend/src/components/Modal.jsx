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
  // LOCK BACKGROUND PAGE
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);


  // =========================================================
  // ESCAPE KEY
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [isOpen, onClose]);


  // =========================================================
  // CLOSED
  // =========================================================

  if (!isOpen) {
    return null;
  }


  // =========================================================
  // POPUP
  // =========================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
      "
    >

      {/* =====================================================
          BACKGROUND OVERLAY
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-black/70
          backdrop-blur-[2px]
        "
        onClick={onClose}
      />


      {/* =====================================================
          POPUP POSITIONING AREA

          This is fixed to the screen.
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          p-3
          sm:p-5
          lg:p-8
        "
      >

        {/* ===================================================
            POPUP WINDOW

            IMPORTANT:
            max-height prevents it going outside screen.

            overflow-y-auto allows the WHOLE popup content
            to scroll.
        ==================================================== */}

        <div
          className={`
            relative
            ${maxWidth}
            w-full
            max-h-[calc(100vh-24px)]
            sm:max-h-[calc(100vh-40px)]
            lg:max-h-[calc(100vh-64px)]
            overflow-y-auto
            overflow-x-hidden
            rounded-2xl
            border
            border-slate-700
            bg-slate-900
            shadow-[0_25px_100px_rgba(0,0,0,0.75)]
          `}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >

          {/* =================================================
              HEADER
          ================================================== */}

          <div
            className="
              sticky
              top-0
              z-50
              flex
              items-center
              justify-between
              gap-4
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
                  sm:text-xl
                  font-bold
                  text-white
                  truncate
                "
              >
                {title}
              </h2>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Future Transformation
              </p>

            </div>


            {/* CLOSE BUTTON */}

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-white/10
                bg-slate-800
                text-slate-400
                transition
                hover:bg-slate-700
                hover:text-white
              "
              aria-label="Close"
            >

              <X className="h-5 w-5" />

            </button>

          </div>


          {/* =================================================
              FORM CONTENT

              NO flex-1 HERE.

              The popup itself is the scroll container.
        ================================================== */}

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
