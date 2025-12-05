// src/pages/Welcome.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  //   useEffect(() => {
  //     const timer = setTimeout(() => {
  //       navigate("/menu");
  //     }, 5000); // 5 detik
  //     return () => clearTimeout(timer);
  //   }, [navigate]);

  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-950 to-pink-900 overflow-hidden">
      {/* Pola geometris Islami (arabesque) */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-24 h-24 border-2 border-white/10 rounded-lg rotate-[45deg]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatSlow ${
                Math.random() * 10 + 5
              }s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Floating stars & crescent moon */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-yellow-300 rounded-full opacity-50"
            style={{
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        <div className="absolute top-10 right-10 w-16 h-16 bg-yellow-400 rounded-full opacity-70 animate-spin-slow clip-corner-crescent"></div>
      </div>

      <div className="text-center z-10">
        {/* Logo futuristik */}
        <div className="mx-auto mb-4 flex flex-col items-center justify-center">
          {/* Logo gambar */}
          <div
            className="flex items-center justify-center rounded-full shadow-2xl border-2 border-white/20 overflow-hidden"
            style={{
              width: 160,
              height: 160,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            <img
              src="/logo.png" // ganti dengan path logo kamu
              alt="Logo TTS Islami"
              className="w-24 h-24 object-contain animate-pulse"
            />
          </div>

          {/* Tulisan versi */}
          <div className="text-white text-sm mt-2 drop-shadow-sm">
            Versi 1.0
          </div>
        </div>

        {/* Teks Welcome + Quote Islami */}
        <div className="text-white text-3xl font-semibold mb-2 drop-shadow-md">
          Selamat Datang
        </div>
        <div className="text-white text-lg mb-4 drop-shadow-sm">
          TTS Islami Subulussalam
        </div>
        <div className="text-yellow-200 text-sm italic mb-6 drop-shadow-sm">
          “Ilmu adalah cahaya, mari belajar dengan hati yang bersih”
        </div>

        {/* Tombol Mulai */}
        <button
          onClick={() => navigate("/menu")}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full text-white font-bold shadow-lg hover:scale-110 transform transition duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
        >
          Mulai
        </button>

        {/* Loading animasi bintang */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="w-3 h-3 bg-yellow-300 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Keyframes tambahan (tailwind + inline style jika perlu) */}
      <style>
        {`
          @keyframes floatSlow {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-20px); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          .clip-corner-crescent {
            clip-path: polygon(50% 0%, 100% 25%, 75% 100%, 25% 100%, 0 50%);
          }
        `}
      </style>
    </div>
  );
}
