import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, Loader2, MessageSquareText } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; // e.g. http://localhost:5000

export default function AddRatings() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", text: "" }

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      rating >= 1 &&
      rating <= 5 &&
      message.trim().length >= 5 &&
      message.length <= 500
    );
  }, [name, rating, message]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          rating: Number(rating),
          message: message.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to submit feedback");

      showToast(
        "success",
        "Thanks! Your feedback was submitted and will appear after approval."
      );

      setName("");
      setRating(0);
      setHover(0);
      setMessage("");
    } catch (err) {
      showToast("error", err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative w-full">
      {/* subtle glow like your hero */}
      <motion.div
        className="absolute -z-10 inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] rounded-full bg-indigo-500/10 blur-3xl" />
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-14 md:py-16">
        {/* pill */}
        <motion.div
          className="flex items-center gap-2 border border-slate-600 text-gray-50 rounded-full px-4 py-2 w-fit"
          initial={{ y: -16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 320,
            damping: 70,
            mass: 1,
          }}
        >
          <div className="size-2.5 bg-green-500 rounded-full animate-pulse" />
          <span>Feedback & Ratings</span>
        </motion.div>

        {/* title */}
        <motion.h2
          className="text-4xl md:text-5xl font-semibold mt-4 leading-tight text-center"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          Rate our service ✨
        </motion.h2>

        <motion.p
          className="text-center text-base md:text-lg text-slate-200/90 max-w-2xl mx-auto mt-2"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 320,
            damping: 70,
            mass: 1,
          }}
        >
          Quick rating + a short message helps us improve faster.
        </motion.p>

        {/* card */}
        <motion.div
          className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl overflow-hidden"
          initial={{ y: 25, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 60 }}
        >
          {/* top bar */}
          <div className="p-6 md:p-8 border-b border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
              <MessageSquareText className="size-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">
                Share your feedback
              </h3>
              <p className="text-sm text-slate-200/70">
                Max 500 characters • 1–5 stars
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-5">
            {/* name */}
            <div>
              <label className="text-sm text-slate-200">Your name</label>
              <input
                className="mt-2 w-full h-11 rounded-2xl bg-black/20 border border-white/10 px-4 text-white outline-none focus:border-indigo-500/70"
                placeholder="e.g. Kavishanka"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
            </div>

            {/* stars */}
            <div>
              <label className="text-sm text-slate-200">Rating</label>

              <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = (hover || rating) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        className="active:scale-95 transition"
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(n)}
                        aria-label={`Set rating ${n}`}
                      >
                        <Star
                          className={`size-8 ${
                            active
                              ? "text-yellow-300 fill-yellow-300"
                              : "text-slate-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-sm text-slate-200/90">
                  {rating ? (
                    <span>
                      Selected:{" "}
                      <span className="text-white font-semibold">
                        {rating}/5
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-300/80">
                      Click a star to rate
                    </span>
                  )}
                </div>
              </div>

              {/* tiny helper */}
              <div className="mt-3 grid grid-cols-5 gap-2 text-[11px] text-slate-300/70">
                <div className="text-center">Bad</div>
                <div className="text-center">Ok</div>
                <div className="text-center">Good</div>
                <div className="text-center">Great</div>
                <div className="text-center">Excellent</div>
              </div>
            </div>

            {/* message */}
            <div>
              <label className="text-sm text-slate-200">Message</label>
              <textarea
                className="mt-2 w-full min-h-[120px] rounded-2xl bg-black/20 border border-white/10 p-4 text-white outline-none focus:border-indigo-500/70 resize-none"
                placeholder="What did you like? What should we improve?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-slate-300/70 mt-2">
                <span>Keep it short and clear.</span>
                <span>{message.length}/500</span>
              </div>
            </div>

            {/* button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className={`w-full h-12 rounded-2xl px-5 flex items-center justify-center gap-2 text-white transition active:scale-95
                ${
                  !canSubmit || submitting
                    ? "bg-indigo-600/40 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-5" />
                    Submit feedback
                  </>
                )}
              </button>

              <p className="text-xs text-slate-300/70 mt-3 text-center">
                Your feedback will be shown after admin approval.
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl px-4 py-3 border shadow-lg backdrop-blur-md
          ${
            toast.type === "success"
              ? "bg-green-500/15 border-green-500/30 text-green-100"
              : "bg-red-500/15 border-red-500/30 text-red-100"
          }`}
        >
          <p className="text-sm font-medium">{toast.text}</p>
        </div>
      )}
    </section>
  );
}
