import SectionTitle from "../components/section-title";
import { motion } from "framer-motion";

export default function OurTestimonials() {
    const reviews = [
        {
            review: "The team delivered our web system on time with excellent quality. Communication was smooth and professional throughout.",
            name: "Richard Nelson",
            role: "Business Owner",
            rating: 5,
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
        },
        {
            review: "Outstanding UI/UX design work. The final product looks modern, clean, and user-friendly.",
            name: "Sophia Martinez",
            role: "Startup Founder",
            rating: 5,
            image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
        },
        {
            review: "They handled our mobile app and backend perfectly. Very knowledgeable and reliable IT professionals.",
            name: "Ethan Roberts",
            role: "Project Manager",
            rating: 4,
            image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        },
        {
            review: "Great experience working with this team. Their AI solution helped automate key business processes.",
            name: "Isabella Kim",
            role: "Operations Lead",
            rating: 5,
            image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
        },
        {
            review: "Very professional service. They clearly understood our requirements and delivered beyond expectations.",
            name: "Liam Johnson",
            role: "IT Consultant",
            rating: 4,
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop",
        },
        {
            review: "Reliable, skilled, and easy to work with. Highly recommended for any IT-related projects.",
            name: "Ava Patel",
            role: "Entrepreneur",
            rating: 5,
            image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage1.png",
        },
    ];

    return (
        <section className="flex flex-col items-center" id="testimonials">
            <SectionTitle
                title="Client Reviews & Ratings"
                description="Trusted by businesses and individuals for delivering high-quality IT solutions and services."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-18 max-w-6xl mx-auto">
                {reviews.map((review, index) => (
                    <motion.div
                        key={review.name}
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
                        {/* Rating */}
                        <div className="flex gap-1 mb-3">
                            {Array.from({ length: review.rating }).map((_, i) => (
                                <span key={i} className="text-yellow-400 text-sm">★</span>
                            ))}
                            {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                <span key={i} className="text-slate-600 text-sm">★</span>
                            ))}
                        </div>

                        {/* Review */}
                        <p className="text-slate-100 text-base">
                            “{review.review}”
                        </p>

                        {/* User */}
                        <div className="flex items-center gap-3 mt-8 group-hover:-translate-y-1 duration-300">
                            <img
                                className="size-10 rounded-full"
                                src={review.image}
                                alt="user image"
                            />
                            <div>
                                <h2 className="text-gray-200 font-medium">
                                    {review.name}
                                </h2>
                                <p className="text-indigo-500 text-sm">
                                    {review.role}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
