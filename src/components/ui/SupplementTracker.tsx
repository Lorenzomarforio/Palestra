import { SUPPLEMENTS, SupplementIntake } from '@/config/supplements';
import './SupplementTracker.css';

export interface SupplementTrackerProps {
  intake: SupplementIntake;
  onToggle: (id: string) => void;
}

export function SupplementTracker({ intake, onToggle }: SupplementTrackerProps) {
  return (
    <div className="supplement-tracker">
      {SUPPLEMENTS.map(({ id, label, icon: Icon }) => {
        const taken = !!intake[id];
        return (
          <button
            key={id}
            type="button"
            className={`supplement-tracker__item ${taken ? 'supplement-tracker__item--taken' : 'supplement-tracker__item--missed'}`}
            onClick={() => onToggle(id)}
            aria-pressed={taken}
            aria-label={`${label}: ${taken ? 'assunto' : 'non assunto'}`}
          >
            <Icon size={14} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
