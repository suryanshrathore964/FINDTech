import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Scale, Sparkles, X } from 'lucide-react'
import { LaptopCard } from '@/components/ui/LaptopCard'
import { Button } from '@/components/ui/Button'
import { laptopsApi } from '@/services/api'
import type { Laptop } from '@/types'

const CATEGORIES = [
  { id: 'all', label: 'All Laptops' },
  { id: 'ai_ml', label: 'AI & Data Science' },
  { id: 'work', label: 'Coding & Work' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'creative', label: 'Creative & 3D' },
  { id: 'student', label: 'Student & Budget' },
  { id: 'everyday', label: 'Everyday Mobility' },
]

export function Browse() {
  const navigate = useNavigate()
  const [laptops, setLaptops] = useState<Laptop[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured')
  const [compareList, setCompareList] = useState<Laptop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    laptopsApi
      .brands()
      .then(({ data }) => setBrands(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    laptopsApi
      .list({
        search: search || undefined,
        brand: selectedBrand || undefined,
      })
      .then(({ data }) => setLaptops(data))
      .catch(() => setLaptops([]))
      .finally(() => setLoading(false))
  }, [search, selectedBrand])

  // Filter by category client-side
  const filteredLaptops = useMemo(() => {
    let result = [...laptops]

    if (selectedCategory !== 'all') {
      result = result.filter(
        (l) =>
          l.use_cases.includes(selectedCategory) ||
          l.tags.some((t) => t.toLowerCase().includes(selectedCategory))
      )
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [laptops, selectedCategory, sortBy])

  const toggleCompare = (laptop: Laptop) => {
    if (compareList.some((l) => l.id === laptop.id)) {
      setCompareList(compareList.filter((l) => l.id !== laptop.id))
    } else {
      if (compareList.length >= 4) {
        setCompareList([...compareList.slice(1), laptop])
      } else {
        setCompareList([...compareList, laptop])
      }
    }
  }

  const launchComparison = () => {
    if (compareList.length < 2) return
    navigate(`/compare?ids=${compareList.map((l) => l.id).join(',')}`)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
        <div>
          <h1 className="font-display text-3xl font-bold dash-text-primary">
            Curated Laptop Catalog
          </h1>
          <p className="dash-text-muted mt-1 text-sm">
            Explore 50+ cutting-edge 2025/2026 laptops verified across real-world benchmarks
          </p>
        </div>

        <Link to="/recommend">
          <Button size="sm">
            <Sparkles className="h-4 w-4" />
            AI Match Me
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="dash-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model, CPU, GPU (e.g. RTX 4070, M3, Snapdragon)..."
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 pl-10 pr-4 py-2.5 text-sm dash-text-primary placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:outline-none min-w-[140px]"
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {b}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:outline-none min-w-[150px]"
          >
            <option value="featured" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Featured</option>
            <option value="price-asc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Price: Low to High</option>
            <option value="price-desc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Price: High to Low</option>
            <option value="rating" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                : 'dash-card dash-text-muted hover:dash-text-primary hover:border-primary-500/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs dash-text-muted">
        <span>
          Showing <strong>{filteredLaptops.length}</strong> matching models
        </span>
        {compareList.length > 0 && (
          <span className="text-primary-500 font-semibold">
            {compareList.length} selected for comparison
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : filteredLaptops.length === 0 ? (
        <div className="dash-card rounded-2xl p-12 text-center dash-text-muted">
          <p className="text-base font-semibold dash-text-primary">No laptops found</p>
          <p className="text-sm mt-1">Try relaxing your search query or brand selection.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLaptops.map((laptop, i) => (
            <LaptopCard
              key={laptop.id}
              laptop={laptop}
              index={i}
              onCompareToggle={toggleCompare}
              isComparing={compareList.some((c) => c.id === laptop.id)}
            />
          ))}
        </div>
      )}

      {/* Floating Comparison Drawer */}
      <AnimatePresence>
        {compareList.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="dash-card rounded-2xl p-4 shadow-2xl border border-primary-500/30 backdrop-blur-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white shrink-0">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs dash-text-primary">
                    Compare {compareList.length} Laptops
                  </p>
                  <p className="text-xs dash-text-muted truncate max-w-[220px]">
                    {compareList.map((c) => c.name).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareList([])}
                  className="p-2 text-xs dash-text-muted hover:text-red-400"
                  title="Clear comparison"
                >
                  Clear
                </button>
                <Button size="sm" onClick={launchComparison}>
                  Compare Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
