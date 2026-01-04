import { createClient } from '@supabase/supabase-js'

// Substitua ABAIXO pelos seus dados do Supabase
const supabaseUrl = 'COLE_SUA_PROJECT_URL_AQUI'
const supabaseKey = 'COLE_SUA_ANON_PUBLIC_KEY_AQUI'

export const supabase = createClient(supabaseUrl, supabaseKey)
