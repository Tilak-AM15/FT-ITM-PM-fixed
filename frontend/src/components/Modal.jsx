import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-4xl',
  size,
}) => {
  // =========================================================
  // LOCK BACKGROUND SCROLL WHEN MODAL IS OPEN
  // =========================================================
  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousHtmlOverflow = html.style.overflow;

    // Prevent the page behind the modal from scrolling.
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    // Prevent layout shift caused by disappearing scrollbar.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      html.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  // =========================================================
  // ESCAPE KEY
  // =========================================================
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // =========================================================
  // DON'T RENDER WHEN CLOSED
  // =========================================================
  if (!isOpen) {
    return null;
  }

  // =========================================================
  // WIDTH SUPPORT
  //
  // ProjectList uses:
  // maxWidth="max-w-2xl"
  //
  // This also supports:
  // size="sm"
  // size="md"
  // size="lg"
  // size="xl"
  // size="2xl"
  // =========================================================
  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-[calc(100vw-24px)]',
  };

  const resolvedWidth = size
    ? sizeMap[size] || size
    : maxWidth;

  // =========================================================
  // MODAL
  // =========================================================
  const modalContent = (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        p-2
        sm:p-4
        lg:p-6
      "
    >
      {/* =====================================================
          BACKDROP
      ====================================================== */}
      <div
        className="
          absolute
          inset-0
          bg-slate-950/75
          backdrop-blur-sm
        "
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose?.();
          }
        }}
      />

      {/* =====================================================
          MODAL CONTAINER

          IMPORTANT:
          min-h-0 + max-h + flex-col allows children such as
          the TaskList table to scroll correctly.
      ====================================================== */}
      <div
        className={`
          relative
          z-10
          flex
          w-full
          ${resolvedWidth}
          max-h-[calc(100vh-16px)]
          sm:max-h-[calc(100vh-32px)]
          lg:max-h-[calc(100vh-48px)]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-slate-950
          shadow-2xl
          shadow-black/50
        `}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* ===================================================
            HEADER
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
            px-4
            py-3
            sm:px-5
            sm:py-4
          "
        >
          {/* TITLE */}
          <div className="min-w-0 flex-1">
            <h2
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
          </div>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => onClose?.()}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-white/10
              bg-white/5
              text-slate-400
              transition-all
              duration-150
              hover:border-white/20
              hover:bg-white/10
              hover:text-white
              focus:outline-none
              focus:ring-1
              focus:ring-indigo-500/50
            "
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ===================================================
            MODAL BODY

            IMPORTANT:
            - min-h-0 is required for flex scrolling.
            - overflow-y-auto gives ProjectList its vertical
              scroll.
            - overflow-x-hidden prevents unwanted horizontal
              modal scrolling.
            - TaskList has its OWN horizontal scroll inside
              #bulk-task-scroll-container.
        ==================================================== */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            overscroll-contain
          "
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          <div
            className="
              w-full
              px-3
              py-4
              sm:px-5
              sm:py-5
              lg:px-6
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
  // Rendering directly under <body> prevents parent containers
  // with overflow/transform/z-index from clipping the modal.
  // =========================================================
  return createPortal(
    modalContent,
    document.body
  );
};

export default Modal;
