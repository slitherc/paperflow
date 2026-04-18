import { Fragment } from "react";

interface StepsProps {
  steps: ReadonlyArray<string>;
  current: number;
}

export function Steps({ steps, current }: StepsProps) {
  return (
    <div className="steps" role="list" aria-label="Progress">
      {steps.map((s, i) => {
        const state = i === current ? "active" : i < current ? "done" : "";
        return (
          <Fragment key={s}>
            {i > 0 && <div className="step-sep" aria-hidden="true" />}
            <div
              className={`step ${state}`}
              role="listitem"
              aria-current={i === current ? "step" : undefined}
            >
              <span className="dot" aria-hidden="true" />
              {s}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
