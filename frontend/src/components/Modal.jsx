import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const [visible, setVisible] = useState(false);

  // ---------------------------------------------------------
  // OPEN / CLOSE ANIMATION
  // ---------------------------------------------------------

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // ---------------------------------------------------------
  // ESC KEY
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
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

  // ---------------------------------------------------------
  // PREVENT BACKGROUND PAGE SCROLL
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  // ---------------------------------------------------------
  // CLOSE
  // ---------------------------------------------------------

  const closeModal = () => {
    setVisible(false);

    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 180);
  };

  if (!isOpen) {
    return null;
  }

  // ---------------------------------------------------------
  // MODAL
  // ---------------------------------------------------------

  const modalContent = (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        p-3
        sm:p-5
        lg:p-8
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="pmtrack-modal-title"
    >

      {/* ===================================================
          FULL SCREEN BACKDROP
          This blurs EVERYTHING behind the modal.
      =================================================== */}

      <div
        className={`
          absolute
          inset-0
          bg-slate-950/70
          backdrop-blur-md
          transition-opacity
          duration-200
          ${
            visible
              ? 'opacity-100'
              : 'opacity-0'
          }
        `}
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            closeModal();
          }
        }}
      />

      {/* ===================================================
          CENTERED MODAL
      =================================================== */}

      <div
        className={`
          relative
          z-10
          flex
          w-full
          max-w-[1500px]
          max-h-[92vh]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-slate-950
          shadow-[0_30px_100px_rgba(0,0,0,0.70)]
          transition-all
          duration-200
          ease-out
          ${
            visible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2'
          }
        `}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

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
            sm:px-6
          "
        >

          <div className="min-w-0">

            <h2
              id="pmtrack-modal-title"
              className="
                truncate
                text-base
                font-bold
                text-white
                sm:text-lg
              "
            >
              {title}
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Future Transformation • PMTrack
            </p>

          </div>

          <button
            type="button"
            onClick={closeModal}
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
              bg-white/5
              text-slate-400
              transition
              hover:border-white/20
              hover:bg-white/10
              hover:text-white
            "
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
          "
        >

          <div
            className="
              w-full
              px-4
              py-5
              sm:px-6
              lg:px-8
            "
          >
            {children}
          </div>

        </div>

      </div>

    </div>
  );

  // =========================================================
  // RENDER DIRECTLY UNDER BODY
  // =========================================================

  return createPortal(
    modalContent,
    document.body
  );
};

export default Modal;
