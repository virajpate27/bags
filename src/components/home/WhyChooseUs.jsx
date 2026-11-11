
import { Search, Handshake, ShieldCheck, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Easy Product Discovery",
    description: "Find products and suppliers across different industries.",
  },
  {
    icon: Handshake,
    title: "Business Connections",
    description: "Connect with manufacturers, wholesalers and distributors.",
  },
  {
    icon: ShieldCheck,
    title: "Supplier Information",
    description: "Explore supplier profiles and available business information.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Discover new opportunities and reach potential business partners.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
            Why TradeBridge
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            A Better Way to Connect Businesses
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            A simple platform to discover products, explore suppliers and
            connect with businesses.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Icon size={25} />
                </div>
                <h3 className="mt-5 font-bold text-slate-900">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
