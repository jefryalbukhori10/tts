import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, query } from "firebase/firestore";
import { db } from "../firebase";
import Header from "../components/Header";
import Swal from "sweetalert2";
import { FiDollarSign, FiZap, FiVideo, FiShoppingCart } from "react-icons/fi";
import Loading from "../components/Loading";

export default function GamePage({ user, setUser }) {
  const { cid, lid } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slots, setSlots] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hintIdx, setHintIdx] = useState(null);
  const [showStore, setShowStore] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const adRef = useRef(null);

  // Array gambar karakter
  const characterImages = [
    "/character.png",
    "/character1.png",
    "/character2.png",
  ];

  // State untuk gambar random
  const [randomImage, setRandomImage] = useState(characterImages[0]);

  useEffect(() => {
    // Pilih gambar random saat komponen mount
    const randomIndex = Math.floor(Math.random() * characterImages.length);
    setRandomImage(characterImages[randomIndex]);
  }, [questions, currentIdx]); // Bisa juga [q.question] jika ingin ganti tiap soal baru

  // Load questions
  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "categories", cid, "levels", lid, "questions")
        );
        const snap = await getDocs(q);
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (!arr.length) {
          Swal.fire("Kosong", "Belum ada soal di level ini.", "info").then(() =>
            navigate(`/category/${cid}`)
          );
          return;
        }
        setQuestions(arr);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", e.message, "error");
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [cid, lid, navigate]);

  // Setup initial slots
  useEffect(() => {
    if (!questions.length) return;
    const ans = (questions[currentIdx].answer || "")
      .toUpperCase()
      .replace(/\s+/g, "");
    const newSlots = Array(ans.length).fill("");
    const newRevealed = Array(ans.length).fill(false);
    if (ans.length > 0) {
      const idx = Math.floor(Math.random() * ans.length);
      newSlots[idx] = ans[idx];
      newRevealed[idx] = true;
      setHintIdx(idx);
    }
    setSlots(newSlots);
    setRevealed(newRevealed);
  }, [questions, currentIdx]);

  // Load Adsterra script
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://www.adsterra.com/route.js";
  //   script.async = true;
  //   script.onload = () => setSdkReady(true);
  //   document.body.appendChild(script);
  //   return () => document.body.removeChild(script);
  // }, []);

  function onKeyPress(letter) {
    const firstEmpty = slots.indexOf("");
    if (firstEmpty === -1) return;
    const newSlots = [...slots];
    newSlots[firstEmpty] = letter;
    setSlots(newSlots);
    if (!newSlots.includes("")) checkAnswer(newSlots.join(""));
  }

  function onBackspace() {
    const lastFilled = slots
      .map((s, i) => (s !== "" ? i : null))
      .filter((i) => i !== null)
      .pop();
    if (lastFilled === undefined) return;
    const newSlots = [...slots];
    newSlots[lastFilled] = "";
    setSlots(newSlots);
  }

  function checkAnswer(str) {
    const correct = (questions[currentIdx].answer || "")
      .toUpperCase()
      .replace(/\s+/g, "");
    if (str === correct) {
      Swal.fire("Benar!", "Kamu mendapat +10 koin", "success");
      awardCoins(10);
      unlockNextLevelThenProceed();
    } else {
      Swal.fire("Salah", "Jawaban belum benar. Coba lagi.", "error");
      setSlots(slots.map((s, i) => (i === hintIdx ? s : "")));
    }
  }

  async function awardCoins(n) {
    if (!user) return;
    const newCoins = (user.coins || 0) + n;
    setUser({ ...user, coins: newCoins });
    try {
      await updateDoc(doc(db, "users", user.code), { coins: newCoins });
    } catch (e) {
      console.warn("Gagal update coins:", e.message);
    }
  }

  function revealOneLetter() {
    const answer = (questions[currentIdx].answer || "")
      .toUpperCase()
      .replace(/\s+/g, "");
    const emptyIdxs = slots
      .map((s, i) => (s === "" ? i : null))
      .filter((i) => i !== null);
    if (!emptyIdxs.length) return;
    const pick = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
    const newSlots = [...slots];
    newSlots[pick] = answer[pick];
    setSlots(newSlots);
    const r = [...revealed];
    r[pick] = true;
    setRevealed(r);
    if (!newSlots.includes("")) checkAnswer(newSlots.join(""));
  }

  useEffect(() => {
    if (!adRef.current) return;

    // Atur options
    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.innerHTML = `
    atOptions = {
      'key' : 'dea45943a13eb33b8f677bae8ecffd21',
      'format' : 'iframe',
      'height' : 300,
      'width' : 160,
      'params' : {}
    };
  `;
    adRef.current.appendChild(optionsScript);

    // Load invoke.js
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "//www.highperformanceformat.com/dea45943a13eb33b8f677bae8ecffd21/invoke.js";
    script.async = true;
    adRef.current.appendChild(script);

    return () => {
      adRef.current?.removeChild(optionsScript);
      adRef.current?.removeChild(script);
    };
  }, []);

  // function useHintFree() {
  //   if (!sdkReady) {
  //     Swal.fire(
  //       "Tunggu sebentar",
  //       "Iklan sedang dipersiapkan, coba lagi sebentar.",
  //       "info"
  //     );
  //     return;
  //   }
  //   setShowAdModal(true);
  //   setTimeout(() => {
  //     revealOneLetter();
  //     setShowAdModal(false);
  //   }, 2000); // Simulasi rewarded video 2 detik
  // }

  // Hint Gratis via Adsterra Rewarded Video
  function useHintFree() {
    if (showAdModal) return; // jangan spam

    setShowAdModal(true);

    // URL Smartlink khusus rewarded video dari dashboard Adsterra
    const adUrl =
      "https://www.effectivegatecpm.com/f0vzt9rny?key=12c2a7c3cf0cdab0f36571a95655b0b0"; // ganti sesuai Smartlink kamu

    // Buka pop-up iklan
    const adWindow = window.open(
      adUrl,
      "AdsterraReward",
      "width=800,height=600"
    );

    if (!adWindow) {
      setShowAdModal(false);
      Swal.fire("Error", "Pop-up diblokir. Izinkan pop-up browser.", "error");
      return;
    }

    // Cek interval apakah pop-up ditutup
    const timer = setInterval(() => {
      if (adWindow.closed) {
        clearInterval(timer);
        setShowAdModal(false);

        // Berikan reward setelah iklan ditutup
        revealOneLetter();
        Swal.fire("Hint!", "Kamu mendapat 1 huruf terbuka.", "success");
      }
    }, 500);
  }

  async function useHintPaid() {
    if (!user) {
      Swal.fire(
        "Perhatian",
        "Buat akun dulu untuk menggunakan hint.",
        "warning"
      );
      return;
    }
    if ((user.coins || 0) < 15) {
      Swal.fire(
        "Koin tidak cukup",
        "Kunjungi Toko Coin untuk membeli.",
        "warning"
      );
      return;
    }
    await awardCoins(-15);
    revealOneLetter();
  }

  async function unlockNextLevelThenProceed() {
    if (!user) return;
    const userRef = doc(db, "users", user.code);
    const progress = user.progress || {};
    const catProgress = progress[cid] || [];
    if (!catProgress.includes(lid)) catProgress.push(lid);
    progress[cid] = catProgress;
    setUser({ ...user, progress });
    try {
      await updateDoc(userRef, { progress });
    } catch (e) {
      console.warn("Gagal update progress:", e.message);
    }
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      Swal.fire("Level Selesai!", "Level ini telah selesai.", "success").then(
        () => navigate(`/category/${cid}`)
      );
    }
  }

  if (loading) return <Loading />;
  if (!questions.length)
    return <div className="p-6 text-white">Tidak ada soal.</div>;

  const q = questions[currentIdx];
  const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((r) =>
    r.split("")
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden ">
      <Header user={user} onOpenAccount={() => navigate("/account")} />

      <main className="max-w-3xl mx-auto mt-6 p-4 space-y-6">
        <div className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-purple-500/40">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-28 flex-shrink-0">
              <img
                src={randomImage}
                alt="Karakter"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                {q.question}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {slots.map((s, i) => (
                  <div
                    key={i}
                    className={`w-10 h-12 md:w-12 md:h-14 border-2 rounded-md flex items-center justify-center text-lg font-bold
                    ${
                      revealed[i]
                        ? "text-yellow-400 border-yellow-400"
                        : "text-white border-white"
                    } bg-gray-900/40 backdrop-blur-sm shadow-md`}
                  >
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={useHintFree}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500/90 hover:bg-blue-400 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
                >
                  <FiVideo /> Hint Gratis
                </button>

                <button
                  onClick={useHintPaid}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600/90 hover:bg-green-500 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
                >
                  <FiZap /> Hint (-15 Koin)
                </button>
                <button
                  onClick={() => setShowStore(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500/90 hover:bg-yellow-400 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
                >
                  <FiShoppingCart /> Toko Coin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-3 rounded-2xl shadow-inner border border-purple-500/30">
          {keyboardRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-2 mb-2 flex-wrap">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-purple-700/70 hover:bg-purple-600 text-white font-bold rounded-md shadow-lg transition-transform transform hover:scale-110"
                >
                  {key}
                </button>
              ))}
              {ri === keyboardRows.length - 1 && (
                <button
                  onClick={onBackspace}
                  className="w-20 h-10 md:w-24 md:h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md shadow-lg transition-transform transform hover:scale-110"
                >
                  ⌫
                </button>
              )}
            </div>
          ))}
          {/* Banner Adsterra */}
          <div className="mt-2 flex justify-center">
            <div ref={adRef} className="w-full max-w-sm">
              {/* Script Ad Unit akan inject iklan di sini */}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Toko Coin */}
      {showStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setShowStore(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white w-10 h-10 flex items-center justify-center rounded-full text-xl shadow-lg"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              🛒 TOKO COIN
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[50, 120, 250, 1000].map((amt) => (
                <div
                  key={amt}
                  className="bg-gray-100 rounded-xl p-4 shadow-lg text-center border border-gray-300"
                >
                  <div className="font-bold text-lg mb-2">{amt} Coin</div>
                  <img
                    src={`/coins/${amt}.png`}
                    alt={`${amt} coin`}
                    className="w-16 mx-auto mb-2"
                  />
                  <button
                    onClick={() =>
                      Swal.fire(
                        "Mohon MAAF",
                        "Fitur ini belum tersedia",
                        "info"
                      )
                    }
                    className="w-full py-2 bg-yellow-400 font-bold rounded-lg"
                  >
                    Rp {amt * 60}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Rewarded Video */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <p className="text-xl font-bold mb-4">Menampilkan iklan...</p>
            <div className="loader border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin mx-auto"></div>
            <p className="mt-2">
              Tunggu hingga video selesai untuk mendapatkan hint.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
