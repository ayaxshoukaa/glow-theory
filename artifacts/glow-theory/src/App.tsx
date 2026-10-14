import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  getGetCurrentUserQueryKey, getGetMyOrdersQueryKey, getGetProductsQueryKey,
  ProductCategory, useGetCurrentUser, useGetMyOrders, useGetProduct, useGetProducts,
  useLogIn, useLogOut, useSignUp,
} from '@workspace/api-client-react';
import type { GetProductsParams, Product } from '@workspace/api-client-react';
import type { LoginInput, SignupInput, UserProfile } from '@workspace/api-client-react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import { ArrowLeft, ArrowRight, Check, Heart, LoaderCircle, LockKeyhole, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import DatabaseCheckButton from './components/DatabaseCheckButton';
import { StoreProvider, useStore } from './components/store';

const client = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });
const money = (n: number) => `KWD ${Number(n || 0).toFixed(3)}`;
const categories = [ProductCategory.Skincare, ProductCategory.Lip_Care, ProductCategory.Body_Care, ProductCategory.Gift_Sets];
function productImage(_name: string, fromCatalog?: string) {
  return fromCatalog || '';
}
function Image({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed || !src
    ? <div className={`image-fallback ${className}`} role="img" aria-label={alt}><Sparkles size={28} aria-hidden="true" /><span>Glow Theory</span></div>
    : <img className={className} src={src} alt={alt} onError={() => setFailed(true)} loading="lazy" />;
}

function Header() {
  const { cart, wishlist } = useStore();
  const { data: user } = useGetCurrentUser();
  const logout = useLogOut();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const signOut = () => logout.mutate(undefined, { onSuccess: () => {
    qc.setQueryData(getGetCurrentUserQueryKey(), null);
    qc.invalidateQueries({ queryKey: getGetMyOrdersQueryKey() });
    navigate('/');
  } });
  return <header className="site-header">
    <div className="announcement">A little ritual, a lot of you. <span>Your Glow, Your Rules.</span></div>
    <div className="nav-wrap">
      <button className="icon-button mobile-menu" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(!mobileOpen)}><Menu size={21} /></button>
      <Link href="/" className="wordmark" aria-label="Glow Theory home">glow<span>theory</span><i>.</i></Link>
      <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/products" onClick={() => setMobileOpen(false)}>Shop</Link>
        <Link href="/products?bestsellers=1&sort=featured" onClick={() => setMobileOpen(false)}>Bestsellers</Link>
        <Link href="/find-your-glow" onClick={() => setMobileOpen(false)}>Find Your Glow</Link>
        <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
      </nav>
      <div className="nav-actions">
        {user ? <div className="account-nav"><Link href="/orders" className="user-name">Hi, {user.name.split(' ')[0]}</Link><button className="text-action" onClick={signOut} disabled={logout.isPending}>{logout.isPending ? 'Leaving…' : 'Log out'}</button></div> : <Link href="/login" className="account-link">Sign in</Link>}
        <Link href="/wishlist" className="icon-button" aria-label={`Wishlist, ${wishlist.length} items`}><Heart size={19} /><span className="counter">{wishlist.length}</span></Link>
        <Link href="/cart" className="icon-button" aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={20} /><span className="counter">{count}</span></Link>
      </div>
    </div>
  </header>;
}

function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const subscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage('Add a valid email address to continue.'); return; }
    setMessage('You’re on the list — just for this demo. No email was saved or sent.');
    setEmail('');
  };
  return <footer className="footer">
    <div className="footer-main">
      <div className="footer-brand"><Link href="/" className="wordmark">glow<span>theory</span><i>.</i></Link><p>Your Glow, Your Rules.</p><small>Good skin days start with feeling like yourself.</small></div>
      <div className="footer-links"><strong>Explore</strong><Link href="/products">Shop all</Link><Link href="/find-your-glow">Find your glow</Link><Link href="/contact">Talk to us</Link><Link href="/orders">Your orders</Link></div>
      <div className="newsletter"><strong>A note from us, now and then.</strong><p>New favorites, tiny rituals, and no pressure.</p><form onSubmit={subscribe} className="newsletter-form"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" required placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} /><button aria-label="Join newsletter"><ArrowRight size={18} /></button></form><p className="demo-note">{message || 'Demo only. No mailing list, storage, or email delivery.'}</p></div>
    </div>
    <div className="footer-bottom"><span>© 2026 Glow Theory</span><span>Made for your kind of glow.</span><Link href="/contact">Demo contact form</Link></div>
  </footer>;
}

function Shell({ children }: { children: ReactNode }) {
  return <><Header/><main>{children}</main><Footer/></>;
}

function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (p: Product) => void }) {
  const { add, wishlist, toggleWish } = useStore();
  const wished = wishlist.includes(product.id);
  return <article className="product-card" data-testid={`card-product-${product.id}`}>
    <div className="product-photo">
      <Link href={`/products/${product.id}`} aria-label={`View ${product.name}`}><Image src={productImage(product.name, product.image)} alt={`${product.name} product`} className="product-img" /></Link>
      {product.isBestseller && <span className="product-tag">Demo bestseller</span>}
      <button className={`wish-button ${wished ? 'selected' : ''}`} aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} aria-pressed={wished} onClick={() => toggleWish(product.id)}><Heart size={18} fill={wished ? 'currentColor' : 'none'} /></button>
      {onQuickView && <button className="quick-view" onClick={() => onQuickView(product)}>Quick view</button>}
    </div>
    <div className="product-copy"><div className="product-meta"><span>{product.category}</span><span>{money(product.price)}</span></div><Link href={`/products/${product.id}`} className="product-name">{product.name}</Link><p>{product.description}</p><button className="add-link" onClick={() => add(product)}><Plus size={15} /> Add to bag</button></div>
  </article>;
}

function ProductGrid({ products, onQuickView }: { products: Product[]; onQuickView?: (p: Product) => void }) {
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onQuickView={onQuickView} />)}</div>;
}

function LoadingProducts() {
  return <div className="product-grid" aria-label="Loading products">{[0, 1, 2, 3].map((i) => <div className="skeleton-product" key={i}><div className="skeleton-block"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}</div>;
}
function QueryError({ retry }: { retry: () => void }) {
  return <div className="state-panel"><span className="eyebrow">A little pause</span><h2>We couldn’t load the shelf.</h2><p>Please check your connection and give it another try.</p><button className="button button-dark" onClick={retry}>Try again</button></div>;
}

function HomePage() {
  const featuredParams = { sort: 'featured' as const };
  const query = useGetProducts(featuredParams, { query: { queryKey: getGetProductsQueryKey(featuredParams) } });
  const products = query.data || [];
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  return <div className="home">
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow">A little more you, every day</span><h1>Discover Your<br/><em>Natural Glow</em></h1><p>Skincare that meets you where you are. No rules, no noise — just feel-good things for your everyday.</p><Link href="/products" className="button button-dark">Shop Now <ArrowRight size={16}/></Link><div className="hero-footnote"><span className="hero-stroke"/> Your Glow, Your Rules.</div></div>
      <div className="hero-image"><Image src="/images/glow-theory-hero.webp" alt="Glow Theory skincare ritual in a warm cream and blush editorial setting" className="hero-photo" /><div className="hero-sticker"><span>made for</span><strong>your<br/>real life</strong><Sparkles size={17}/></div><div className="image-caption">A ritual that feels like yours.</div></div>
      <span className="hero-side-note">GLOW THEORY · SKINCARE FOR YOUR OWN KIND OF GLOW</span>
    </section>
    <section className="category-strip"><span>Good skin is personal.</span>{categories.map((category, i) => <Link key={category} href={`/products?category=${encodeURIComponent(category)}`} className={`category-link category-${i}`}>{category}<ArrowUpRight/></Link>)}</section>
    <section className="section featured-section"><div className="section-head"><div><span className="eyebrow">Picked for the everyday</span><h2>The feel-good shelf</h2></div><Link href="/products" className="under-link">Shop all products <ArrowRight size={16}/></Link></div>
      {query.isLoading ? <LoadingProducts/> : query.isError ? <QueryError retry={() => query.refetch()}/> : featured.length ? <ProductGrid products={featured}/> : <EmptyProducts/>}
    </section>
    <section className="selfcare"><div className="selfcare-shape" aria-hidden="true"><span>G</span></div><div className="selfcare-content"><span className="eyebrow">A reminder, just in case</span><h2>Self-care isn’t<br/><em>one-size-fits-all.</em></h2><p>Your routine can be three steps or one. Loud or low-key. It only has to feel like you.</p><Link href="/find-your-glow" className="button button-dark">Find your glow <ArrowRight size={16}/></Link></div><div className="selfcare-mark">01 — 04<br/><span>YOUR ROUTINE, YOUR CALL</span></div></section>
    <section className="section bestseller-section"><div className="section-head"><div><span className="eyebrow">Sample collection</span><h2>Bestsellers</h2></div><Link href="/products?bestsellers=1&sort=featured" className="under-link">See bestsellers <ArrowRight size={16}/></Link></div>
      {query.isLoading ? <LoadingProducts/> : query.isError ? <QueryError retry={() => query.refetch()}/> : bestsellers.length ? <ProductGrid products={bestsellers}/> : <EmptyProducts/>}
    </section>
    <section className="review-band"><span className="eyebrow">The good word</span><blockquote>“It feels less like fixing my skin and more like taking a minute for me.”</blockquote><div className="review-credit">A note from Maya, 19 <span>Sample review for demonstration only</span></div><div className="review-spark" aria-hidden="true">G</div></section>
    <section className="home-cta"><span className="eyebrow">Your next little ritual</span><h2>Start where you are.</h2><Link href="/products" className="button button-light">Find your favorites <ArrowRight size={16}/></Link></section>
  </div>;
}
function EmptyProducts() { return <div className="empty-panel"><Sparkles/><h3>The shelf is taking a breather.</h3><p>Check back soon for your next favorite.</p></div>; }
function ArrowUpRight() { return <ArrowRight className="arrow-up-right" size={17}/>; }

function QuickView({ product, close }: { product: Product | null; close: () => void }) {
  const { add } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!product) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previousFocus.current?.focus();
    };
  }, [product, close]);
  if (!product) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><section ref={dialogRef} className="quick-modal" role="dialog" aria-modal="true" aria-labelledby="quick-title"><button ref={closeRef} className="modal-close" aria-label="Close quick view" onClick={close}><X/></button><Image src={productImage(product.name, product.image)} alt={`${product.name} product`} className="modal-image"/><div className="modal-details"><span className="eyebrow">{product.category}</span><h2 id="quick-title">{product.name}</h2><p>{product.description}</p><strong>{money(product.price)}</strong><button className="button button-dark full-button" onClick={() => { add(product); close(); }}>Add to bag <ArrowRight size={16}/></button><Link href={`/products/${product.id}`} className="under-link">More about this one <ArrowRight size={15}/></Link></div></section></div>;
}

function ShopPage() {
  const [search, setSearch] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('search') || '');
  const [category, setCategory] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('category') || '');
  const [maxPrice, setMaxPrice] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('maxPrice') || '');
  const [sort, setSort] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('sort') || '');
  const [bestsellersOnly, setBestsellersOnly] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('bestsellers') === '1');
  const [quick, setQuick] = useState<Product | null>(null);
  const closeQuick = useCallback(() => setQuick(null), []);
  const params = useMemo<GetProductsParams>(() => ({
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(category ? { category: category as GetProductsParams['category'] } : {}),
    ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
    ...(sort ? { sort: sort as GetProductsParams['sort'] } : {}),
  }), [search, category, maxPrice, sort]);
  const query = useGetProducts(params, { query: { queryKey: getGetProductsQueryKey(params) } });
  return <div className="page-shell"><div className="page-intro shop-intro"><span className="eyebrow">A shelf for every you</span><h1>Find your<br/><em>feel-good.</em></h1><p>Good things for your skin, your bag, and your five-minute reset.</p></div>
    <section className="shop-layout"><aside className="filter-panel"><span className="filter-title">Make it yours</span><label className="field-label" htmlFor="product-search">Search the shelf</label><div className="search-box"><Search size={16}/><input id="product-search" type="search" placeholder="Try lip balm..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><label className="field-label" htmlFor="category">Category</label><select id="category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Everything</option>{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select><label className="field-label" htmlFor="max-price">Maximum price <span className="helper">KWD</span></label><input id="max-price" type="number" min="0" step="0.500" placeholder="Any price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} /><label className="field-label" htmlFor="sort">Sort by</label><select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="">Just browsing</option><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option></select><button className="reset-link" onClick={() => { setSearch(''); setCategory(''); setMaxPrice(''); setSort(''); setBestsellersOnly(false); }}>Clear all filters</button></aside>
      <div className="shop-results"><div className="results-top"><span>{query.data ? `${query.data.filter((p) => !bestsellersOnly || p.isBestseller).length} things to love` : '— things to love'}</span><Link href="/find-your-glow" className="results-quiz">Not sure? Take the glow quiz <ArrowRight size={15}/></Link></div>
        {query.isLoading ? <LoadingProducts/> : query.isError ? <QueryError retry={() => query.refetch()}/> : query.data?.filter((p) => !bestsellersOnly || p.isBestseller).length ? <ProductGrid products={query.data.filter((p) => !bestsellersOnly || p.isBestseller)} onQuickView={setQuick}/> : <div className="empty-panel"><Search/><h3>No matches this time.</h3><p>Try a different word or clear your filters.</p><button className="button button-outline" onClick={() => { setSearch(''); setCategory(''); setMaxPrice(''); setSort(''); setBestsellersOnly(false); }}>Reset filters</button></div>}
      </div>
    </section><QuickView product={quick} close={closeQuick}/>
  </div>;
}

function ProductPage() {
  const { id = '' } = useParams<{ id: string }>();
  const query = useGetProduct(id);
  const { add, wishlist, toggleWish } = useStore();
  const [added, setAdded] = useState(false);
  const wished = wishlist.includes(id);
  if (query.isLoading) return <div className="page-shell"><div className="detail-skeleton"/></div>;
  if (query.isError || !query.data) return <div className="page-shell"><QueryError retry={() => query.refetch()}/></div>;
  const p = query.data;
  return <div className="page-shell"><Link href="/products" className="back-link"><ArrowLeft size={16}/> Back to the shelf</Link><section className="product-detail"><div className="detail-visual"><Image src={productImage(p.name, p.image)} alt={`${p.name} skincare product`} className="detail-image"/>{p.isBestseller && <span className="product-tag">Demo bestseller</span>}</div><div className="detail-copy"><span className="eyebrow">{p.category}</span><h1>{p.name}</h1><strong className="detail-price">{money(p.price)}</strong><p>{p.description}</p><div className="detail-note"><Sparkles size={17}/><span>Made for your everyday — use in a way that feels right for you.</span></div><button className="button button-dark full-button" onClick={() => { add(p); setAdded(true); }}>{added ? <><Check size={17}/> Added to your bag</> : <>Add to bag <ArrowRight size={16}/></>}</button><button className="save-detail" aria-pressed={wished} onClick={() => toggleWish(id)}><Heart size={17} fill={wished ? 'currentColor' : 'none'}/>{wished ? 'Saved to your wishlist' : 'Save for later'}</button><p className="demo-note">Product information is provided by the Glow Theory catalog.</p></div></section><section className="detail-bottom"><span className="eyebrow">A little note</span><h2>Make it a ritual,<br/><em>or don’t.</em></h2><p>There’s no perfect routine to keep up with. Pick what feels good, leave what doesn’t, and let your glow be your own.</p><Link href="/find-your-glow" className="under-link">Find your glow <ArrowRight size={16}/></Link></section></div>;
}

function CartPage() {
  const { cart, setQuantity, remove } = useStore();
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  if (!cart.length) return <div className="page-shell"><div className="page-intro compact-intro"><span className="eyebrow">Your little corner</span><h1>Your bag is<br/><em>taking a break.</em></h1><p>When something feels like you, it’ll be waiting here.</p><Link href="/products" className="button button-dark">Meet the shelf <ArrowRight size={16}/></Link></div></div>;
  return <div className="page-shell"><div className="page-intro compact-intro"><span className="eyebrow">Your little corner</span><h1>The good<br/><em>stuff.</em></h1></div><div className="cart-layout"><div className="cart-lines">{cart.map(({ product, quantity }) => <article className="cart-line" key={product.id}><Link href={`/products/${product.id}`}><Image src={productImage(product.name, product.image)} alt={product.name} className="cart-image"/></Link><div className="cart-line-copy"><span className="eyebrow">{product.category}</span><Link href={`/products/${product.id}`} className="product-name">{product.name}</Link><span>{money(product.price)}</span><div className="quantity-control"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => setQuantity(product.id, quantity - 1)}><Minus size={14}/></button><span aria-live="polite">{quantity}</span><button aria-label={`Increase ${product.name} quantity`} onClick={() => setQuantity(product.id, quantity + 1)}><Plus size={14}/></button></div></div><div className="line-end"><strong>{money(product.price * quantity)}</strong><button className="remove-link" onClick={() => remove(product.id)}>Remove</button></div></article>)}</div><aside className="summary-box"><span className="eyebrow">The little tally</span><div className="summary-row"><span>Subtotal</span><strong>{money(total)}</strong></div><p>Demo checkout only; no delivery fee or charge is calculated.</p><Link href="/checkout" className="button button-dark full-button">Continue to demo checkout <ArrowRight size={16}/></Link><div className="safe-note"><LockKeyhole size={15}/> No payment details collected</div></aside></div></div>;
}

function WishlistPage() {
  const { wishlist } = useStore();
  const emptyParams: GetProductsParams = {};
  const query = useGetProducts(emptyParams, { query: { queryKey: getGetProductsQueryKey(emptyParams) } });
  const products = (query.data || []).filter((p) => wishlist.includes(p.id));
  return <div className="page-shell"><div className="page-intro compact-intro"><span className="eyebrow">Saved for later</span><h1>Your own<br/><em>little list.</em></h1><p>Favorites, without the pressure to decide right now.</p></div>{query.isLoading ? <LoadingProducts/> : query.isError ? <QueryError retry={() => query.refetch()}/> : products.length ? <ProductGrid products={products}/> : <div className="empty-panel"><Heart/><h3>Nothing saved just yet.</h3><p>Tap the heart on anything that catches your eye.</p><Link href="/products" className="button button-dark">Browse the shelf</Link></div>}</div>;
}

const quizQuestions = [
  { title: 'What sounds like your kind of glow?', choices: ['Simple and soothing', 'A pop of color', 'Soft, head-to-toe care', 'A little bit of everything'] },
  { title: 'Which shelf would you explore first?', choices: ['Everyday skincare', 'Easy lip care', 'Body care favorites', 'A ready-made set'] },
  { title: 'What kind of routine feels right?', choices: ['A few thoughtful minutes', 'One quick swipe', 'A little moment to myself', 'Keep it easy for me'] },
];
const quizCategoryForAnswer = [
  ['Skincare', 'Lip Care', 'Body Care', 'Gift Sets'],
  ['Skincare', 'Lip Care', 'Body Care', 'Gift Sets'],
  ['Skincare', 'Lip Care', 'Body Care', 'Gift Sets'],
];
function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const done = step >= quizQuestions.length;
  const emptyParams: GetProductsParams = {};
  const query = useGetProducts(emptyParams, { query: { queryKey: getGetProductsQueryKey(emptyParams) } });
  const scoreByCategory = new Map<string, number>();
  answers.forEach((answer, index) => {
    const choiceIndex = quizQuestions[index].choices.indexOf(answer);
    const category = quizCategoryForAnswer[index][Math.max(0, choiceIndex)];
    scoreByCategory.set(category, (scoreByCategory.get(category) || 0) + (index === 0 ? 2 : 1));
  });
  const selected = [...scoreByCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Skincare';
  const recommendations = (query.data || [])
    .map((product) => ({ product, score: scoreByCategory.get(product.category) || 0 }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.product.featured) - Number(a.product.featured))
    .map(({ product }) => product)
    .slice(0, 3);
  const choose = (answer: string) => { setAnswers((old) => [...old.slice(0, step), answer]); setStep(step + 1); };
  const restart = () => { setStep(0); setAnswers([]); };
  return <div className="quiz-wrap"><div className="quiz-card"><div className="quiz-header"><span className="eyebrow">The Glow Check-in</span><span className="quiz-counter">{done ? 'YOUR PICKS' : `${step + 1} / ${quizQuestions.length}`}</span></div><div className="progress-track"><span style={{ width: `${done ? 100 : step / quizQuestions.length * 100}%` }}/></div>
    {!done ? <><h1>{quizQuestions[step].title}</h1><p>There’s no wrong answer. Just go with what feels right.</p><div className="quiz-options">{quizQuestions[step].choices.map((choice, i) => <button key={choice} className="quiz-option" onClick={() => choose(choice)}><span>0{i + 1}</span>{choice}<ArrowRight size={17}/></button>)}</div><button className="quiz-back" disabled={step === 0} onClick={() => setStep(step - 1)}>Back a step</button></> : <div className="quiz-result"><div className="result-mark"><Sparkles/></div><span className="eyebrow">A direction, not a rulebook</span><h1>Your kind of glow starts with<br/><em>{selected.toLowerCase()}.</em></h1><p>These catalog picks reflect the preferences and routine you selected. Explore, mix it up, and make it yours.</p>{query.isLoading ? <LoadingProducts/> : query.isError ? <QueryError retry={() => query.refetch()}/> : recommendations.length ? <><ProductGrid products={recommendations}/><Link href={`/products/${recommendations[0].id}`} className="button button-dark">Shop this product <ArrowRight size={16}/></Link></> : <div className="empty-panel"><p>No matches in this category right now.</p></div>}<div className="quiz-result-actions"><Link href={`/products?category=${encodeURIComponent(selected)}`} className="button button-dark">Shop {selected} <ArrowRight size={16}/></Link><button className="button button-outline" onClick={restart}>Restart quiz</button></div></div>}
    <p className="quiz-disclaimer">A playful shopping guide only. Not skincare or medical advice.</p></div></div>;
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const form = e.currentTarget; if (!form.reportValidity()) return; setSent(true); setError(''); form.reset(); };
  return <div className="page-shell contact-layout"><div className="page-intro"><span className="eyebrow">Demo storefront</span><h1>Leave a<br/><em>little note.</em></h1><p>Use this form to preview how a Glow Theory contact message would work.</p><div className="contact-aside"><span>Demo form</span><strong>Messages are not sent<br/>or saved.</strong><small>This is not a live support inbox.</small></div></div><form className="form-card contact-form" onSubmit={submit}><span className="eyebrow">Drop us a line</span><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" required maxLength={100} placeholder="What should we call you?" /><label htmlFor="contact-email">Email address</label><input id="contact-email" name="email" type="email" required maxLength={254} placeholder="you@example.com" /><label htmlFor="contact-subject">What’s this about?</label><select id="contact-subject" name="subject" required defaultValue=""><option value="" disabled>Choose a topic</option><option>Product question</option><option>Order question</option><option>Something else</option></select><label htmlFor="contact-message">Your message</label><textarea id="contact-message" name="message" required minLength={8} maxLength={1500} rows={5} placeholder="Tell us a little more…" /><button className="button button-dark" type="submit">Send your note <ArrowRight size={16}/></button><p className="demo-note" aria-live="polite">{sent ? 'Thanks for your note. This demo confirms locally; nothing was sent or saved.' : error || 'Demo form — messages are not delivered or stored.'}</p></form></div>;
}

function CheckoutPage() {
  const { cart, clear } = useStore();
  const [done, setDone] = useState(false);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); if (!e.currentTarget.reportValidity()) return; clear(); setDone(true); };
  if (done) return <div className="page-shell"><div className="state-panel"><span className="eyebrow">Demo checkout</span><div className="success-mark"><Check/></div><h1>That’s all for<br/><em>this demo.</em></h1><p>No order has been placed, no payment was taken, and no details were stored.</p><div className="demo-disclaimer">This storefront does not process payments or create real orders.</div><Link href="/checkout/success" className="button button-dark">Continue <ArrowRight size={16}/></Link></div></div>;
  if (!cart.length) return <div className="page-shell"><div className="state-panel"><span className="eyebrow">Demo checkout</span><h1>Your bag is<br/><em>empty.</em></h1><Link className="button button-dark" href="/products">Browse products</Link></div></div>;
  return <div className="page-shell checkout-page"><div className="page-intro compact-intro"><span className="eyebrow">Demo checkout</span><h1>One last<br/><em>little step.</em></h1><p>This is only a demonstration. No payment details, please.</p></div><div className="checkout-layout"><form className="form-card" onSubmit={submit}><span className="eyebrow">Contact and delivery</span><label htmlFor="checkout-name">Full name</label><input id="checkout-name" required maxLength={100} placeholder="Your name" /><label htmlFor="checkout-email">Email address</label><input id="checkout-email" type="email" required maxLength={254} placeholder="you@example.com" /><label htmlFor="checkout-address">Delivery address</label><input id="checkout-address" required maxLength={200} placeholder="Street and building" /><div className="form-split"><div><label htmlFor="checkout-city">City</label><input id="checkout-city" required maxLength={80} placeholder="City" /></div><div><label htmlFor="checkout-country">Country</label><select id="checkout-country" required defaultValue=""><option value="" disabled>Select</option><option>Kuwait</option><option>Bahrain</option><option>Qatar</option><option>United Arab Emirates</option><option>Saudi Arabia</option></select></div></div><div className="demo-disclaimer"><LockKeyhole size={16}/> Demonstration only. Never enter payment details.</div><button className="button button-dark full-button" type="submit">Preview demo checkout <ArrowRight size={16}/></button><div className="checkout-cancel"><Link href="/checkout/cancel">Cancel this demo</Link></div><p className="demo-note">Continue creates no real order, transaction, or saved customer details.</p></form><aside className="summary-box"><span className="eyebrow">Your bag</span>{cart.map(({ product, quantity }) => <div className="summary-product" key={product.id}><span>{product.name} × {quantity}</span><strong>{money(product.price * quantity)}</strong></div>)}<div className="summary-row"><span>Subtotal</span><strong>{money(total)}</strong></div></aside></div></div>;
}
function CheckoutStatus({ success }: { success: boolean }) {
  return <div className="page-shell"><div className="state-panel"><span className="eyebrow">Demonstration only</span><div className={`success-mark ${success ? '' : 'cancel-mark'}`}>{success ? <Check/> : <X/>}</div><h1>{success ? <>All good,<br/><em>in demo-land.</em></> : <>Checkout<br/><em>paused.</em></>}</h1><p>{success ? 'This is a demo confirmation, not an order. No payment was made and no order was created.' : 'Nothing was charged or saved. Your cart is still yours if you want to keep browsing.'}</p><div className="demo-disclaimer">No real order or payment has been processed.</div><Link href={success ? '/' : '/cart'} className="button button-dark">{success ? 'Back to Glow Theory' : 'Return to your bag'} <ArrowRight size={16}/></Link></div></div>;
}

function AuthPage({ signup = false }: { signup?: boolean }) {
  const signupMutation = useSignUp();
  const loginMutation = useLogIn();
  const pending = signupMutation.isPending || loginMutation.isPending;
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [message, setMessage] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const complete = (user: UserProfile) => {
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      navigate('/orders');
    };
    const fail = () => setMessage('We couldn’t complete that right now. Check your details and try again.');
    if (signup) {
      const data: SignupInput = { name: String(values.get('name')).trim(), email: String(values.get('email')).trim(), password: String(values.get('password')) };
      signupMutation.mutate({ data }, { onSuccess: complete, onError: fail });
    } else {
      const data: LoginInput = { email: String(values.get('email')).trim(), password: String(values.get('password')) };
      loginMutation.mutate({ data }, { onSuccess: complete, onError: fail });
    }
  };
  return <div className="auth-wrap"><div className="auth-aside"><span className="eyebrow">Your account, your pace</span><h1>{signup ? <>A little space<br/><em>for your glow.</em></> : <>Good to see<br/><em>you again.</em></>}</h1><p>Save your favorites and keep up with your Glow Theory orders.</p><span className="auth-aside-mark">GT / 01</span></div><form className="form-card auth-form" onSubmit={submit}><span className="eyebrow">{signup ? 'Let’s get you settled' : 'Come on in'}</span><h2>{signup ? 'Create your account' : 'Sign in to Glow Theory'}</h2>{signup && <><label htmlFor="auth-name">Your name</label><input id="auth-name" name="name" required minLength={1} maxLength={100} autoComplete="name" placeholder="Your name" /></>}<label htmlFor="auth-email">Email address</label><input id="auth-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" /><label htmlFor="auth-password">Password</label><input id="auth-password" name="password" type="password" required minLength={8} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} placeholder="At least 8 characters" /><button className="button button-dark full-button" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="spin"/> One moment…</> : signup ? <>Create account <ArrowRight size={16}/></> : <>Sign in <ArrowRight size={16}/></>}</button><p className="form-feedback" aria-live="polite">{message}</p><p className="auth-switch">{signup ? 'Already have an account?' : 'New around here?'} <Link href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create one'}</Link></p></form></div>;
}

function OrdersPage() {
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const qc = useQueryClient();
  const ordersQuery = useGetMyOrders({ query: { enabled: !!user, queryKey: getGetMyOrdersQueryKey() } });
  if (userLoading) return <div className="page-shell"><div className="order-skeleton"/></div>;
  if (!user) return <div className="page-shell"><div className="state-panel"><span className="eyebrow">Your account</span><h1>Good things<br/><em>are waiting.</em></h1><p>Sign in to see the orders linked to your account.</p><Link href="/login" className="button button-dark">Sign in <ArrowRight size={16}/></Link></div></div>;
  return (
    <div className="page-shell">
      <div className="page-intro compact-intro">
        <span className="eyebrow">Your account · {user.name}</span>
        <h1>Order<br/><em>notes.</em></h1>
        <p>Your Glow Theory order history, all in one place.</p>
      </div>
      <DatabaseCheckButton />
      {ordersQuery.isLoading ? <div className="order-skeleton"/> : ordersQuery.isError ? (
        <QueryError retry={() => { qc.invalidateQueries({ queryKey: getGetMyOrdersQueryKey() }); }}/>
      ) : ordersQuery.data?.length ? (
        <div className="orders-list">
          {ordersQuery.data.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-top">
                <div><span className="eyebrow">Order {order.id}</span><h2>{new Date(order.createdAt).toLocaleDateString()}</h2></div>
                <span className={`status-pill status-${order.status}`}>{order.status}</span>
                <strong>{money(order.total)}</strong>
              </div>
              <div className="order-products">
                {order.items.map((item) => (
                  <div className="order-item" key={`${order.id}-${item.productId}`}>
                    <Image src={productImage(item.name, item.image)} alt={item.name} className="order-thumb"/>
                    <span>{item.name}</span>
                    <small>× {item.quantity}</small>
                    <strong>{money(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <ShoppingBag/><h3>No order notes yet.</h3>
          <p>Once you’ve found a favorite, it’ll show up here.</p>
          <Link href="/products" className="button button-dark">Browse the shelf</Link>
        </div>
      )}
    </div>
  );
}

function NotFound() { return <div className="state-panel"><span className="eyebrow">Wrong turn</span><h1>That page<br/><em>isn’t here.</em></h1><Link href="/" className="button button-dark">Back to home <ArrowRight size={16}/></Link></div>; }

function RoutedApp() {
  const [path] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [path]);
  return <Shell><Switch>
    <Route path="/" component={HomePage}/>
    <Route path="/products" component={ShopPage}/>
    <Route path="/products/:id" component={ProductPage}/>
    <Route path="/cart" component={CartPage}/>
    <Route path="/wishlist" component={WishlistPage}/>
    <Route path="/find-your-glow" component={QuizPage}/>
    <Route path="/contact" component={ContactPage}/>
    <Route path="/checkout" component={CheckoutPage}/>
    <Route path="/checkout/success"><CheckoutStatus success/></Route>
    <Route path="/checkout/cancel"><CheckoutStatus success={false}/></Route>
    <Route path="/login"><AuthPage/></Route>
    <Route path="/signup"><AuthPage signup/></Route>
    <Route path="/orders" component={OrdersPage}/>
    <Route component={NotFound}/>
  </Switch></Shell>;
}

function App() {
  return <QueryClientProvider client={client}><StoreProvider><RoutedApp/></StoreProvider></QueryClientProvider>;
}

export default App;
