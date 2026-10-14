import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '@workspace/api-client-react';

type CartLine = { product: Product; quantity: number };
type StoreState = {
  cart: CartLine[];
  wishlist: string[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  toggleWish: (id: string) => void;
  clear: () => void;
};

const StoreContext = createContext<StoreState | null>(null);
const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setCart(read<CartLine[]>('glow-theory-cart', []).filter((line) => line?.product?.id && line.quantity > 0));
    setWishlist(read<string[]>('glow-theory-wishlist', []).filter((id) => typeof id === 'string'));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem('glow-theory-cart', JSON.stringify(cart));
      localStorage.setItem('glow-theory-wishlist', JSON.stringify(wishlist));
    } catch {
      // Shopping still works for this visit when browser storage is unavailable.
    }
  }, [cart, wishlist, ready]);
  const value = useMemo<StoreState>(() => ({
    cart, wishlist,
    add: (product) => setCart((old) => {
      const found = old.find((line) => line.product.id === product.id);
      return found
        ? old.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
        : [...old, { product, quantity: 1 }];
    }),
    remove: (id) => setCart((old) => old.filter((line) => line.product.id !== id)),
    setQuantity: (id, quantity) => setCart((old) => quantity < 1
      ? old.filter((line) => line.product.id !== id)
      : old.map((line) => line.product.id === id ? { ...line, quantity } : line)),
    toggleWish: (id) => setWishlist((old) => old.includes(id) ? old.filter((item) => item !== id) : [...old, id]),
    clear: () => setCart([]),
  }), [cart, wishlist]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
