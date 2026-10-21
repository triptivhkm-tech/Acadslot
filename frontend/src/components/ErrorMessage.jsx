export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="sl-error" role="alert">
      <span>{message}</span>
      {onRetry && <button onClick={onRetry}>Try again</button>}
    </div>
  );
}
