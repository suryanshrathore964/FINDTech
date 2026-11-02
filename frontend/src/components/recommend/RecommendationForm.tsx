import { motion } from 'framer-motion'
import {
  Briefcase,
  Brain,
  Gamepad2,
  Clapperboard,
  Gauge,
  Layers,
  Search,
} from 'lucide-react'
import { FormSection } from './FormSection'
import { BudgetSlider } from './BudgetSlider'
import { AnimatedToggle } from './AnimatedToggle'
import { OptionGrid } from './OptionGrid'
import { PreferenceSlider } from './PreferenceSlider'
import { SoftwareStackSelect } from './SoftwareStackSelect'
import { Button } from '@/components/ui/Button'
import type { RecommendFormState, Profession, GamingLevel, EditingLevel, UsageIntensity } from '@/types/recommend'

const PROFESSIONS: { value: Profession; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'student', label: 'Student' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'content_creator', label: 'Creator' },
  { value: 'business', label: 'Business' },
  { value: 'researcher', label: 'Researcher' },
]

const GAMING: { value: GamingLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'casual', label: 'Casual' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'streaming', label: 'Streaming' },
]

const EDITING: { value: EditingLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'photo', label: 'Photo' },
  { value: 'video', label: 'Video' },
  { value: '3d', label: '3D / VFX' },
]

const INTENSITY: { value: UsageIntensity; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
  { value: 'extreme', label: 'Extreme' },
]

interface RecommendationFormProps {
  form: RecommendFormState
  onChange: (patch: Partial<RecommendFormState>) => void
  onSubmit: () => void
  loading: boolean
  error?: string
}

export function RecommendationForm({
  form,
  onChange,
  onSubmit,
  loading,
  error,
}: RecommendationFormProps) {
  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="dash-card rounded-2xl p-5 sm:p-6 lg:p-8 space-y-7 lg:space-y-8 max-h-none xl:max-h-[calc(100vh-8rem)] overflow-visible xl:overflow-y-auto recommend-form-scroll"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <FormSection
        title="Budget"
        description="Set your comfortable price range"
        icon={<Briefcase className="h-5 w-5" />}
        delay={0}
      >
        <BudgetSlider
          min={form.budgetMin}
          max={form.budgetMax}
          onMinChange={(v) => onChange({ budgetMin: v })}
          onMaxChange={(v) => onChange({ budgetMax: v })}
        />
      </FormSection>

      <FormSection
        title="Profession"
        description="Primary role shapes our ML weights"
        icon={<Briefcase className="h-5 w-5" />}
        delay={0.05}
      >
        <OptionGrid
          groupId="profession"
          options={PROFESSIONS}
          value={form.profession}
          onChange={(v) => onChange({ profession: v })}
          columns={3}
        />
      </FormSection>

      <FormSection
        title="AI / ML workloads"
        description="Training, inference, data science pipelines"
        icon={<Brain className="h-5 w-5" />}
        delay={0.1}
      >
        <AnimatedToggle
          enabled={form.aiMlWorkload}
          onChange={(v) => onChange({ aiMlWorkload: v })}
          label="Run AI / ML workloads"
          description="Boosts RAM, GPU, and performance scoring"
          icon={<Brain className="h-5 w-5" />}
        />
      </FormSection>

      <FormSection
        title="Gaming"
        description="How much you game on this machine"
        icon={<Gamepad2 className="h-5 w-5" />}
        delay={0.12}
      >
        <OptionGrid
          groupId="gaming"
          options={GAMING.map((g) => ({ ...g, icon: <Gamepad2 className="h-4 w-4" /> }))}
          value={form.gaming}
          onChange={(v) => onChange({ gaming: v })}
          columns={4}
        />
      </FormSection>

      <FormSection
        title="Editing & creative"
        description="Photo, video, or 3D production"
        icon={<Clapperboard className="h-5 w-5" />}
        delay={0.14}
      >
        <OptionGrid
          groupId="editing"
          options={EDITING}
          value={form.editing}
          onChange={(v) => onChange({ editing: v })}
          columns={4}
        />
      </FormSection>

      <FormSection
        title="Portability & battery"
        delay={0.16}
      >
        <div className="space-y-5">
          <PreferenceSlider
            label="Portability"
            value={form.portability}
            onChange={(v) => onChange({ portability: v })}
            hint="Light weight and easy to carry"
            color="cyan"
          />
          <PreferenceSlider
            label="Battery priority"
            value={form.battery}
            onChange={(v) => onChange({ battery: v })}
            hint="Long unplugged runtime"
            color="violet"
          />
        </div>
      </FormSection>

      <FormSection
        title="Software stack"
        description="Apps you rely on daily"
        icon={<Layers className="h-5 w-5" />}
        delay={0.18}
      >
        <SoftwareStackSelect
          selected={form.softwareStack}
          onChange={(v) => onChange({ softwareStack: v })}
        />
      </FormSection>

      <FormSection
        title="Usage intensity"
        description="How hard you push the machine"
        icon={<Gauge className="h-5 w-5" />}
        delay={0.2}
      >
        <OptionGrid
          groupId="intensity"
          options={INTENSITY}
          value={form.usageIntensity}
          onChange={(v) => onChange({ usageIntensity: v })}
          columns={4}
        />
      </FormSection>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3"
        >
          {error}
        </motion.p>
      )}

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button type="submit" className="w-full py-4 text-base" isLoading={loading}>
          <Search className="h-5 w-5" />
          Run AI recommendation
        </Button>
      </motion.div>
    </motion.form>
  )
}
