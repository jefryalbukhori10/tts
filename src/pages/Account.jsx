// src/pages/Account.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/Header";
import { FiLogOut, FiUser, FiKey } from "react-icons/fi";
import Loading from "../components/Loading";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Account({ user, createUser, loginWithCode, setUser }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [categoriesData, setCategoriesData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      if (!user) {
        setLoading(false);
      }
      const catIds = Object.keys(user.progress);
      const data = {};
      if (catIds.length <= 0) {
        setLoading(false);
      }
      for (const id of catIds) {
        try {
          const snap = await getDoc(doc(db, "categories", id));
          if (snap.exists()) {
            data[id] = snap.data().name;
          } else {
            data[id] = id; // fallback
          }
        } catch (err) {
          console.warn("Gagal load kategori:", err);
          data[id] = id; // fallback
        } finally {
          setLoading(false);
        }
      }
      setCategoriesData(data);
    }
    loadCategories();
  }, [user]);

  const navigate = useNavigate();

  async function onCreate(e) {
    e.preventDefault();
    if (!name.trim())
      return Swal.fire("Nama kosong", "Masukkan nama kamu.", "warning");

    try {
      const u = await createUser(name.trim());
      const loginCode = u.code;

      Swal.fire({
        title: "Sukses",
        html: `
          <p>Akun dibuat.</p>
          <p><b>Kode login kamu:</b></p>
          <div style="font-size: 20px; font-weight: bold; margin: 10px 0;">
            ${loginCode}
          </div>
          <button id="copyBtn"
            style="
              padding: 8px 16px;
              background: #3085d6;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            ">
            Salin Kode
          </button>
        `,
        icon: "success",
        didOpen: () => {
          const btn = document.getElementById("copyBtn");
          btn.addEventListener("click", () => {
            navigator.clipboard.writeText(loginCode);
            Swal.showValidationMessage("✔ Kode berhasil disalin!");
          });
        },
      }).then(() => navigate("/menu"));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  }

  async function onLogin(e) {
    e.preventDefault();
    if (!code.trim())
      return Swal.fire("Kode kosong", "Masukkan kode login.", "warning");

    try {
      const u = await loginWithCode(code.trim().toUpperCase());
      Swal.fire("Sukses", `Selamat datang, ${u.username}!`, "success");
      navigate("/menu");
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  }

  function logoutUser() {
    Swal.fire({
      title: "Logout?",
      text: "Apakah kamu yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/account");
      }
    });
  }

  if (loading) return <Loading />;

  const categories = user?.progress ? Object.keys(user.progress) : [];
  console.log(categories);
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
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

      <Header user={user} onOpenAccount={() => {}} />

      <main className="max-w-2xl mx-auto mt-6 p-4 space-y-6">
        {user ? (
          <>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              Akun Saya
            </h2>

            {/* Info User */}
            <div className="p-4 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-purple-500/40 shadow-2xl space-y-2">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <FiUser /> Informasi Pengguna
              </h3>
              <p className="text-white">
                <b>Nama:</b> {user.username}
              </p>
              <p className="text-white">
                <b>Kode Login:</b> {user.code}
              </p>
              <p className="text-white">
                <b>Coin:</b> {user.coins ?? 0}
              </p>
            </div>

            {/* Progress */}
            <div className="p-4 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-purple-500/40 shadow-2xl space-y-2">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <FiKey /> Progress
              </h3>
              {categories.length === 0 && (
                <p className="text-sm text-gray-300">
                  Belum ada level yang diselesaikan.
                </p>
              )}
              {categories.map((catId) => (
                <div key={catId} className="mb-1">
                  <p className="font-medium text-white">
                    Kategori: {categoriesData[catId] || catId}
                  </p>
                  <p className="text-sm text-gray-300">
                    Level Diseleisaikan: {user.progress[catId].length}
                  </p>
                  <p className="text-sm text-gray-300">
                    Level Terbuka: {user.progress[catId].length + 1}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={logoutUser}
              className="w-full p-3 bg-red-600/90 hover:bg-red-500 rounded-2xl text-white font-bold shadow-lg transition-transform transform hover:scale-105 flex justify-center items-center gap-2"
            >
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              Akun
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CREATE ACCOUNT */}
              <div className="p-4 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-purple-500/40 shadow-2xl space-y-2">
                <h3 className="font-medium text-white">Buat Akun Baru</h3>
                <form onSubmit={onCreate} className="space-y-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama"
                    className="w-full p-2 rounded-xl border border-purple-600/50 bg-gray-800 text-white"
                  />
                  <button
                    type="submit"
                    className="w-full p-2 bg-blue-600/90 hover:bg-blue-500 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
                  >
                    Buat Akun
                  </button>
                </form>
                <p className="text-xs text-gray-300 mt-1">
                  Kamu akan mendapatkan kode login untuk masuk kembali.
                </p>
              </div>

              {/* LOGIN WITH CODE */}
              <div className="p-4 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-purple-500/40 shadow-2xl space-y-2">
                <h3 className="font-medium text-white">Masuk dengan Kode</h3>
                <form onSubmit={onLogin} className="space-y-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Masukkan kode login"
                    className="w-full p-2 rounded-xl border border-purple-600/50 bg-gray-800 text-white"
                  />
                  <button
                    type="submit"
                    className="w-full p-2 bg-green-600/90 hover:bg-green-500 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
