
import Link from "next/link";
import {
  Factory,
  Lightbulb,
  Sofa,
  Shirt,
  Package,
  Truck,
  Wrench,
  FlaskConical,
} from "lucide-react";

const categories = [
  { name: "Industrial Machinery", icon: Factory },
  { name: "Electronics", icon: Lightbulb },
  { name: "Furniture", icon: Sofa },
  { name: "Textiles", icon: Shirt },
  { name: "Packaging", icon: Package },
  { name: "Automobile Parts", icon: Truck },
  { name: "Tools & Hardware", icon: Wrench },
  { name: "Chemicals", icon: FlaskConical },
];

export default function CategorySection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
              Browse by industry
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Popular Categories
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Explore products across industries.
            </p>
          </div>

          <Link href="/categories" className="hidden text-sm font-semibold text-slate-900 hover:text-amber-600 sm:inline-flex">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                href={`/categories?name=${encodeURIComponent(category.name)}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-400 group-hover:text-slate-950">
                  <Icon size={25} />
                </div>

                <h3 className="mt-5 text-sm font-bold text-slate-800">
                  {category.name}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  Explore products →
                </p>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
