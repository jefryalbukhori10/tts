// src/components/admin/HeaderAdmin.jsx
import React, { useState } from "react";
import { FiUser, FiLogOut, FiUsers } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function HeaderAdmin({ admin }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  return (
    <>
      {/* HEADER */}
      <header
        className="
          w-full flex items-center justify-between px-6 py-4
          bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900
          shadow-2xl shadow-purple-900/60 border-b border-purple-700/40
        "
      >
        {/* LEFT : PROFILE ICON */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="
              p-3 rounded-full bg-white/10 hover:bg-white/20
              transition-all duration-300 shadow-lg
            "
          >
            <FiUser size={24} className="text-white" />
          </button>

          <h1 className="text-white text-2xl font-extrabold tracking-wide drop-shadow-lg">
            Dashboard Admin
          </h1>
        </div>

        <div></div>
      </header>

      {/* MODAL */}
      {showModal && (
        <div
          className="
            fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50
          "
        >
          <div
            className="
              bg-gradient-to-br from-indigo-800 via-purple-800 to-pink-800
              p-6 rounded-2xl shadow-2xl w-80 border border-white/10
              animate-fadeIn
            "
          >
            <h2 className="text-xl font-bold text-white text-center mb-4">
              Informasi Admin
            </h2>

            <div className="space-y-2 text-white/90">
              <p>
                <span className="font-bold">Nama:</span> {admin?.name}
              </p>
            </div>

            {/* 🔥 Tambahan : TOMBOL DAFTAR ADMIN */}
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/admin/manage-admin");
              }}
              className="
                mt-5 w-full flex items-center justify-center gap-2
                bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl
                transition-all duration-300 shadow-lg
              "
            >
              <FiUsers size={18} />
              Daftar Admin
            </button>

            <button
              onClick={handleLogout}
              className="
                mt-3 w-full flex items-center justify-center gap-2
                bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl
                transition-all duration-300 shadow-lg
              "
            >
              <FiLogOut size={18} />
              Logout
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="
                mt-3 w-full py-2 rounded-xl bg-white/20 text-white
                hover:bg-white/30 transition-all duration-300
              "
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
