import SectionTitle from "../components/section-title";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Stars({ rating = 0 }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <div className="flex gap-1 mb-3">
      {Array.from({ length: r }).map((_, i) => (
        <span key={`f-${i}`} className="text-yellow-400 text-sm">
          ★
        </span>
      ))}
      {Array.from({ length: 5 - r }).map((_, i) => (
        <span key={`e-${i}`} className="text-slate-600 text-sm">
          ★
        </span>
      ))}
    </div>
  );
}

export default function OurTestimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendBase = useMemo(() => {
    const base = import.meta.env.VITE_BACKEND_URL || "";
    return base.endsWith("/") ? base.slice(0, -1) : base;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchApproved() {
      try {
        setLoading(true);

        // ✅ Recommended: backend should expose a public endpoint:
        // GET /api/feedbacks/public -> { message, data: [...] }
        const res = await axios.get(`${backendBase}/api/feedbacks/`);

        const list = Array.isArray(res.data?.data) ? res.data.data : [];

        // Extra safety: even if backend returns mixed, keep only approved
        const approvedOnly = list.filter((x) => x?.status === "approved");

        if (mounted) setReviews(approvedOnly);
      } catch (e) {
        console.error("Fetch approved feedbacks error:", e);
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchApproved();
    return () => {
      mounted = false;
    };
  }, [backendBase]);

  return (
    <section className="flex flex-col items-center" id="testimonials">
      <SectionTitle
        title="Client Reviews & Ratings"
        description="Trusted by businesses and individuals for delivering high-quality IT solutions and services."
      />

      {loading ? (
        <div className="w-full max-w-6xl mx-auto mt-18">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-slate-800 p-6 rounded-xl animate-pulse"
              >
                <div className="h-4 w-24 bg-slate-800 rounded mb-4" />
                <div className="h-4 w-full bg-slate-800 rounded mb-2" />
                <div className="h-4 w-10/12 bg-slate-800 rounded mb-2" />
                <div className="h-4 w-9/12 bg-slate-800 rounded" />
                <div className="flex items-center gap-3 mt-8">
                  <div className="size-10 bg-slate-800 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-slate-800 rounded" />
                    <div className="h-3 w-20 bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-10 text-slate-400 text-sm">
          No reviews yet. Be the first to leave feedback.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-18 max-w-6xl mx-auto">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id || `${review.name}-${index}`}
              className="group border border-slate-800 p-6 rounded-xl"
              initial={{ y: 150, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.15,
                type: "spring",
                stiffness: 320,
                damping: 70,
                mass: 1,
              }}
            >
              <Stars rating={review.rating} />

              <p className="text-slate-100 text-base">“{review.message}”</p>

              <div className="flex items-center gap-3 mt-8 group-hover:-translate-y-1 duration-300">
                <img
                  className="size-10 rounded-full"
                  src={
                    review.image ||
                    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage1.png"
                  }
                  alt="user"
                />
                <div>
                  <h2 className="text-gray-200 font-medium">{review.name}</h2>
                  <p className="text-indigo-500 text-sm">
                    {/* Your DB doesn't store role, so keep a clean label */}
                    Verified Client
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
