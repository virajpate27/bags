
import Link from "next/link";
import {
  Menu,
  Search,
  UserRound,
  Store,
  ChevronDown,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Suppliers", href: "/suppliers" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900">
          Trade<span className="text-amber-500">Bridge</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-amber-600"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <UserRound size={17} />
            Login
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-500"
          >
            <Store size={17} />
            Start Selling
          </Link>
        </div>

        {/* Mobile Navigation */}
        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700">
            <Menu size={22} />
          </summary>

          <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {item.name}
                </Link>
              ))}

              <hr className="my-2 border-slate-200" />

              <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100">
                Login
              </Link>

              <Link href="/register" className="rounded-lg bg-amber-400 px-3 py-2.5 text-center text-sm font-semibold text-slate-950">
                Start Selling
              </Link>
            </nav>
          </div>
        </details>

      </div>
    </header>
  );
}
