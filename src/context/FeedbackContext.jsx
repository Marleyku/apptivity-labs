import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openFeedback = useCallback(() => setOpen(true), []);
  const closeFeedback = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openFeedback, closeFeedback }),
    [open, openFeedback, closeFeedback],
  );

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback requires FeedbackProvider');
  return ctx;
}
