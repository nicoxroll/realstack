import { useState, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';

interface ConfirmOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message: options.message,
        confirmText: options.confirmText || 'CONFIRMAR',
        cancelText: options.cancelText || 'CANCELAR',
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
      });
    });
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmState(null);
  }, []);

  const ConfirmComponent = confirmState?.isOpen ? (
    <ConfirmModal
      message={confirmState.message}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      onConfirm={confirmState.onConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return {
    confirm,
    ConfirmComponent,
  };
}
