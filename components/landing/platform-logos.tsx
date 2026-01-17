export function PlatformLogos() {
  const platforms = ["YouTube", "Twitter", "Instagram", "Facebook", "TikTok", "Telegram"]

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-12 px-4">
      {platforms.map((platform) => (
        <div
          key={platform}
          className="text-base md:text-lg lg:text-xl font-semibold text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
        >
          {platform}
        </div>
      ))}
    </div>
  )
}
