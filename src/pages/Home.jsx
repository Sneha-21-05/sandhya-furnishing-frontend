import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { getImageUrl } from "../utils/imageUtils";

const Home = () => {
  const navigate = useNavigate();
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data } = await api.get("/products/latest");
        setLatestProducts(data.products || []);
      } catch (err) {
        console.log("Latest product API error:", err);
      }
    };
    fetchLatest();
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white">

        {/* ================= HERO ================= */}
        <section className="px-6 md:px-16 mb-12">
          <div className="relative w-full h-[420px] md:h-[580px] rounded-2xl overflow-hidden shadow-2xl mt-8">

            <img
              src="/images/homebanner.png"
              className="w-full h-full object-cover"
              alt="Home Banner"
            />

            <div className="absolute inset-0 bg-black/50 hover:bg-black/40 transition-colors duration-500"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-wide drop-shadow-md">
                Premium Furnishings
              </h1>

              <p className="mt-8 max-w-2xl text-lg md:text-xl text-gray-100 font-light tracking-wide drop-shadow-sm">
                Upgrade your living space with our exclusive collection of bespoke textiles and custom design services.
              </p>

              <button
                onClick={() => navigate("/user/dashboard")}
                className="mt-10 px-10 py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white font-medium rounded-sm transition duration-300 shadow-md text-lg tracking-widest uppercase text-sm"
              >
                Shop Collection
              </button>
            </div>
          </div>
        </section>

        {/* ================= TRUST BADGES ================= */}
        <section className="px-6 md:px-16 mb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-gray-100">
            {[
              { title: "Premium Fabrics", desc: "Sourced globally", icon: "✨" },
              { title: "Bespoke Design", desc: "Custom measurements", icon: "✂️" },
              { title: "Expert Installation", desc: "Professional service", icon: "🛠️" },
              { title: "Secure Checkout", desc: "100% protected", icon: "🔒" },
            ].map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <span className="text-3xl mb-3 grayscale group-hover:grayscale-0 transition duration-300">{badge.icon}</span>
                <h4 className="text-slate-800 font-semibold tracking-wide uppercase text-sm">{badge.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= SHOP BY ROOM ================= */}
        <section className="px-6 md:px-16 mb-28 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-blue-600 font-semibold tracking-widest uppercase text-sm mb-2">Curated Spaces</p>
              <h2 className="text-3xl md:text-4xl font-light text-slate-800 tracking-wide">
                Shop by Room
              </h2>
            </div>
            <button className="hidden md:block text-slate-500 hover:text-blue-600 transition tracking-wide text-sm font-medium">
              View All Spaces →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Living Room", img: "/images/sofa.jpg", span: "lg:col-span-2" },
              { name: "Bedroom Focus", img: "/images/mattress.jpg", span: "lg:col-span-1" },
              { name: "Window Styling", img: "/images/curtain.jpg", span: "lg:col-span-1" },
              { name: "Dining & Accents", img: "/images/pillow.jpg", span: "lg:col-span-2" },
            ].map((room, index) => (
              <div
                key={index}
                className={`relative h-[300px] md:h-[400px] rounded-xl overflow-hidden group cursor-pointer ${room.span}`}
              >
                <img
                  src={room.img}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                  alt={room.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition duration-300"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-white text-2xl font-light tracking-wide">{room.name}</h3>
                  <p className="text-gray-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition duration-300 transform translate-y-2 group-hover:translate-y-0">
                    Explore collection
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= OUR SERVICES (BESPOKE) ================= */}
        <section className="bg-slate-50 py-24 mb-24">
          <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-white shadow-lg rounded-2xl transform -rotate-2"></div>
              <img
                src="/images/curtain.jpg"
                alt="Bespoke Services"
                className="relative w-full h-[500px] object-cover rounded-xl shadow-md grayscale hover:grayscale-0 transition duration-700"
              />
            </div>

            <div className="lg:w-1/2">
              <p className="text-blue-600 font-semibold tracking-widest uppercase text-sm mb-4">Tailored to You</p>
              <h2 className="text-3xl md:text-5xl font-light text-slate-800 leading-tight mb-8">
                Bespoke Design &<br />Custom Fittings
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-10 font-light">
                Every home is unique. That's why we offer personalized consultations and custom measurements
                to ensure your furnishings fit perfectly. From selection to installation, our experts handle every detail.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  "In-home design consultation",
                  "Precise custom measurements",
                  "Extensive fabric library access",
                  "Professional installation"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700">
                    <svg className="w-5 h-5 text-blue-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/book-consultation")}
                className="px-8 py-3 bg-slate-900 hover:bg-blue-600 text-white font-medium rounded-sm transition duration-300 tracking-wide text-sm uppercase"
              >
                Book Consultation
              </button>
            </div>
          </div>
        </section>

        {/* ================= LATEST ARRIVALS ================= */}
        <section className="px-6 md:px-16 mb-28 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-blue-600 font-semibold tracking-widest uppercase text-sm mb-2">New In</p>
              <h2 className="text-3xl md:text-4xl font-light text-slate-800 tracking-wide">
                Latest Arrivals
              </h2>
            </div>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="hidden md:block text-slate-500 hover:text-blue-600 transition tracking-wide text-sm font-medium"
            >
              Shop All →
            </button>
          </div>

          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {latestProducts.slice(0, 4).map((item) => (
                <div
                  key={item._id}
                  onClick={() =>
                    navigate(`/product/${item.category?.name?.toLowerCase().trim()}/${item._id}`)
                  }
                  className="group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-xl mb-4 h-64 bg-gray-50 border border-gray-100 relative">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300"></div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800 group-hover:text-blue-600 transition">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 capitalize">{item.category?.name || 'Home'}</p>
                    </div>
                    <p className="text-slate-800 font-semibold">
                      ₹{item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-10 text-center border border-gray-100">
              <p className="text-gray-500">No latest products found at the moment. Check back soon!</p>
            </div>
          )}
        </section>

        {/* Testimonials section remains below */}

        {/* ================= TESTIMONIALS ================= */}
        <section className="px-6 md:px-16 mb-24">
          <div className="bg-white rounded-2xl shadow-sm p-12">

            <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-slate-800">
              Customer Testimonials
            </h2>

            <Swiper
              autoplay={{ delay: 2500 }}
              loop={true}
              modules={[Autoplay]}
              className="max-w-3xl mx-auto"
            >
              {[
                { text: "Absolutely loved the curtains and sofa work!", name: "Sneha Gupta" },
                { text: "Fast delivery, great finishing. Highly recommended!", name: "Rohan Sharma" },
                { text: "Mattress quality is top-notch!", name: "Priya Singh" },
              ].map((review, index) => (
                <SwiperSlide key={index}>
                  <div className="bg-gray-50 border border-gray-200 p-10 rounded-xl text-center">
                    <p className="text-lg italic text-slate-700">
                      “{review.text}”
                    </p>
                    <p className="mt-6 font-medium text-blue-600">
                      – {review.name}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

          </div>
        </section>

      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-8 md:px-20">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Sandhya Furnishing
            </h3>
            <p className="leading-relaxed">
              Premium curtains, sofas, mattress & home interior solutions crafted with expert workmanship.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>Help & Support</li>
              <li>Track Order</li>
              <li>Returns</li>
              <li>Shipping Info</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2">
              <li>Curtains</li>
              <li>Sofas</li>
              <li>Mattress</li>
              <li>Bedding</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p>Mumbai, India</p>
            <p>Phone: +91 8097258655</p>
            <p>Email: support@sandhyafurnishing.com</p>
          </div>

        </div>

        <div className="border-t border-slate-700 mt-12 pt-6 text-center text-sm">
          © {new Date().getFullYear()} Sandhya Furnishing. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Home;