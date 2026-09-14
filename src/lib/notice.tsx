'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { X } from 'lucide-react';

interface NoticeContextType {
  showError: (message: string) => void;
}

const NoticeContext = createContext<NoticeContextType | undefined>(undefined);

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <NoticeContext.Provider value={{ showError: setMessage }}>
      {message && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-status-error)',
            color: 'white',
          }}
        >
          <span>{message}</span>
          <button
            onClick={() => setMessage(null)}
            aria-label="Chiudi avviso"
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>
      )}
      {children}
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error('useNotice must be used within a NoticeProvider');
  }
  return context;
}
