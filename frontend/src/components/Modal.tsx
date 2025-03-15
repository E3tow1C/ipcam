import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: (close: () => void) => React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const [visible, setVisible] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
    } else {
      setClosing(true);
      setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${closing ? "animate-fade-out" : "animate-fade-in"}`}
      onClick={onClose}
    >
      <div
        className={`bg-white p-6 rounded-xl shadow-lg max-w-md w-[90%] transform transition-transform duration-300 ${closing ? "animate-fade-down" : "animate-fade-up"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children(onClose)}
      </div>
    </div>
  );
}