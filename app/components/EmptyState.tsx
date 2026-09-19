import { Icon, type IconName } from "./Icon";

export function EmptyState({
  title,
  subtitle,
  icon = "search",
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} strokeWidth={1.6} />
      </div>
      <div className="empty-title">{title}</div>
      {subtitle ? <div className="empty-sub">{subtitle}</div> : null}
    </div>
  );
}
