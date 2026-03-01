import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-24">
      <div className="container mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-serif text-white text-xl mb-4">Limelime</p>
          <p className="text-sm text-stone-400 leading-relaxed">Considered home objects for the modern interior.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-4">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link href="/category/vases" className="hover:text-white transition-colors">Vases</Link></li>
            <li><Link href="/category/cushions" className="hover:text-white transition-colors">Cushions</Link></li>
            <li><Link href="/category/candles" className="hover:text-white transition-colors">Candles</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-4">Help</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/account/orders" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><span className="text-stone-500">Shipping Info</span></li>
            <li><span className="text-stone-500">Returns</span></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-4">Newsletter</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-stone-800 px-6 py-4 text-center text-xs text-stone-600">
        © {new Date().getFullYear()} Limelime. All rights reserved.
      </div>
    </footer>
  );
}

function NewsletterForm() {
  return (
    <form action="/api/newsletter" method="POST" className="flex gap-2">
      <input type="email" name="email" placeholder="your@email.com" required
        className="flex-1 bg-stone-800 border border-stone-700 text-white text-sm px-3 py-2 placeholder-stone-500 focus:outline-none focus:border-stone-500 min-w-0" />
      <button type="submit" className="bg-white text-stone-900 px-3 py-2 text-xs uppercase tracking-widest hover:bg-stone-200 transition-colors whitespace-nowrap">
        Join
      </button>
    </form>
  );
}
