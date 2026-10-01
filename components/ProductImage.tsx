import { useState } from 'react'
import Image from 'next/image'
import { Shirt } from 'lucide-react'

interface ProductImageProps {
  src?: string | null
  alt: string
  className?: string
  priority?: boolean
  style?: React.CSSProperties
}

export function ProductImage({ src, alt, className = '', priority = false, style }: ProductImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center opacity-40 transition-opacity ${className}`}>
        <div className="absolute w-16 h-16 rounded-full bg-[#1687FF] blur-xl opacity-30"></div>
        <Shirt className="w-10 h-10 text-white relative z-10 drop-shadow-md" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  )
}
