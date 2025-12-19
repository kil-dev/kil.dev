import { Card } from '@/components/ui/card'

interface PetCardFrontProps {
  name: string
}

export function PetCardFront({ name }: PetCardFrontProps) {
  return (
    <Card className="absolute inset-0 gap-0 overflow-hidden bg-transparent p-0 transition-shadow [backface-visibility:hidden] group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2 group-hover:ring-offset-background">
      <div className="absolute inset-x-0 bottom-0 p-3">
        <span className="max-w-[85%] truncate rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white md:text-sm">
          {name}
        </span>
      </div>
    </Card>
  )
}
