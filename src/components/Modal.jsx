export default function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} id="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal" id="modal-close-btn">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
