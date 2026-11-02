import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { DEFAULT_LAPTOP_IMAGE, getLaptopImageUrl } from '@/lib/laptop-images'

interface LaptopImageProps {
  imageUrl?: string | null
  laptopId?: string
  alt: string
  className?: string
}

export function LaptopImage({ imageUrl, laptopId, alt, className }: LaptopImageProps) {
  const [src, setSrc] = useState(() => getLaptopImageUrl(imageUrl, laptopId, alt))

  useEffect(() => {
    setSrc(getLaptopImageUrl(imageUrl, laptopId, alt))
  }, [imageUrl, laptopId, alt])

  return (
    <img
      src={src}
      alt={alt}
      className={cn('object-cover', className)}
      loading="lazy"
      onError={() => {
        if (src !== DEFAULT_LAPTOP_IMAGE) {
          setSrc(DEFAULT_LAPTOP_IMAGE)
        }
      }}
    />
  )
}

