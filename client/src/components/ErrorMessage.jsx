export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="alert alert-error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
