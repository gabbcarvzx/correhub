const flags = {
  community_feed: true,
  rankings: true,
  partners: true,
  notifications: true,
  challenges: true,
  premium: false
} as const;

export function isFeatureEnabled(flag: keyof typeof flags) {
  return flags[flag];
}
