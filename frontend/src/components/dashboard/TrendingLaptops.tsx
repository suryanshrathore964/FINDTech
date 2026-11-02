import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, TrendingUp, ArrowRight } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { LaptopImage } from '@/components/ui/LaptopImage'
import { formatPrice } from '@/lib/utils'
import type { Laptop } from '@/types'

interface TrendingLaptopsProps {
  laptops: Laptop[]
  delay?: number
}

export function TrendingLaptops({ laptops, delay = 0 }: TrendingLaptopsProps) {
  return (
    <DashboardCard delay={delay} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-500" />
          <h3 className="font-display font-semibold dash-text-primary">Trending laptops</h3>
        </div>
        <Link
          to="/browse"
          className="text-sm font-medium text-primary-500 hover:text-primary-400 flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {laptops.map((laptop, i) => (
          <motion.div
            key={laptop.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.05 }}
          >
            <Link
              to={`/laptops/${laptop.id}`}
              className="group flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-primary-500/5 border border-transparent hover:border-primary-500/10"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary-500/20 to-cyan-500/10">
                <LaptopImage
                  imageUrl={laptop.image_url}
                  laptopId={laptop.id}
                  alt={laptop.name}
                  className="h-full w-full transition-transform group-hover:scale-105"
                />
                <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-md bg-primary-600 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold dash-text-primary truncate group-hover:text-primary-500 transition-colors">
                  {laptop.name}
                </p>
                <p className="text-xs dash-text-muted">{laptop.brand}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary-500">{formatPrice(laptop.price)}</p>
                <span className="inline-flex items-center gap-0.5 text-xs text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  {laptop.rating.toFixed(1)}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </DashboardCard>
  )
}
