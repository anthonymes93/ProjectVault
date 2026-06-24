import { STATUS_CONFIG } from '../../lib/types'
import type { ProjectStatus } from '../../lib/types'

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`badge ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
      {cfg.label}
    </span>
  )
}
