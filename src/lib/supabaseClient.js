import { createClient } from "@supabase/supabase-js";

// Esta es la anon key: SÍ es segura para el navegador.
// Solo puede hacer lo que las políticas RLS le permitan
// (lectura pública de products, categories, testimonials, etc.)
// definidas en rls_policies.sql. No puede escribir en orders,
// customers ni admin_users directamente.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
