import React from "react";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <>
      <Navbar />

      {/* ===== BACKGROUND GRADIENT ===== */}
      <div className="min-h-screen bg-gradient-to-br from-[#e8f7f4] to-[#d7f0ea] px-6 md:px-12 py-20">

        {/* ===== MAIN HEADING ===== */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-[#0e2f2f]">
          About Us
        </h1>

        {/* ===== DESCRIPTION CARD ===== */}
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-10 md:p-12 text-center space-y-6 text-gray-700 text-lg">
          <p>
            Sandhya Furnishing has been creating beautiful, custom-made home décor
            solutions since{" "}
            <span className="text-yellow-600 font-semibold">
              26 January 2003
            </span>.
            Founded by{" "}
            <span className="text-yellow-600 font-semibold">
              Mr. Ashok Gupta
            </span>,
            the shop has grown into a trusted name for high-quality curtains,
            sofas, mattresses, and cotton bedding for homes across Mumbai.
          </p>

          <p>
            With more than 20 years of experience, we focus on delivering
            personalized furnishing solutions that bring comfort, elegance,
            and a premium feel to every home — all at affordable prices.
          </p>
        </div>

        {/* ===== IMAGE + WHY CHOOSE US ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20 max-w-6xl mx-auto items-center">

          {/* IMAGE */}
          <img
            src="/work/about-cover.jpg"
            alt="Furnishing Work"
            className="rounded-3xl shadow-2xl object-cover h-96 w-full"
          />

          {/* WHY CHOOSE US CARD */}
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6 text-[#0e2f2f]">
              Why Choose Us?
            </h2>

            <ul className="space-y-4 text-gray-700 text-lg">
              <li>✔ 20+ years of hands-on experience</li>
              <li>✔ Customized designs for every home</li>
              <li>✔ High-quality fabrics and materials</li>
              <li>✔ Skilled craftsmanship</li>
              <li>✔ Affordable and transparent pricing</li>
              <li>✔ Fast delivery and installation services</li>
            </ul>
          </div>
        </div>

        {/* ===== OUR WORK SECTION ===== */}
        <div className="mt-28">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#0e2f2f]">
            Some of Our Work
          </h2>

          <p className="text-gray-700 text-center mb-12 max-w-3xl mx-auto">
            A glimpse of our custom-made curtains, sofa upholstery, mattress
            designs, and home décor work completed for our clients.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              "Work1.jpg",
              "Work2.jpg",
              "Work3.jpg",
              "Work4.jpg",
              "Work5.jpg",
              "Work6.jpg",
            ].map((img, index) => (
              <img
                key={index}
                src={`/AboutImages/${img}`}
                alt="Our Work"
                className="rounded-2xl shadow-lg object-cover h-64 w-full hover:scale-105 transition duration-300"
              />
            ))}
          </div>
        </div>

        {/* ===== CONTACT SECTION ===== */}
        <div className="mt-28 max-w-4xl mx-auto bg-white p-12 rounded-3xl shadow-2xl border border-gray-200 text-center">
          <h2 className="text-3xl font-semibold mb-8 text-[#0e2f2f]">
            Contact Us
          </h2>

          <p className="text-gray-700 mb-6">
            Have questions or want to place an order? We’re here to help!
          </p>

          <div className="space-y-3 text-gray-800 text-lg">
            <p>📍 Sandhya Furnishing, Mumbai</p>
            <p>📞 +91 9876543210</p>
            <p>📧 sandhyafurnishing@gmail.com</p>
            <p>🕒 10:00 AM – 9:00 PM (All Days)</p>
          </div>
        </div>

      </div>
    </>
  );
};

export default About;