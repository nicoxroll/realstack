import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

export default function Notification({ message, type, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-neutral-800 border-green-500',
      text: 'text-green-400',
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    },
    error: {
      bg: 'bg-neutral-800 border-red-500',
      text: 'text-red-400',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    },
    warning: {
      bg: 'bg-neutral-800 border-yellow-500',
      text: 'text-yellow-400',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    },
    info: {
      bg: 'bg-neutral-800 border-blue-500',
      text: 'text-blue-400',
      icon: <Info className="w-5 h-5 text-blue-400" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
      <div
        className={`
          ${currentStyle.bg} ${currentStyle.text}
          border-l-4 rounded-lg shadow-lg p-4 max-w-md w-full
          pointer-events-auto
          animate-[slideDown_0.3s_ease-out]
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {currentStyle.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-light leading-relaxed break-words text-white">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`
              flex-shrink-0 ml-2 p-1 rounded-lg
              hover:bg-white/10 transition-colors
            `}
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
