import React, { useEffect, useState } from "react";
import api from "../api"; // axios instance
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  // Fetch services from backend
  useEffect(() => {
    api
      .get("/services/all")
      .then((res) => setServices(res.data.services || []))
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white font-sans text-slate-800">

        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full h-[40vh] md:h-[50vh] flex items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/images/curtain.jpg"
              alt="Our Services"
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 text-center px-6">
            <h1 className="text-4xl md:text-6xl font-light text-white tracking-wide mb-4 drop-shadow-lg">
              Our Services
            </h1>
            <p className="text-gray-200 text-lg max-w-2xl mx-auto font-light tracking-wide">
              Bespoke solutions and expert craftsmanship tailored specifically for your home.
            </p>
          </div>
        </section>

        {/* ================= DYNAMIC SERVICES GRID ================= */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold tracking-widest uppercase text-sm mb-2">What We Offer</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-wide text-slate-900">
              Premium Furnishing Solutions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.length > 0 ? (
              services.map((item, index) => (
                <div
                  key={index}
                  className="group rounded-2xl overflow-hidden bg-slate-50 hover:bg-white border border-transparent hover:border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image_url || "/images/sofa.jpg"}
                      alt={item.service_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                    {item.price && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold text-slate-900 shadow-sm">
                        Starts at ₹{item.price}
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-medium text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {item.service_name}
                    </h3>
                    <p className="text-gray-500 font-light leading-relaxed flex-grow mb-6">
                      {item.description || "Experience our premium and tailored services to elevate your living spaces."}
                    </p>
                    <button
                      onClick={() => navigate("/book-consultation")}
                      className="flex items-center text-sm font-semibold tracking-wide uppercase text-slate-900 group-hover:text-blue-600 transition-colors"
                    >
                      Book Now <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-lg">Loading our premium services...</p>
              </div>
            )}
          </div>
        </section>

        {/* ================= OUR PROCESS ================= */}
        <section className="bg-slate-900 py-24 px-6 md:px-16 text-white text-center">
          <div className="max-w-6xl mx-auto">
            <p className="text-blue-400 font-semibold tracking-widest uppercase text-sm mb-4">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-light mb-16 tracking-wide">
              The Sandhya Experience
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
              {[
                { step: "01", title: "Consultation", desc: "Discuss your vision and requirements with our design experts." },
                { step: "02", title: "Measurement", desc: "Precise measurements taken at your home for a perfect fit." },
                { step: "03", title: "Craftsmanship", desc: "Custom tailoring and manufacturing with premium materials." },
                { step: "04", title: "Installation", desc: "Professional fitting and installation by our dedicated team." }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-light text-blue-400 mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm font-light max-w-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ================= ALL SERVICES LISTING ================= */}
        <section className="bg-white py-24 px-6 md:px-16 text-slate-800 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
              <p className="text-blue-600 font-semibold tracking-widest uppercase text-sm mb-2">Our Expertise</p>
              <h2 className="text-3xl md:text-5xl font-light tracking-wide text-slate-900">
                Comprehensive Services
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { title: "Custom Sofas", desc: "Tailor-made sofas designed specifically for your space, style, and comfort preferences.", icon: "🛋️" },
                 { title: "Curtains & Blinds", desc: "Expert window styling with premium fabrics, custom measurements, and professional installation.", icon: "🪟" },
                 { title: "Premium Mattresses", desc: "High-quality, durable mattresses sourced and recommended based on your sleep needs.", icon: "🛏️" },
                 { title: "Upholstery Services", desc: "Breathe new life into your old furniture with our expert reupholstery and repair services.", icon: "🪡" },
                 { title: "Cushions & Pillows", desc: "Custom decorative cushions and comfortable sleeping pillows made to order.", icon: "🧵" },
                 { title: "Cotton Gaddas", desc: "Traditional, hand-crafted pure cotton gaddas (floor mattresses) for authentic comfort.", icon: "🧶" },
                 { title: "Headboards & Beds", desc: "Custom upholstered headboards and bed frames to complete your bedroom aesthetic.", icon: "🛏️" },
                 { title: "Space Consultation", desc: "Professional at-home design consultation to help you choose the right fabrics and styles.", icon: "📐" },
                 { title: "Professional Installation", desc: "Flawless, hassle-free delivery and installation of all our furnishing products.", icon: "🛠️" }
               ].map((service, index) => (
                  <div key={index} className="bg-slate-50 rounded-2xl p-8 hover:bg-slate-900 hover:text-white transition-colors duration-500 group border border-gray-100">
                    <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                    <h3 className="text-xl font-medium mb-3 group-hover:text-blue-400 transition-colors">{service.title}</h3>
                    <p className="text-gray-500 group-hover:text-gray-300 font-light leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
               ))}
            </div>
          </div>
        </section>

        {/* ================= CTA SECTION ================= */}
        <section className="py-24 px-6 md:px-16 bg-[#faf7f2] text-center border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-light text-slate-800 mb-6 leading-tight">
              Ready to Transform Your Space?
            </h2>
            <p className="text-gray-600 font-light text-lg mb-10">
              Schedule a free consultation today and let our experts help you choose the perfect furnishings for your home.
            </p>
            <button
              onClick={() => navigate("/book-consultation")}
              className="px-10 py-4 bg-slate-900 hover:bg-blue-600 text-white font-medium rounded-sm transition duration-300 shadow-xl shadow-slate-900/20 tracking-widest text-sm uppercase"
            >
              Book Free Consultation
            </button>
          </div>
        </section>

      </div>
    </>
  );
};

export default Services;
