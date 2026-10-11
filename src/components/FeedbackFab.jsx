import { useFeedback } from '../context/FeedbackContext.jsx';
import { useTemporaryFabPosition } from './useTemporaryFabPosition.js';

/** Floating Feedback control — hide while the modal is open. Temporarily draggable. */
export function FeedbackFab() {
  const { openFeedback, open } = useFeedback();
  const { fabStyle, fabPointerProps, onFabClick } = useTemporaryFabPosition(openFeedback);

  if (open) return null;

  return (
    <button
      type="button"
      data-feedback-widget
      className="feedback-fab"
      style={fabStyle}
      {...fabPointerProps}
      onClick={onFabClick}
      aria-label="Send feedback"
      title="Feedback — drag to move (resets on next page)"
    >
      Feedback
    </button>
  );
}
