export function GradientOverlay() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-10 h-50 bg-linear-to-b from-background to-transparent" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 z-10 h-50 bg-linear-to-b from-transparent to-background"
        aria-hidden
      />
    </>
  )
}
