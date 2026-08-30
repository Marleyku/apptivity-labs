import { useFeedback } from '../context/FeedbackContext.jsx';

/** Floating Feedback control — hide while the modal is open. */
export function FeedbackFab() {
  const { openFeedback, open } = useFeedback();

  if (open) return null;

  return (
    <button
      type="button"
      data-feedback-widget
      className="feedback-fab"
      onClick={openFeedback}
      aria-label="Send feedback"
    >
      Feedback
    </button>
  );
}
