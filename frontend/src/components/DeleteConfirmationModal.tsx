import Modal from "./Modal";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  additionalInfo?: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  additionalInfo,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel"
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {(close) => (
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-600">{title}</h2>
          <p className="mt-1 text-gray-500">{message}</p>
          {additionalInfo && (
            <div className="mt-2">
              {additionalInfo}
            </div>
          )}
          <div className="mt-9 flex justify-center gap-4">
            <button
              className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-all"
              onClick={handleConfirm}
            >
              {confirmButtonText}
            </button>
            <button
              className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
              onClick={close}
            >
              {cancelButtonText}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}