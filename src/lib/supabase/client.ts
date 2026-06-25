import { createBrowserClient } from "@supabase/ssr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedClient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (cachedClient) return cachedClient;
    const noop = async () => ({ data: { user: null }, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      neq: () => chain,
      gt: () => chain,
      gte: () => chain,
      lt: () => chain,
      lte: () => chain,
      like: () => chain,
      ilike: () => chain,
      in: () => chain,
      contains: () => chain,
      order: () => chain,
      limit: () => chain,
      range: () => chain,
      single: noop,
      maybeSingle: noop,
      insert: () => chain,
      update: () => chain,
      delete: () => chain,
      upsert: () => chain,
      then: (resolve: (v: any) => void) => resolve({ data: null, error: null }),
    };
    cachedClient = new Proxy({} as any, {
      get: (_: any, prop: string | symbol) => {
        if (typeof prop === "symbol") return undefined;
        if (prop === "auth") return {
          getUser: noop,
          getSession: noop,
          signOut: async () => {},
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        };
        if (prop === "from") return () => chain;
        if (prop === "channel") return () => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: () => {}, track: () => ({}) });
        if (prop === "removeChannel") return () => {};
        if (prop === "removeAllChannels") return () => {};
        if (prop === "storage") return {
          from: () => ({
            upload: noop,
            list: async () => ({ data: [] }),
            getPublicUrl: () => ({ data: { publicUrl: "" } }),
            remove: noop,
          }),
        };
        return chain;
      },
    });
    return cachedClient;
  }
  return createBrowserClient(url, key);
}
