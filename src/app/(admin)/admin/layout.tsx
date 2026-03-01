import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit Log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "MANAGER", "SUPPORT"].includes(session.user.role)) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-stone-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-stone-700">
          <p className="font-serif text-xl">Limelime</p>
          <p className="text-xs text-stone-400 mt-1">Admin Panel</p>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="block px-3 py-2 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-700">
          <p className="text-xs text-stone-400">{session.user.email}</p>
          <p className="text-xs text-stone-500">{session.user.role}</p>
        </div>
      </aside>
      {/* Main content */}
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  );
}
