// src/pages/AdminLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FiUser, FiLock } from "react-icons/fi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const userDoc = snap.docs[0].data();

          if (userDoc.type === "admin") {
            navigate("/admin/panel");
          }
        }
      }
    });

    return () => unsub();
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      Swal.fire("Error", "Isi semua kolom login", "warning");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Login via Firebase Auth
      console.log(email, " - ", password);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Cek apakah UID ini ada di collection users dengan type 'admin'
      const q = query(collection(db, "users"), where("uid", "==", uid));
      const snap = await getDocs(q);

      if (snap.empty) {
        Swal.fire("Gagal", "Hanya admin yang bisa login", "error");
        setLoading(false);
        return;
      }

      const userDoc = snap.docs[0].data();

      if (userDoc.type !== "admin") {
        Swal.fire("Gagal", "Hanya admin yang bisa login", "error");
        setLoading(false);
        return;
      }

      Swal.fire("Sukses", `Selamat datang, ${userDoc.name}`, "success");
      navigate("/admin/panel"); // arahkan ke admin panel
    } catch (err) {
      console.error(err);
      Swal.fire("Login gagal", err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900">
      <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-lg">
          Admin Login
        </h1>

        <form onSubmit={onLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <FiUser className="absolute top-3 left-3 text-white/70" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-white/70" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:scale-105 transform transition duration-200"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="text-white/70 text-sm mt-4 text-center">
          Hanya admin yang diperbolehkan masuk
        </p>
      </div>
    </div>
  );
}
