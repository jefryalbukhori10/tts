import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Header from "../components/Header";
import Swal from "sweetalert2";
import Loading from "../components/Loading";
import { FiArrowLeft } from "react-icons/fi";

export default function Category({ user, setUser }) {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // LOAD CATEGORY + LEVEL LIST
  // ---------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const catSnap = await getDoc(doc(db, "categories", cid));
        if (!catSnap.exists()) {
          Swal.fire("Tidak ditemukan", "Kategori tidak ada", "error");
          navigate("/menu");
          return;
        }

        setCategory({ id: catSnap.id, ...catSnap.data() });

        const levelsSnap = await getDocs(
          collection(db, "categories", cid, "levels")
        );

        // const arr = levelsSnap.docs
        //   .map((d) => ({ id: d.id, ...d.data() }))
        //   .sort((a, b) => a.levelNumber - b.levelNumber);
        const arr = await Promise.all(
          levelsSnap.docs
            .map(async (d) => {
              const levelData = { id: d.id, ...d.data() };

              // Ambil jumlah soal tiap level
              const questionsSnap = await getDocs(
                collection(db, "categories", cid, "levels", d.id, "questions")
              );
              levelData.questionCount = questionsSnap.size; // jumlah soal

              return levelData;
            })
            .sort((a, b) => a.levelNumber - b.levelNumber)
        );

        setLevels(arr);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", e.message, "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cid, navigate]);

  if (loading) return <Loading />;

  // ---------------------------
  // LOGIKA CEK LEVEL TERBUKA
  // ---------------------------
  function isLevelUnlocked(level) {
    const lvlNum = level.levelNumber;
    if (lvlNum === 1) return true;
    if (!user?.progress || !user.progress[cid]) return false;
    const prevLevelId = levels.find((lv) => lv.levelNumber === lvlNum - 1)?.id;
    return user.progress[cid].includes(prevLevelId);
  }

  function onPlay(level) {
    if (!user) {
      Swal.fire({
        title: "Masukkan nama dulu",
        text: "Kamu harus membuat akun (nama) dulu sebelum bermain.",
        icon: "warning",
        confirmButtonText: "Buat akun",
      }).then(() => navigate("/account"));
      return;
    }

    if (!isLevelUnlocked(level)) {
      Swal.fire(
        "Terkunci",
        "Level ini belum dibuka. Selesaikan level sebelumnya.",
        "info"
      );
      return;
    }

    navigate(`/category/${cid}/level/${level.id}`);
  }
  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden">
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
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

      <Header user={user} onOpenAccount={() => navigate("/account")} />

      <main className="max-w-3xl mx-auto p-4">
        {/* Title & Back Button */}
        <div className="flex items-center gap-4 justify-between mb-6">
          <button
            onClick={() => navigate("/menu")}
            className="px-3 py-1 rounded-md bg-white/20 text-white hover:bg-white/30 font-semibold"
          >
            <FiArrowLeft />
          </button>
          <h2 className="text-xl font-extrabold text-white drop-shadow-xl animate-textGlow">
            {category?.name}
          </h2>
          {/* Spacer agar title tetap di tengah */}
          <div className="w-16" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {levels.map((lv, idx) => {
            const unlocked = isLevelUnlocked(lv);

            return (
              <div
                key={lv.id}
                className={`relative p-4 rounded-2xl bg-gradient-to-tr from-purple-700 via-pink-600 to-cyan-500
                  shadow-2xl shadow-purple-500/50 transform transition-all duration-500 hover:scale-105 hover:shadow-purple-700/80
                  cursor-pointer group animate-fadeUp delay-[${idx * 100}ms]
                `}
              >
                {/* Floating spark */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(3)].map((_, i) => (
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

                {/* Level Info */}
                <div>
                  <div className="text-white font-bold text-lg">
                    Level {lv.levelNumber}
                  </div>
                  <div className="text-white/70 text-xs">
                    Jumlah Soal: {lv.questionCount || 0}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 mt-3 justify-end">
                  {!unlocked && (
                    <span className="text-yellow-300 font-bold text-xs px-2 py-1 rounded-md bg-black/30">
                      Terkunci
                    </span>
                  )}
                  <button
                    onClick={() => onPlay(lv)}
                    className={`px-4 py-1 rounded-full text-white font-semibold flex items-center gap-1
                      transition-transform duration-300 ${
                        unlocked
                          ? "bg-gradient-to-r from-green-400 to-green-600 hover:scale-110"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                  >
                    Main
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
