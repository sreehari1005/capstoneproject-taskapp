export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="center-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
