import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CategoryCard from "../components/CategoryCard";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { FiGrid } from "react-icons/fi";

export default function Menu({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "categories"));
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCategories(arr);
      } catch (e) {
        console.error("Gagal load categories:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden">
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

      <Header
        user={user}
        onOpenAccount={() => (window.location.href = "/account")}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Heading */}
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-gradient-to-tr from-indigo-700 to-pink-700 rounded-full shadow-2xl hover:scale-110 transition-transform duration-500">
            <FiGrid size={28} className="text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-2xl animate-textGlow">
            Pilih Kategori
          </h2>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`relative animate-fadeUp delay-[${idx * 100}ms]`}
            >
              {/* Hanya wrapper, semua efek neon dan tombol ada di CategoryCard */}
              <CategoryCard cat={cat} userProgress={user?.progress} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
