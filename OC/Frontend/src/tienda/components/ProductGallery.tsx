import { useState } from 'react'
import type { ProductImage } from '../types/store'

interface Props {
  cover: ProductImage
  gallery?: ProductImage[]
}

export default function ProductGallery({ cover, gallery }: Props) {
  const images = [cover, ...(gallery ?? [])]
  const [activeIdx, setActiveIdx] = useState(0)
  const active = images[activeIdx] ?? cover

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
        <img
          src={active.src}
          alt={active.alt}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button
              key={`${img.src}-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
                activeIdx === idx
                  ? 'border-oc-red ring-2 ring-oc-red/20'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
