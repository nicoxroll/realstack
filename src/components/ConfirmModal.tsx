import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({ 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'CONFIRMAR',
  cancelText = 'CANCELAR'
}: ConfirmModalProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-md rounded-lg bg-neutral-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
            <AlertTriangle className="h-6 w-6 text-yellow-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-light tracking-wide text-white">
              Confirmación
            </h3>
            <p className="font-light leading-relaxed text-neutral-300">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-neutral-600 bg-transparent px-6 py-3 text-sm tracking-wider text-neutral-300 transition-all hover:border-neutral-400 hover:bg-neutral-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 border border-red-500 bg-red-500 px-6 py-3 text-sm tracking-wider text-white transition-all hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
