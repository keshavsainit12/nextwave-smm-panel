import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Fetch currency-related settings
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['currency', 'currency_symbol', 'exchange_rate'])
    
    if (error) {
      console.error('[Currency API] Error fetching settings:', error)
      return NextResponse.json(
        { currency: 'USD', currency_symbol: '$', exchange_rate: '1' },
        { status: 200 }
      )
    }
    
    // Convert array to object
    const settingsMap: Record<string, string> = {}
    settings?.forEach(setting => {
      settingsMap[setting.key] = setting.value
    })
    
    return NextResponse.json({
      currency: settingsMap.currency || 'USD',
      currency_symbol: settingsMap.currency_symbol || '$',
      exchange_rate: settingsMap.exchange_rate || '1',
    })
  } catch (error) {
    console.error('[Currency API] Unexpected error:', error)
    return NextResponse.json(
      { currency: 'USD', currency_symbol: '$', exchange_rate: '1' },
      { status: 200 }
    )
  }
}
