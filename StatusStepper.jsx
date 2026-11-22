import { STATUSES, STATUS_LABELS } from '../utils/format.js';

// Shows where a task is in the workflow. Only the neighbouring steps can be clicked,
// matching the rule the server enforces.
export default function StatusStepper({ status, onChange, disabled }) {
  const current = STATUSES.indexOf(status);

  return (
    <ol className="stepper" aria-label="Task status">
      {STATUSES.map((step, index) => {
        const isCurrent = index === current;
        const isNext = Math.abs(index - current) === 1;
        return (
          <li key={step}>
            <button
              className={`step ${step} ${isCurrent ? 'current' : ''} ${index < current ? 'passed' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              disabled={disabled || isCurrent || !isNext}
              onClick={() => onChange(step)}
              title={isCurrent ? 'Current status' : isNext ? `Move to ${STATUS_LABELS[step]}` : 'Move one step at a time'}
            >
              {STATUS_LABELS[step]}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
