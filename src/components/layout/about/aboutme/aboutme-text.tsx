export function AboutMeText() {
  // On small screens the text has the first screen to itself, so the facts start below the fold
  return (
    <div className="flex max-w-[65ch] flex-col gap-4 text-base leading-relaxed text-muted-foreground md:text-lg compact:gap-3 compact:text-sm! max-lg:compact:min-h-[calc(100dvh-var(--frame-top)-var(--frame-bottom)-5.5rem)]">
      <p>
        I&apos;m a Senior Site Reliability Engineer. I build reliable, scalable platforms and smooth developer
        experiences for teams shipping to the cloud.
      </p>
      <p>
        I work with infrastructure as code, streamlined CI/CD, and practical observability to keep systems healthy and
        fast. I value automation, clear feedback loops, and resilient architectures. Lately I&apos;ve been exploring
        modern frontend with React and Next.js to round out the stack.
      </p>
      <p>
        When I&apos;m not shipping, I&apos;m tinkering in the homelab, refining dotfiles, contributing to open source,
        or hanging out with my pets.
      </p>
    </div>
  )
}
