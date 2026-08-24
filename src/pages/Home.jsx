import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Sparkles } from "lucide-react";
import { getProducts, getCategories } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductGrid from "../components/ProductGrid";
import LoadingSkeleton from "../components/LoadingSkeleton";
import usePageTitle from "../hooks/usePageTitle";
import { getRecentlyViewed } from "../utils/recentlyViewed";

const FEATURES = [
  { icon: Truck, title: "Free Shipping", desc: "On every order, no minimum spend required." },
  { icon: ShieldCheck, title: "Secure Checkout", desc: "Your data is encrypted and never shared." },
  { icon: RefreshCcw, title: "Easy Returns", desc: "30-day hassle-free return window." },
  { icon: Sparkles, title: "Curated Quality", desc: "Every product vetted for quality and value." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recentlyViewed] = useState(getRecentlyViewed);

  usePageTitle(
    null,
    "Shop the future of retail — a premium product marketplace with real-time search, categories and checkout."
  );

  useEffect(() => {
    getProducts({ limit: 8, sortBy: "rating", order: "desc" })
      .then((data) => setFeatured(data.products))
      .catch(() => setFeatured([]));
    getCategories()
      .then((data) => setCategories(data.slice(0, 8)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-overlay/10 bg-overlay/5 px-4 py-1.5 text-xs font-medium text-base-300"
          >
            <Sparkles size={13} className="text-accent-400" /> Real REST API &middot; Live inventory
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold leading-tight text-base-100 sm:text-6xl"
          >
            Shop the <span className="text-gradient">future</span> of retail
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base text-base-400"
          >
            A premium, animated product catalog with real-time search, categories and a full checkout experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/products"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent2-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition hover:opacity-90"
            >
              Shop Now <ArrowRight size={16} />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="rounded-xl border border-overlay/15 px-7 py-3 text-sm font-semibold text-base-100 transition hover:border-overlay/30 hover:bg-overlay/5"
              >
                Create Account
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
        >
          <h2 className="mb-6 text-xl font-extrabold text-base-100 sm:text-2xl">Shop by Category</h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="shrink-0 rounded-xl border border-overlay/8 bg-base-900 px-5 py-4 capitalize text-sm font-medium text-base-300 transition hover:-translate-y-0.5 hover:border-accent-500/40 hover:text-base-100"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Featured products */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="mx-auto max-w-7xl px-4 py-4 sm:px-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-base-100 sm:text-2xl">Top Rated Picks</h2>
          <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-accent-400 hover:text-accent-300">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {featured === null ? <LoadingSkeleton count={4} /> : <ProductGrid products={featured} />}
      </motion.section>

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-4 py-4 sm:px-6"
        >
          <h2 className="mb-6 text-xl font-extrabold text-base-100 sm:text-2xl">Recently Viewed</h2>
          <ProductGrid products={recentlyViewed} />
        </motion.section>
      )}

      {/* Feature highlights */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 text-center transition hover:-translate-y-1">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-accent2-500/20">
                <f.icon size={22} className="text-accent-400" />
              </span>
              <h3 className="text-sm font-bold text-base-100">{f.title}</h3>
              <p className="mt-1 text-xs text-base-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
