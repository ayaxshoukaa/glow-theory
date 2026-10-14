'use client';

import { useCheckDatabase } from '@workspace/api-client-react';
import { LoaderCircle } from 'lucide-react';

export default function DatabaseCheckButton() {
  const check = useCheckDatabase();
  const statusMessage = check.isPending
    ? 'Checking the database connection…'
    : check.isSuccess
      ? check.data.message
      : check.isError
        ? 'The connection could not be confirmed. Please try again.'
        : 'Read-only check for signed-in customers. No data is changed.';

  return (
    <section className="database-check-panel" aria-labelledby="database-check-title">
      <div className="database-check-copy">
        <span className="eyebrow" id="database-check-title">Database connection</span>
        <p className={`database-check-status${check.isSuccess ? ' is-connected' : ''}${check.isError ? ' has-error' : ''}`} role="status" aria-live="polite">
          {statusMessage}
        </p>
      </div>
      <button
        className="button button-outline database-check-button"
        type="button"
        disabled={check.isPending}
        onClick={() => check.mutate(undefined)}
      >
        {check.isPending ? <><LoaderCircle className="spin" aria-hidden="true" /> Testing…</> : 'Test MongoDB connection'}
      </button>
    </section>
  );
}
