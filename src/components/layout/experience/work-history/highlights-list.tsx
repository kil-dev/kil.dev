export function HighlightsList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 list-none space-y-0 pl-5 text-sm group-data-[state=open]/collapsible:space-y-1 md:text-base">
      {items.map((h, idx) => (
        <li
          key={idx}
          className="relative max-h-0 translate-y-1 overflow-hidden pl-4 opacity-0 transition-all [transition-delay:var(--delay-out)] duration-300 ease-[cubic-bezier(0.2,0.8,0.16,1)] group-data-[state=open]:my-1 group-data-[state=open]:max-h-[400px] group-data-[state=open]:translate-y-0 group-data-[state=open]:opacity-100 group-data-[state=open]:[transition-delay:var(--delay-in)] before:absolute before:top-[0.55em] before:left-0 before:size-1.5 before:rounded-full before:bg-primary"
          style={
            {
              '--delay-in': `${idx * 80}ms`,
              '--delay-out': `${(items.length - 1 - idx) * 80}ms`,
            } as React.CSSProperties
          }>
          {h}
        </li>
      ))}
    </ul>
  )
}
