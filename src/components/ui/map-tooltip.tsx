'use client'

import {
  BottomDrawer,
  BottomDrawerContent,
  BottomDrawerDescription,
  BottomDrawerHeader,
  BottomDrawerTitle,
  BottomDrawerTrigger,
} from '@/components/ui/bottom-drawer'
import { MapComponent } from '@/components/ui/map-component'
import { HOME_CONTENT } from '@/lib/content'

type MapTooltipProps = {
  locationLabel?: string
  latitude?: number
  longitude?: number
}

export function MapTooltip({
  locationLabel = HOME_CONTENT.LOCATION,
  latitude = HOME_CONTENT.MAP_LATITUDE,
  longitude = HOME_CONTENT.MAP_LONGITUDE,
}: MapTooltipProps) {
  return (
    <div className="w-full">
      <BottomDrawer>
        <BottomDrawerTrigger asChild>
          <button
            type="button"
            className="inline-flex w-fit cursor-pointer items-center self-start text-center text-lg font-semibold text-primary md:self-start md:text-xl"
            aria-label={`Open map of ${locationLabel}`}>
            {locationLabel}
          </button>
        </BottomDrawerTrigger>
        <BottomDrawerContent className="pb-4">
          <BottomDrawerHeader className="mt-3 p-0">
            <BottomDrawerTitle className="sr-only">Map of {locationLabel}</BottomDrawerTitle>
            <BottomDrawerDescription className="sr-only">
              Embedded map centered on {locationLabel}. Use two fingers to pan and zoom.
            </BottomDrawerDescription>
          </BottomDrawerHeader>
          <div className="h-[400px] p-0 md:h-[500px]">
            <MapComponent
              center={[latitude, longitude]}
              zoom={5}
              label={locationLabel}
              className="h-full w-full rounded-md"
            />
          </div>
        </BottomDrawerContent>
      </BottomDrawer>
    </div>
  )
}
