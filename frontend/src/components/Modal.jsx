import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
}) => {

  // =========================================================
  // LOCK BACKGROUND SCROLL
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    const originalPaddingRight =
      document.body.style.paddingRight;

    // Prevent the page behind the modal from scrolling
    document.body.style.overflow = 'hidden';

    // Prevent layout jump when scrollbar disappears
    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow =
        originalOverflow;

      document.body.style.paddingRight =
        originalPaddingRight;
    };
  }, [isOpen]);


  // =========================================================
  // ESC KEY
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
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
  // DON'T RENDER WHEN CLOSED
  // =========================================================

  if (!isOpen) {
    return null;
  }


  // =========================================================
  // MODAL WIDTH
  // =========================================================

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-[calc(100vw-32px)]',
  };


  // =========================================================
  // MODAL
  // =========================================================

  const modal = (

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
      aria-labelledby="modal-title"
    >

      {/* =====================================================
          BACKDROP

          Everything behind this becomes blurred.
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-slate-950/65
          backdrop-blur-md
        "
        onMouseDown={(event) => {

          // Close only when clicking the backdrop itself.
          // Clicking inside the modal will NOT close it.

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

          max-h-[92vh]
          = modal never becomes taller than screen

          overflow-hidden
          = scrolling happens ONLY inside body

          flex flex-col
          = header / body / footer structure
      ====================================================== */}

      <div
        className={`
          relative
          z-10
          flex
          w-full
          ${widthClasses[size] || widthClasses.lg}
          max-h-[92vh]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-slate-950
          shadow-[0_30px_100px_rgba(0,0,0,0.65)]
        `}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >


        {/* ===================================================
            HEADER

            Header doesn't scroll.
        ==================================================== */}

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
              id="modal-title"
              className="
                truncate
                text-lg
                font-bold
                text-white
                sm:text-xl
              "
            >
              {title}
            </h2>

            <div
              className="
                mt-0.5
                text-[10px]
                font-medium
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Future Transformation
            </div>

          </div>


          {/* Close */}

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
              bg-white/5
              text-slate-400
              transition
              duration-150
              hover:border-white/20
              hover:bg-white/10
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500/50
            "
            aria-label="Close modal"
          >

            <X
              className="
                h-5
                w-5
              "
            />

          </button>

        </div>


        {/* ===================================================
            SCROLLABLE CONTENT

            THIS IS THE IMPORTANT PART.

            If Create Task has:
              5 tasks
              10 tasks
              20 tasks
              50 tasks

            this section scrolls while the modal itself
            remains centered.
        ==================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-auto
            overscroll-contain
          "
          style={{
            scrollbarWidth: 'thin',
          }}
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


  // =========================================================
  // PORTAL
  //
  // Rendering directly under <body> prevents:
  //
  // Sidebar positioning
  // parent overflow
  // transform
  // z-index
  // max-width
  //
  // from affecting the modal.
  // =========================================================

  return createPortal(
    modal,
    document.body
  );
};


export default Modal;
