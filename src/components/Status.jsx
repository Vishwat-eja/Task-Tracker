export function Spinner({ label = "Loading…" }) {
  return (
    <div className="center" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorMessage({ error, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <strong>Something went wrong</strong>
      <p>{error?.message || "Unknown error."}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}
