import React, {
  useEffect,
  useState,
} from 'react';

import {
  createPortal,
} from 'react-dom';

import {
  X,
} from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const [isVisible, setIsVisible] =
    useState(false);

  // =========================================================
  // OPEN ANIMATION
  // =========================================================

  useEffect(() => {
    if (isOpen) {
      // Small delay allows the initial state to render first,
      // then the zoom animation starts.
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return;
    }

    setIsVisible(false);
  }, [isOpen]);

  // =========================================================
  // ESC KEY
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
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
  }, [isOpen]);

  // =========================================================
  // LOCK BACKGROUND SCROLL
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  // =========================================================
  // CLOSE WITH ANIMATION
  // =========================================================

  const handleClose = () => {
    setIsVisible(false);

    /*
     * Wait for zoom-out animation before
     * calling the parent's onClose.
     */
    setTimeout(() => {
      onClose?.();
    }, 180);
  };

  // =========================================================
  // DON'T RENDER
  // =========================================================

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // MODAL CONTENT
  //
  // createPortal() is important here.
  //
  // It moves the modal directly under <body>,
  // preventing parent containers/layouts from
  // affecting the popup.
  // =========================================================

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 lg:p-8"
      style={{
        position: 'fixed',
        inset: 0,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >

      {/* ===================================================
          BACKDROP
      ==================================================== */}

      <div
        className={`
          absolute
          inset-0
          bg-slate-950/80
          backdrop-blur-[3px]
          transition-opacity
          duration-200
          ease-out
          ${
            isVisible
              ? 'opacity-100'
              : 'opacity-0'
          }
        `}
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            handleClose();
          }
        }}
      />

      {/* ===================================================
          POPUP
      ==================================================== */}

      <div
        className={`
          relative
          z-10
          w-full
          max-w-[1500px]
          max-h-[92vh]
          flex
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-slate-950
          shadow-[0_25px_80px_rgba(0,0,0,0.65)]
          transition-all
          duration-200
          ease-out
          ${
            isVisible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2'
          }
        `}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            px-5
            sm:px-6
            py-4
            shrink-0
            border-b
            border-white/10
            bg-slate-950
          "
        >

          <div className="min-w-0">

            <h2
              id="modal-title"
              className="
                text-base
                sm:text-lg
                font-bold
                text-white
                truncate
              "
            >
              {title}
            </h2>

            <p className="text-[10px] text-slate-500 mt-0.5">
              Future Transformation
            </p>

          </div>

          <button
            type="button"
            onClick={handleClose}
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
              hover:border-white/20
              transition
            "
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* =================================================
            MODAL BODY
        ================================================== */}

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            overflow-x-hidden
          "
        >

          <div
            className="
              w-full
              px-4
              sm:px-6
              lg:px-7
              py-5
            "
          >

            {children}

          </div>

        </div>

      </div>

    </div>
  );

  // =========================================================
  // RENDER DIRECTLY INTO BODY
  // =========================================================

  return createPortal(
    modal,
    document.body
  );
};

export default Modal;
