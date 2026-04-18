import { Fragment, type ReactNode } from "react";

export interface CrumbItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}

interface CrumbProps {
  items: ReadonlyArray<CrumbItem>;
}

export function Crumb({ items }: CrumbProps) {
  return (
    <nav className="crumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && (
            <span className="sep" aria-hidden="true">
              /
            </span>
          )}
          {item.onClick ? (
            <button type="button" onClick={item.onClick}>
              {item.icon}
              {item.label}
            </button>
          ) : (
            <span>{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
