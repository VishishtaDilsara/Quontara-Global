import SectionTitle from "../components/section-title";
import { ArrowUpRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function AddRatings() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = 500 - message.length;

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      rating >= 1 &&
      rating <= 5 &&
      message.trim().length >= 5 &&
      message.length <= 500
    );
  }, [name, rating, message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      rating,
      message: message.trim(),
    };

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/feedbacks",
        payload,
      );

      toast.success(res?.data?.message || "Feedback submitted successfully!");

      setName("");
      setRating(0);
      setHoverRating(0);
      setMessage("");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast.error(err?.response?.data?.message || "Error submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col items-center -mt-20" id="feedback">
      <SectionTitle
        title="Leave a Feedback"
        description="Your rating helps us improve our services."
      />

      <form
        onSubmit={handleSubmit}
        className="grid sm:grid-cols-2 gap-3 sm:gap-5 max-w-3xl mx-auto text-slate-400 mt-16 w-full"
      >
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          <label className="font-medium text-slate-200">Your name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full mt-2 p-3 outline-none border border-slate-700 rounded-lg focus-within:ring-1 transition focus:ring-indigo-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </motion.div>

        <motion.div
          initial={{ y: 150, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
        >
          <label className="font-medium text-slate-200">Rating</label>

          <div className="w-full mt-2 p-3 border border-slate-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hoverRating || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    className="active:scale-95 transition"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                    aria-label={`Rate ${n} stars`}
                  >
                    <Star
                      className={`size-6 ${
                        active
                          ? "text-yellow-300 fill-yellow-300"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <span className="text-sm text-slate-300/80">
              {rating ? `${rating}/5` : "Select"}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="sm:col-span-2"
          initial={{ y: 150, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          <label className="font-medium text-slate-200">Your Feedback</label>
          <textarea
            rows={7}
            placeholder="Share your experience (max 500 characters)"
            className="resize-none w-full mt-2 p-3 outline-none rounded-lg focus-within:ring-1 transition focus:ring-indigo-600 border border-slate-700"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
          <div className="flex justify-end mt-2 text-xs text-slate-300/70">
            {remaining} left
          </div>
        </motion.div>

        <motion.button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full sm:w-max flex justify-center  items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full"
          initial={{ y: 150, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
          <ArrowUpRight className="size-4.5" />
        </motion.button>
      </form>
    </section>
  );
}
