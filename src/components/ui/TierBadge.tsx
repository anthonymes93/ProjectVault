import { TIER_CONFIG } from '../../lib/types'
import type { PriorityTier } from '../../lib/types'

export function TierBadge({ tier }: { tier: PriorityTier }) {
  const cfg = TIER_CONFIG[tier]
  return (
    <span className={`text-xs font-mono font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}
