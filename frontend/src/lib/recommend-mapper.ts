import type { RecommendationPreferences } from '@/types'
import type { RecommendFormState } from '@/types/recommend'

const PROFESSION_USE: Record<RecommendFormState['profession'], string> = {
  developer: 'work',
  designer: 'creative',
  student: 'student',
  engineer: 'work',
  content_creator: 'creative',
  business: 'work',
  researcher: 'work',
}

const INTENSITY_PERF: Record<RecommendFormState['usageIntensity'], number> = {
  light: 4,
  moderate: 6,
  heavy: 8,
  extreme: 10,
}

const GAMING_PERF: Record<RecommendFormState['gaming'], number> = {
  none: 0,
  casual: 2,
  competitive: 4,
  streaming: 3,
}

const EDITING_PERF: Record<RecommendFormState['editing'], number> = {
  none: 0,
  photo: 2,
  video: 4,
  '3d': 5,
}

export function mapFormToApiPreferences(form: RecommendFormState): RecommendationPreferences {
  let primaryUse = PROFESSION_USE[form.profession]
  if (form.gaming !== 'none') primaryUse = 'gaming'
  else if (form.editing === 'video' || form.editing === '3d') primaryUse = 'creative'
  else if (form.aiMlWorkload) primaryUse = 'work'

  let performance = INTENSITY_PERF[form.usageIntensity]
  performance = Math.min(10, performance + GAMING_PERF[form.gaming] + EDITING_PERF[form.editing])
  if (form.aiMlWorkload) performance = Math.min(10, performance + 2)

  let ramMin = 8
  if (form.aiMlWorkload || form.editing === 'video' || form.editing === '3d') ramMin = 16
  if (form.usageIntensity === 'extreme') ramMin = Math.max(ramMin, 16)
  if (form.gaming === 'competitive' || form.gaming === 'streaming') ramMin = Math.max(ramMin, 16)

  let storageMin = 256
  if (form.editing !== 'none' || form.aiMlWorkload) storageMin = 512
  if (form.softwareStack.some((s) => ['Blender', 'Unity', 'Unreal Engine'].includes(s))) {
    storageMin = 1024
  }

  return {
    budget_min: form.budgetMin,
    budget_max: form.budgetMax,
    primary_use: primaryUse,
    portability: form.portability,
    performance,
    battery_priority: form.battery,
    brand_preferences: form.brandPreferences,
    ram_min: ramMin,
    storage_min: storageMin,
  }
}

export const DEFAULT_FORM_STATE: RecommendFormState = {
  budgetMin: 800,
  budgetMax: 2000,
  profession: 'developer',
  aiMlWorkload: false,
  gaming: 'none',
  editing: 'none',
  portability: 5,
  battery: 6,
  softwareStack: [],
  usageIntensity: 'moderate',
  brandPreferences: [],
}
