
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <WhyChooseUs />

        {/* Seller CTA */}
        <section className="bg-amber-400 py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-950">
                Grow Your Business With TradeBridge
              </h2>
              <p className="mt-3 text-sm text-slate-800">
                Join our marketplace and connect with potential buyers.
              </p>
            </div>

            <a
              href="/register"
              className="rounded-lg bg-slate-950 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Register Your Business →
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
