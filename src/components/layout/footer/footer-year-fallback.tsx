async function getCurrentYear() {
  'use cache'
  return new Date().getFullYear()
}

export async function FooterYearFallback() {
  const year = await getCurrentYear()
  return (
    <button aria-label="Turn back time" className="hover:opacity-80" aria-disabled disabled>
      <span aria-hidden="true" className="dotcom:inline hidden">
        1999
      </span>
      <span aria-hidden="true" className="dotcom:hidden inline">
        {year}
      </span>
    </button>
  )
}
