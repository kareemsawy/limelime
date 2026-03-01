"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.itemCount());
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl tracking-wide">Limelime</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">Shop</Link>
          <Link href="/category/vases" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">Vases</Link>
          <Link href="/category/cushions" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">Cushions</Link>
          <Link href="/category/candles" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">Candles</Link>
        </nav>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="hidden md:flex items-center gap-4">
              {["ADMIN", "MANAGER", "SUPPORT"].includes(session.user.role) && (
                <Link href="/admin" className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900">Admin</Link>
              )}
              <Link href="/account/orders" className="text-stone-600 hover:text-stone-900"><User size={20} /></Link>
              <button onClick={() => signOut()} className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900">Sign out</button>
            </div>
          ) : (
            <Link href="/auth/login" className="hidden md:block text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900">Sign in</Link>
          )}

          <Link href="/cart" className="relative text-stone-600 hover:text-stone-900">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-stone-900 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>

          <button className="md:hidden text-stone-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 py-4 space-y-4">
          <Link href="/shop" className="block text-sm text-stone-700" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/category/vases" className="block text-sm text-stone-700" onClick={() => setMenuOpen(false)}>Vases</Link>
          <Link href="/category/cushions" className="block text-sm text-stone-700" onClick={() => setMenuOpen(false)}>Cushions</Link>
          <Link href="/category/candles" className="block text-sm text-stone-700" onClick={() => setMenuOpen(false)}>Candles</Link>
          {session?.user
            ? <button onClick={() => signOut()} className="block text-sm text-stone-700">Sign out</button>
            : <Link href="/auth/login" className="block text-sm text-stone-700" onClick={() => setMenuOpen(false)}>Sign in</Link>
          }
        </div>
      )}
    </header>
  );
}
