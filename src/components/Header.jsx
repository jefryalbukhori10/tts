// src/components/Header.jsx
import React from "react";
import { FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/**
 * Props:
 * - user: { username, coins, code }
 * - onOpenAccount: callback untuk membuka halaman akun
 */
export default function Header({ user, onOpenAccount }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/menu");
  };

  return (
    <header
      className="w-full flex items-center justify-between px-6 py-4
      bg-gradient-to-r from-purple-700 via-pink-700 to-indigo-700
      rounded-b-3xl shadow-2xl shadow-purple-800/50
      backdrop-blur-md
    "
    >
      {/* LEFT: HOME BUTTON + TITLE */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleGoHome}
          className="p-2 bg-gradient-to-tr from-cyan-400 to-pink-400 rounded-full shadow-lg
            hover:scale-110 hover:shadow-cyan-400/70 transition-all duration-300"
        >
          <FiHome size={24} className="text-white" />
        </button>

        <h1
          onClick={handleGoHome}
          className="font-extrabold text-2xl text-white drop-shadow-lg animate-textGlow"
        >
          TTS Islami
        </h1>
      </div>

      {/* RIGHT: COINS + ACCOUNT */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={onOpenAccount}
      >
        <div
          className="flex items-center gap-1 bg-gradient-to-tr from-yellow-400 to-orange-400
          px-3 py-1 rounded-full shadow-lg animate-pulse
        "
        >
          <span className="text-lg">🪙</span>
          <span className="font-bold text-white">{user?.coins ?? 0}</span>
        </div>
      </div>
    </header>
  );
}
