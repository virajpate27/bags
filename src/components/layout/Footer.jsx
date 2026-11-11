
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">

        <div>
          <Link href="/" className="text-2xl font-bold text-white">
            Trade<span className="text-amber-400">Bridge</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
            Connecting buyers with trusted manufacturers, wholesalers,
            distributors and suppliers across India.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-amber-400">Home</Link></li>
            <li><Link href="/products" className="hover:text-amber-400">Products</Link></li>
            <li><Link href="/categories" className="hover:text-amber-400">Categories</Link></li>
            <li><Link href="/suppliers" className="hover:text-amber-400">Suppliers</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">For Businesses</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/register" className="hover:text-amber-400">Become a Seller</Link></li>
            <li><Link href="/post-requirement" className="hover:text-amber-400">Post a Requirement</Link></li>
            <li><Link href="/login" className="hover:text-amber-400">Seller Login</Link></li>
            <li><Link href="/about" className="hover:text-amber-400">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Contact Us</h3>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-amber-400" />
              India
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-amber-400" />
              support@tradebridge.in
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-amber-400" />
              Contact details coming soon
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:px-6 md:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} TradeBridge. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
