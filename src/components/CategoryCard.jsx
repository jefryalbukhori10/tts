// src/components/CategoryCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdminData } from "../hooks/useAdminData";
import { FiGrid } from "react-icons/fi";

export default function CategoryCard({ cat, userProgress }) {
  const navigate = useNavigate();
  const unlockedCount =
    userProgress && userProgress[cat.id] ? userProgress[cat.id].length : 0;

  const admin = useAdminData(cat.adminUid);

  return (
    <div
      className="relative rounded-3xl overflow-hidden
      bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-400
      shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80
      transform transition-all duration-500 ease-in-out
      hover:scale-105 hover:-translate-y-2 group cursor-pointer p-6"
    >
      {/* Neon border animatif */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none
        border-2 border-gradient-to-r from-cyan-300 via-purple-400 to-pink-300
        opacity-0 group-hover:opacity-100 animate-glow"
      ></div>

      {/* Mini floating icon
      <div className="absolute top-4 left-4 w-10 h-10 bg-gradient-to-tr from-cyan-400 to-pink-400 rounded-full shadow-lg flex items-center justify-center animate-pulse">
        <FiGrid className="text-white" size={20} />
      </div> */}

      {/* Category Content */}
      <h3 className="font-bold text-xl text-white">{cat.name}</h3>

      <span className="text-sm text-white/70">
        Admin: {admin ? admin.name || admin.email : "Memuat..."}
      </span>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-white/90">
          {unlockedCount + 1} Level Terbuka
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/category/${cat.id}`)}
            className="px-4 py-1 bg-gradient-to-r from-purple-500 to-cyan-400 
              rounded-full text-white font-bold shadow-lg flex items-center gap-2 
              hover:scale-110 transition-transform duration-300"
          >
            Buka
            <svg
              className="w-4 h-4 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mini sparks overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-white rounded-full opacity-70 animate-spark absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
