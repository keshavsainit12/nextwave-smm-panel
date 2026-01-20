'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function autoUpdateIcons() {
  const supabase = createAdminClient()

  const iconMappings = [
    { name: 'TikTok', url: '/images/icons8-tiktok.gif' },
    { name: 'Discord', url: '/images/icons8-discord.gif' },
    { name: 'YouTube', url: '/images/icons8-youtube.gif' },
    { name: 'Telegram', url: '/images/icons8-telegram-logo.gif' },
    { name: 'LinkedIn', url: '/images/icons8-linkedin.gif' },
    { name: 'Spotify', url: '/images/icons8-spotify.gif' },
    { name: 'Facebook', url: '/images/icons8-facebook-circled.gif' },
    { name: 'Instagram', url: '/images/icons8-instagram.gif' },
  ]

  const results = {
    updated: [],
    failed: [],
  }

  for (const mapping of iconMappings) {
    try {
      const { error } = await supabase
        .from('services')
        .update({ icon: mapping.url })
        .ilike('name', `%${mapping.name}%`)

      if (error) {
        results.failed.push({ name: mapping.name, error: error.message })
      } else {
        results.updated.push(mapping.name)
      }
    } catch (error: any) {
      results.failed.push({ name: mapping.name, error: error.message })
    }
  }

  return results
}
