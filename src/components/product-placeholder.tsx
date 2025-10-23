import { Gem, Sparkles } from 'lucide-react'

interface ProductPlaceholderProps {
  productName: string
  category?: string
  className?: string
}

export function ProductPlaceholder({ productName, category, className = "" }: ProductPlaceholderProps) {
  // Determine the type of jewelry for appropriate icon/styling
  const getJewelryType = () => {
    const name = productName.toLowerCase()
    if (name.includes('ring')) return 'ring'
    if (name.includes('necklace')) return 'necklace'
    if (name.includes('earring')) return 'earring'
    if (name.includes('bracelet')) return 'bracelet'
    return 'gem'
  }

  const type = getJewelryType()

  // Different gradients for different jewelry types - all gold tones
  const gradients = {
    ring: 'from-amber-100 via-yellow-50 to-amber-100',
    necklace: 'from-amber-100 via-yellow-50 to-amber-100',
    earring: 'from-amber-100 via-yellow-50 to-amber-100',
    bracelet: 'from-amber-100 via-yellow-50 to-amber-100',
    gem: 'from-amber-100 via-yellow-50 to-amber-100'
  }

  const icons = {
    ring: '💍',
    necklace: '📿',
    earring: '💎',
    bracelet: '⌚',
    gem: '💎'
  }

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${gradients[type]} ${className}`}>
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        {/* Main icon */}
        <div className="text-6xl mb-4 animate-pulse">
          {icons[type]}
        </div>
        
        {/* Decorative sparkles */}
        <div className="relative">
          <Sparkles className="h-8 w-8 text-amber-400/40 absolute -top-2 -left-6 animate-pulse" />
          <Gem className="h-12 w-12 text-gray-400/60" />
          <Sparkles className="h-6 w-6 text-amber-400/30 absolute -bottom-1 -right-5 animate-pulse animation-delay-1000" />
        </div>
        
        {/* Product name (optional) */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider opacity-50">
            {type === 'gem' ? 'Fine Jewelry' : type}
          </p>
        </div>
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-4 left-4">
        <div className="w-8 h-8 border-t-2 border-l-2 border-amber-300/30"></div>
      </div>
      <div className="absolute top-4 right-4">
        <div className="w-8 h-8 border-t-2 border-r-2 border-amber-300/30"></div>
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="w-8 h-8 border-b-2 border-l-2 border-amber-300/30"></div>
      </div>
      <div className="absolute bottom-4 right-4">
        <div className="w-8 h-8 border-b-2 border-r-2 border-amber-300/30"></div>
      </div>
    </div>
  )
}

export default ProductPlaceholder