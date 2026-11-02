import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Battery,
  Cpu,
  HardDrive,
  Monitor,
  Scale,
  Star,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LaptopImage } from '@/components/ui/LaptopImage'
import { formatPrice } from '@/lib/utils'
import { laptopsApi } from '@/services/api'
import type { Laptop } from '@/types'

export function LaptopDetail() {
  const { id } = useParams<{ id: string }>()
  const [laptop, setLaptop] = useState<Laptop | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    laptopsApi
      .get(id)
      .then(({ data }) => setLaptop(data))
      .catch(() => setLaptop(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!laptop) {
    return (
      <div className="dash-card rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
        <p className="dash-text-muted mb-4">Laptop model not found.</p>
        <Link to="/browse">
          <Button variant="secondary">Back to catalog</Button>
        </Link>
      </div>
    )
  }

  const memType =
    laptop.brand.toLowerCase() === 'apple'
      ? 'GB Unified Memory'
      : laptop.cpu.toLowerCase().includes('snapdragon')
      ? 'GB LPDDR5X (8448 MT/s)'
      : 'GB DDR5-5600'

  const storageStr =
    laptop.storage_gb >= 1024
      ? `${laptop.storage_gb / 1024} TB NVMe PCIe 4.0 SSD`
      : `${laptop.storage_gb} GB NVMe PCIe 4.0 SSD`

  const specs = [
    { icon: Cpu, label: 'Processor', value: laptop.cpu },
    { icon: Monitor, label: 'Graphics', value: laptop.gpu },
    { icon: HardDrive, label: 'Memory', value: `${laptop.ram_gb} ${memType}` },
    { icon: HardDrive, label: 'Storage', value: storageStr },
    { icon: Battery, label: 'Battery Life', value: `${laptop.battery_hours} hours unplugged` },
    { icon: Scale, label: 'Chassis Weight', value: `${laptop.weight_kg} kg` },
    { icon: Monitor, label: 'Display Spec', value: laptop.display },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6 pb-24"
    >
      <Link
        to="/browse"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider dash-text-muted hover:text-primary-500 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Card */}
        <div className="lg:col-span-5">
          <div className="dash-card rounded-3xl overflow-hidden p-6 border border-primary-500/15">
            <div className="aspect-[4/3] rounded-2xl bg-slate-900/40 p-4 flex items-center justify-center">
              <LaptopImage
                imageUrl={laptop.image_url}
                laptopId={laptop.id}
                alt={laptop.name}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {laptop.tags.map((tag) => (
                <Badge key={tag} variant="mint">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Model Specs & AI actions */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                {laptop.brand}
              </p>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {laptop.rating.toFixed(1)} / 5.0
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold dash-text-primary mt-1">
              {laptop.name}
            </h1>
            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary-500">
                {formatPrice(laptop.price)}
              </span>
              <span className="text-xs dash-text-muted">MSRP / Official Pricing</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link to="/recommend">
              <Button size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Find Similar Matches
              </Button>
            </Link>
            <Link to={`/compare?ids=${laptop.id}`}>
              <Button variant="secondary" size="lg">
                <Scale className="h-4 w-4 mr-2" />
                Compare Alternatives
              </Button>
            </Link>
          </div>

          {/* Specifications Panel */}
          <div className="dash-card rounded-2xl p-6 border border-primary-500/10">
            <h2 className="font-display font-bold text-base dash-text-primary mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary-500" /> Technical Architecture
            </h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-100/60 dark:bg-white/5 flex items-start gap-3">
                  <Icon className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs dash-text-muted">{label}</dt>
                    <dd className="text-sm font-semibold dash-text-primary mt-0.5">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Use Cases */}
          <div className="dash-card rounded-2xl p-6 border border-primary-500/10">
            <h2 className="font-display font-bold text-base dash-text-primary mb-3">
              Optimized Workload Profiles
            </h2>
            <div className="flex flex-wrap gap-2">
              {laptop.use_cases.map((uc) => (
                <div
                  key={uc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-500 text-xs font-semibold capitalize"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary-400" />
                  {uc.replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
