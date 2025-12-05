// src/components/Loading.jsx
import React, { useEffect } from "react";

export default function Loading({ onFinish, delay = 1500 }) {
  useEffect(() => {
    if (onFinish) {
      const id = setTimeout(() => onFinish(), delay);
      return () => clearTimeout(id);
    }
  }, [onFinish, delay]);

  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden">
      {/* Floating particles / stars */}
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] bg-white rounded-full opacity-20 animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      <div className="text-center z-10">
        {/* Teks animasi menunggu */}
        <div className="text-white text-2xl p-4 font-semibold mb-6 drop-shadow-md animate-pulse">
          Tunggu ya, lagi menghubungkan ke server...
        </div>

        {/* Loading bars */}
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="w-3 h-8 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></span>
          ))}
        </div>
      </div>

      {/* Keyframes tambahan jika belum ada di Tailwind */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          .animate-float {
            animation: float 5s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
