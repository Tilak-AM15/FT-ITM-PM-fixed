import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

    const originalBodyOverflow =
      document.body.style.overflow;

    const originalHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        originalBodyOverflow;

      document.documentElement.style.overflow =
        originalHtmlOverflow;
    };
  }, [isOpen]);


  // =========================================================
  // ESCAPE KEY
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
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
  }, [isOpen, onClose]);


  // =========================================================
  // CLOSED
  // =========================================================

  if (!isOpen) {
    return null;
  }


  // =========================================================
  // MODAL
  // =========================================================

  const modal = (
    <div
      className="
        fixed
        inset-0
        z-[99999]
      "
    >

      {/* =====================================================
          BACKDROP

          IMPORTANT:
          NO backdrop-blur here.

          This prevents the form from becoming visually blurry.
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          z-0
          bg-slate-950/75
        "
        onClick={() => onClose?.()}
      />


      {/* =====================================================
          CENTERING LAYER

          This layer is above the backdrop.
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          z-10
          flex
          items-center
          justify-center
          p-3
          sm:p-5
          lg:p-8
        "
      >

        {/* ===================================================
            ACTUAL MODAL

            Completely opaque.
            NOT blurred.
        ==================================================== */}

        <div
          className={`
            relative
            flex
            w-full
            ${maxWidth}
            max-h-[calc(100vh-24px)]
            sm:max-h-[calc(100vh-40px)]
            lg:max-h-[calc(100vh-64px)]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-slate-700/70
            bg-slate-950
            opacity-100
            shadow-[0_25px_80px_rgba(0,0,0,0.75)]
          `}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >

          {/* =================================================
              HEADER

              FIXED
          ================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              gap-4
              border-b
              border-white/10
              bg-slate-950
              px-5
              py-4
            "
          >

            <div className="min-w-0">

              <h2
                className="
                  truncate
                  text-lg
                  font-bold
                  text-white
                "
              >
                {title}
              </h2>

              <p
                className="
                  mt-1
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Future Transformation
              </p>

            </div>


            {/* CLOSE */}

            <button
              type="button"
              onClick={() => onClose?.()}
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
                bg-slate-900
                text-slate-400
                transition
                hover:border-white/20
                hover:bg-slate-800
                hover:text-white
              "
              aria-label="Close"
            >

              <X className="h-5 w-5" />

            </button>

          </div>


          {/* =================================================
              SCROLLABLE CONTENT

              THIS IS THE ONLY MAIN MODAL SCROLL AREA.
          ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overflow-x-hidden
              overscroll-contain
              bg-slate-950
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

    </div>
  );


  // =========================================================
  // PORTAL
  // =========================================================

  return createPortal(
    modal,
    document.body
  );
};


export default Modal;
