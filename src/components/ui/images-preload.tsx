import type { StaticImageData } from 'next/image'
import Image from 'next/image'

interface ImagesPreloadProps {
  images: StaticImageData[]
  dataPreload: string
  additionalImages?: StaticImageData[]
}

export function ImagesPreload({ images, dataPreload, additionalImages }: ImagesPreloadProps) {
  if (images.length === 0 && (!additionalImages || additionalImages.length === 0)) return null

  const allImages = [...images, ...(additionalImages ?? [])]

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      data-preload={dataPreload}>
      {allImages.map(image => (
        <Image
          key={image.src}
          src={image}
          alt=""
          width={image.width}
          height={image.height}
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
    </div>
  )
}
