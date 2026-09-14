import { createClient } from '@supabase/supabase-js'

const url = 'https://eqjexfceuwmsujhjvfim.supabase.co'
const key = 'sb_publishable_yYHoFVdj4pgwjKKt3gjFKQ_IsxkMk4l'

export const supabase = createClient(url, key)
