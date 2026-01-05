import { supabase } from './supabase'

export async function logAction(action: string, module: string, details: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user?.email || 'Sistema'

    await supabase.from('logs').insert({
      user_email: user,
      action,
      module,
      details
    })
  } catch (error) {
    console.error('Falha ao registrar log:', error)
  }
}
