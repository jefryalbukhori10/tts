// // // src/pages/GamePage.jsx
// // import React, { useEffect, useState } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import {
// //   collection,
// //   getDocs,
// //   doc,
// //   getDoc,
// //   updateDoc,
// //   query,
// // } from "firebase/firestore";
// // import { db } from "../firebase";
// // import Header from "../components/Header";
// // import Swal from "sweetalert2";
// // import { FiDollarSign, FiZap, FiVideo } from "react-icons/fi"; // Icon untuk tombol

// // export default function GamePage({ user, setUser }) {
// //   const { cid, lid } = useParams();
// //   const navigate = useNavigate();
// //   const [questions, setQuestions] = useState([]);
// //   const [currentIdx, setCurrentIdx] = useState(0);
// //   const [slots, setSlots] = useState([]);
// //   const [revealed, setRevealed] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [hintIdx, setHintIdx] = useState(null);
// //   const [showStore, setShowStore] = useState(false);

// //   // Load questions
// //   useEffect(() => {
// //     async function loadQuestions() {
// //       setLoading(true);
// //       try {
// //         const q = query(
// //           collection(db, "categories", cid, "levels", lid, "questions")
// //         );
// //         const snap = await getDocs(q);
// //         const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
// //         if (!arr.length) {
// //           Swal.fire("Kosong", "Belum ada soal di level ini.", "info").then(() =>
// //             navigate(`/category/${cid}`)
// //           );
// //           return;
// //         }
// //         setQuestions(arr);
// //       } catch (e) {
// //         console.error(e);
// //         Swal.fire("Error", e.message, "error");
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //     loadQuestions();
// //   }, [cid, lid, navigate]);

// //   useEffect(() => {
// //     if (!questions.length) return;
// //     const ans = (questions[currentIdx].answer || "")
// //       .toUpperCase()
// //       .replace(/\s+/g, "");

// //     const newSlots = Array(ans.length).fill("");
// //     const newRevealed = Array(ans.length).fill(false);

// //     if (ans.length > 0) {
// //       const idx = Math.floor(Math.random() * ans.length);
// //       newSlots[idx] = ans[idx];
// //       newRevealed[idx] = true;
// //       setHintIdx(idx); // simpan index petunjuk
// //     }

// //     setSlots(newSlots);
// //     setRevealed(newRevealed);
// //   }, [questions, currentIdx]);

// //   function onKeyPress(letter) {
// //     const firstEmpty = slots.indexOf("");
// //     if (firstEmpty === -1) return;
// //     const newSlots = [...slots];
// //     newSlots[firstEmpty] = letter;
// //     setSlots(newSlots);
// //     if (!newSlots.includes("")) checkAnswer(newSlots.join(""));
// //   }

// //   function checkAnswer(str) {
// //     const correct = (questions[currentIdx].answer || "")
// //       .toUpperCase()
// //       .replace(/\s+/g, "");
// //     if (str === correct) {
// //       Swal.fire("Benar!", "Kamu mendapat +10 koin", "success");
// //       awardCoins(10);
// //       unlockNextLevelThenProceed();
// //     } else {
// //       Swal.fire("Salah", "Jawaban belum benar. Coba lagi.", "error");
// //       // reset slot kecuali petunjuk
// //       setSlots(slots.map((s, i) => (i === hintIdx ? s : "")));
// //     }
// //   }

// //   async function awardCoins(n) {
// //     if (!user) return;
// //     const newCoins = (user.coins || 0) + n;
// //     setUser({ ...user, coins: newCoins });
// //     try {
// //       await updateDoc(doc(db, "users", user.code), { coins: newCoins });
// //     } catch (e) {
// //       console.warn("Gagal update coins:", e.message);
// //     }
// //   }

// //   function revealOneLetter() {
// //     const answer = (questions[currentIdx].answer || "")
// //       .toUpperCase()
// //       .replace(/\s+/g, "");

// //     const emptyIdxs = slots
// //       .map((s, i) => (s === "" ? i : null))
// //       .filter((i) => i !== null);
// //     if (!emptyIdxs.length) return;

// //     const pick = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
// //     const newSlots = [...slots];
// //     newSlots[pick] = answer[pick];
// //     setSlots(newSlots);

// //     const r = [...revealed];
// //     r[pick] = true;
// //     setRevealed(r);

// //     // cek jawaban otomatis kalau semua slot sudah terisi
// //     if (!newSlots.includes("")) {
// //       checkAnswer(newSlots.join(""));
// //     }
// //   }

// //   async function useHintPaid() {
// //     if (!user) {
// //       Swal.fire(
// //         "Perhatian",
// //         "Buat akun dulu untuk menggunakan hint.",
// //         "warning"
// //       );
// //       return;
// //     }
// //     if ((user.coins || 0) < 15) {
// //       Swal.fire(
// //         "Koin tidak cukup",
// //         "Kunjungi Toko Coin untuk membeli.",
// //         "warning"
// //       );
// //       return;
// //     }
// //     await awardCoins(-15);
// //     revealOneLetter();
// //   }

// //   function useHintFree() {
// //     // Simulasi "tonton iklan"
// //     const video = document.createElement("video");
// //     video.src = "/ads/dummy-ad.mp4";
// //     video.style.position = "fixed";
// //     video.style.left = "50%";
// //     video.style.top = "50%";
// //     video.style.transform = "translate(-50%, -50%)";
// //     video.style.zIndex = 9999;
// //     video.controls = true;
// //     video.autoplay = true;
// //     video.width = 480;
// //     document.body.appendChild(video);

// //     const onEnded = () => {
// //       revealOneLetter();
// //       document.body.removeChild(video);
// //     };
// //     video.addEventListener("ended", onEnded);
// //   }

// //   async function unlockNextLevelThenProceed() {
// //     if (!user) return;
// //     const userRef = doc(db, "users", user.code);
// //     const progress = user.progress || {};
// //     const catProgress = progress[cid] || [];
// //     if (!catProgress.includes(lid)) catProgress.push(lid);
// //     progress[cid] = catProgress;
// //     setUser({ ...user, progress });
// //     try {
// //       await updateDoc(userRef, { progress });
// //     } catch (e) {
// //       console.warn("Gagal update progress:", e.message);
// //     }
// //     if (currentIdx < questions.length - 1) {
// //       setCurrentIdx(currentIdx + 1);
// //     } else {
// //       Swal.fire("Level Selesai!", "Level ini telah selesai.", "success").then(
// //         () => navigate(`/category/${cid}`)
// //       );
// //     }
// //   }

// //   if (loading) return <div className="p-6 text-white">Memuat...</div>;
// //   if (!questions.length)
// //     return <div className="p-6 text-white">Tidak ada soal.</div>;

// //   const q = questions[currentIdx];

// //   const keyboardRows = [
// //     "QWERTYUIOP".split(""),
// //     "ASDFGHJKL".split(""),
// //     "ZXCVBNM".split(""),
// //   ];

// //   async function buyCoins(amount, price) {
// //     Swal.fire(
// //       "Mohon MAAF",
// //       "Fitur ini belum Tersedia, Sedang dalam tahap pengembangan",
// //       "info"
// //     );
// //     // if (!user) {
// //     //   Swal.fire("Belum Login", "Masuk dulu untuk membeli coin.", "warning");
// //     //   return;
// //     // }

// //     // // 🔥 Panggil server backend yang membuat transaksi Midtrans
// //     // try {
// //     //   const res = await fetch("http://localhost:5000/create-transaction", {
// //     //     method: "POST",
// //     //     headers: { "Content-Type": "application/json" },
// //     //     body: JSON.stringify({
// //     //       userId: 123,
// //     //       itemName: "Paket 100 Koin",
// //     //       price: 5000,
// //     //     }),
// //     //   });

// //     //   const data = await res.json();

// //     //   if (!data.token) {
// //     //     Swal.fire("Error", "Gagal membuat transaksi", "error");
// //     //     return;
// //     //   }

// //     //   // 🔥 Load Midtrans Snap.js
// //     //   const snapScript = document.createElement("script");
// //     //   snapScript.src = "https://app.sandbox.midtrans.com/snap/snap.js";
// //     //   snapScript.setAttribute("data-client-key", "CLIENT_KEY_KAMU");
// //     //   document.body.appendChild(snapScript);

// //     //   snapScript.onload = () => {
// //     //     window.snap.pay(data.token, {
// //     //       onSuccess: async () => {
// //     //         const newCoins = (user.coins || 0) + amount;

// //     //         await updateDoc(doc(db, "users", user.code), {
// //     //           coins: newCoins,
// //     //         });

// //     //         setUser({ ...user, coins: newCoins });
// //     //         setShowStore(false);

// //     //         Swal.fire(
// //     //           "Pembayaran Berhasil!",
// //     //           `${amount} coin telah ditambahkan.`,
// //     //           "success"
// //     //         );
// //     //       },
// //     //       onPending: () => {
// //     //         Swal.fire(
// //     //           "Menunggu Pembayaran",
// //     //           "Selesaikan pembayaran via QRIS.",
// //     //           "info"
// //     //         );
// //     //       },
// //     //       onError: () => {
// //     //         Swal.fire("Gagal", "Transaksi dibatalkan atau gagal.", "error");
// //     //       },
// //     //       onClose: () => {
// //     //         console.log("Modal Midtrans ditutup");
// //     //       },
// //     //     });
// //     //   };
// //     // } catch (e) {
// //     //   Swal.fire("Error", e.message, "error");
// //     // }
// //   }

// //   return (
// //     <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden p-4">
// //       {/* Floating particles */}
// //       {[...Array(50)].map((_, i) => (
// //         <div
// //           key={i}
// //           className="absolute w-[2px] h-[2px] bg-white rounded-full opacity-20 animate-float"
// //           style={{
// //             top: `${Math.random() * 100}%`,
// //             left: `${Math.random() * 100}%`,
// //             animationDelay: `${Math.random() * 5}s`,
// //           }}
// //         />
// //       ))}

// //       <Header user={user} onOpenAccount={() => navigate("/account")} />

// //       <main className="max-w-3xl mx-auto mt-6 space-y-6">
// //         {/* Question & Character */}
// //         <div className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-purple-500/40">
// //           <div className="flex flex-col md:flex-row gap-4 items-center">
// //             <div className="w-28 flex-shrink-0">
// //               <img
// //                 src="/character.png"
// //                 alt="Karakter"
// //                 className="w-full h-auto rounded-xl shadow-lg"
// //               />
// //             </div>
// //             <div className="flex-1">
// //               <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
// //                 {q.question}
// //               </h3>

// //               {/* Slots */}
// //               <div className="mt-4 flex flex-wrap gap-2">
// //                 {slots.map((s, i) => (
// //                   <div
// //                     key={i}
// //                     className={`w-10 h-12 md:w-12 md:h-14 border-2 rounded-md flex items-center justify-center text-lg font-bold
// //                       ${
// //                         revealed[i]
// //                           ? "text-yellow-400 border-yellow-400"
// //                           : "text-white border-white"
// //                       }
// //                       bg-gray-900/40 backdrop-blur-sm shadow-md`}
// //                   >
// //                     {s}
// //                   </div>
// //                 ))}
// //               </div>

// //               {/* Hint / Coin Buttons */}
// //               <div className="mt-4 flex flex-wrap gap-2">
// //                 <button
// //                   onClick={() => setShowStore(true)}
// //                   className="flex items-center gap-1 px-3 py-1 bg-yellow-500/90 hover:bg-yellow-400 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
// //                 >
// //                   <FiDollarSign />
// //                   Toko Coin
// //                 </button>
// //                 <button
// //                   onClick={useHintFree}
// //                   className="flex items-center gap-1 px-3 py-1 bg-blue-500/90 hover:bg-blue-400 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
// //                 >
// //                   <FiVideo />
// //                   Hint Gratis
// //                 </button>
// //                 <button
// //                   onClick={useHintPaid}
// //                   className="flex items-center gap-1 px-3 py-1 bg-green-600/90 hover:bg-green-500 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
// //                 >
// //                   <FiZap />
// //                   Hint (15 Koin)
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Keyboard */}
// //         <div className="bg-gray-900/50 backdrop-blur-sm p-3 rounded-2xl shadow-inner border border-purple-500/30">
// //           {keyboardRows.map((row, ri) => (
// //             <div
// //               key={ri}
// //               className={`flex justify-center gap-2 mb-2 flex-wrap`}
// //             >
// //               {row.map((key) => (
// //                 <button
// //                   key={key}
// //                   onClick={() => onKeyPress(key)}
// //                   className="w-10 h-10 md:w-12 md:h-12 bg-purple-700/70 hover:bg-purple-600 text-white font-bold rounded-md shadow-lg transition-transform transform hover:scale-110"
// //                 >
// //                   {key}
// //                 </button>
// //               ))}
// //             </div>
// //           ))}
// //           <div className="flex justify-center mt-2">
// //             <button
// //               onClick={() =>
// //                 setSlots(slots.map((s, i) => (i === hintIdx ? s : "")))
// //               }
// //               className="px-6 py-2 bg-red-500/90 hover:bg-red-400 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-110"
// //             >
// //               ◀ Clear
// //             </button>
// //           </div>
// //         </div>
// //       </main>
// //       {showStore && (
// //         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
// //           <div className="bg-white/90 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
// //             {/* Tombol Close */}
// //             <button
// //               onClick={() => setShowStore(false)}
// //               className="absolute -top-3 -right-3 bg-red-500 text-white w-10 h-10 flex items-center justify-center rounded-full text-xl shadow-lg"
// //             >
// //               ✕
// //             </button>

// //             {/* Judul */}
// //             <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
// //               🛒 TOKO COIN
// //             </h2>

// //             {/* List Paket */}
// //             <div className="grid grid-cols-2 gap-4">
// //               {/* 50 Coin */}
// //               <div className="bg-gray-100 rounded-xl p-4 shadow-lg text-center border border-gray-300">
// //                 <div className="font-bold text-lg mb-2">50 Coin</div>
// //                 <img
// //                   src="/coins/50.png"
// //                   alt="50 coin"
// //                   className="w-16 mx-auto mb-2"
// //                 />
// //                 <button
// //                   onClick={() => buyCoins(50, 3000)}
// //                   className="w-full py-2 bg-yellow-400 font-bold rounded-lg"
// //                 >
// //                   Rp 3.000
// //                 </button>
// //               </div>

// //               {/* 120 Coin */}
// //               <div className="bg-gray-100 rounded-xl p-4 shadow-lg text-center border border-gray-300">
// //                 <div className="font-bold text-lg mb-2">120 Coin</div>
// //                 <img
// //                   src="/coins/120.png"
// //                   alt="120 coin"
// //                   className="w-16 mx-auto mb-2"
// //                 />
// //                 <button
// //                   onClick={() => buyCoins(120, 6000)}
// //                   className="w-full py-2 bg-yellow-400 font-bold rounded-lg"
// //                 >
// //                   Rp 6.000
// //                 </button>
// //               </div>

// //               {/* 250 Coin */}
// //               <div className="bg-gray-100 rounded-xl p-4 shadow-lg text-center border border-gray-300">
// //                 <div className="font-bold text-lg mb-2">250 Coin</div>
// //                 <img
// //                   src="/coins/250.png"
// //                   alt="250 coin"
// //                   className="w-16 mx-auto mb-2"
// //                 />
// //                 <button
// //                   onClick={() => buyCoins(250, 12000)}
// //                   className="w-full py-2 bg-yellow-400 font-bold rounded-lg"
// //                 >
// //                   Rp 12.000
// //                 </button>
// //               </div>

// //               {/* 1000 Coin */}
// //               <div className="bg-gray-100 rounded-xl p-4 shadow-lg text-center border border-gray-300">
// //                 <div className="font-bold text-lg mb-2">1000 Coin</div>
// //                 <img
// //                   src="/coins/1000.png"
// //                   alt="1000 coin"
// //                   className="w-16 mx-auto mb-2"
// //                 />
// //                 <button
// //                   onClick={() => buyCoins(1000, 25000)}
// //                   className="w-full py-2 bg-yellow-400 font-bold rounded-lg"
// //                 >
// //                   Rp 25.000
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   collection,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
//   query,
// } from "firebase/firestore";
// import { db } from "../firebase";
// import Header from "../components/Header";
// import Swal from "sweetalert2";
// import { FiDollarSign, FiZap, FiVideo } from "react-icons/fi";

// export default function GamePage({ user, setUser }) {
//   const { cid, lid } = useParams();
//   const navigate = useNavigate();
//   const [questions, setQuestions] = useState([]);
//   const [currentIdx, setCurrentIdx] = useState(0);
//   const [slots, setSlots] = useState([]);
//   const [revealed, setRevealed] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [hintIdx, setHintIdx] = useState(null);
//   const [showStore, setShowStore] = useState(false);
//   const [sdkReady, setSdkReady] = useState(false);
//   const [showAdModal, setShowAdModal] = useState(false);

//   // Load questions
//   useEffect(() => {
//     async function loadQuestions() {
//       setLoading(true);
//       try {
//         const q = query(
//           collection(db, "categories", cid, "levels", lid, "questions")
//         );
//         const snap = await getDocs(q);
//         const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//         if (!arr.length) {
//           Swal.fire("Kosong", "Belum ada soal di level ini.", "info").then(() =>
//             navigate(`/category/${cid}`)
//           );
//           return;
//         }
//         setQuestions(arr);
//       } catch (e) {
//         console.error(e);
//         Swal.fire("Error", e.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadQuestions();
//   }, [cid, lid, navigate]);

//   // Setup initial slots
//   useEffect(() => {
//     if (!questions.length) return;
//     const ans = (questions[currentIdx].answer || "")
//       .toUpperCase()
//       .replace(/\s+/g, "");
//     const newSlots = Array(ans.length).fill("");
//     const newRevealed = Array(ans.length).fill(false);
//     if (ans.length > 0) {
//       const idx = Math.floor(Math.random() * ans.length);
//       newSlots[idx] = ans[idx];
//       newRevealed[idx] = true;
//       setHintIdx(idx);
//     }
//     setSlots(newSlots);
//     setRevealed(newRevealed);
//   }, [questions, currentIdx]);

//   // Initialize IronSource Web SDK
//   useEffect(() => {
//     if (window.IronSource) {
//       try {
//         window.IronSource.initialize("APP_KEY_KAMU", "rewardedVideo");
//         window.IronSource.on("rewardedVideoRewarded", () => {
//           revealOneLetter();
//           setShowAdModal(false);
//         });
//         window.IronSource.on("rewardedVideoClosed", () => {
//           setShowAdModal(false);
//         });
//         setSdkReady(true);
//       } catch (e) {
//         console.error("IronSource SDK gagal di-initialize:", e);
//       }
//     }
//   }, []);

//   function onKeyPress(letter) {
//     const firstEmpty = slots.indexOf("");
//     if (firstEmpty === -1) return;
//     const newSlots = [...slots];
//     newSlots[firstEmpty] = letter;
//     setSlots(newSlots);
//     if (!newSlots.includes("")) checkAnswer(newSlots.join(""));
//   }

//   function checkAnswer(str) {
//     const correct = (questions[currentIdx].answer || "")
//       .toUpperCase()
//       .replace(/\s+/g, "");
//     if (str === correct) {
//       Swal.fire("Benar!", "Kamu mendapat +10 koin", "success");
//       awardCoins(10);
//       unlockNextLevelThenProceed();
//     } else {
//       Swal.fire("Salah", "Jawaban belum benar. Coba lagi.", "error");
//       setSlots(slots.map((s, i) => (i === hintIdx ? s : "")));
//     }
//   }

//   async function awardCoins(n) {
//     if (!user) return;
//     const newCoins = (user.coins || 0) + n;
//     setUser({ ...user, coins: newCoins });
//     try {
//       await updateDoc(doc(db, "users", user.code), { coins: newCoins });
//     } catch (e) {
//       console.warn("Gagal update coins:", e.message);
//     }
//   }

//   async function unlockNextLevelThenProceed() {
//     if (!user) return;
//     const userRef = doc(db, "users", user.code);
//     const progress = user.progress || {};
//     const catProgress = progress[cid] || [];
//     if (!catProgress.includes(lid)) catProgress.push(lid);
//     progress[cid] = catProgress;
//     setUser({ ...user, progress });
//     try {
//       await updateDoc(userRef, { progress });
//     } catch (e) {
//       console.warn("Gagal update progress:", e.message);
//     }
//     if (currentIdx < questions.length - 1) {
//       setCurrentIdx(currentIdx + 1);
//     } else {
//       Swal.fire("Level Selesai!", "Level ini telah selesai.", "success").then(
//         () => navigate(`/category/${cid}`)
//       );
//     }
//   }

//   function revealOneLetter() {
//     const answer = (questions[currentIdx].answer || "")
//       .toUpperCase()
//       .replace(/\s+/g, "");
//     const emptyIdxs = slots
//       .map((s, i) => (s === "" ? i : null))
//       .filter((i) => i !== null);
//     if (!emptyIdxs.length) return;
//     const pick = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
//     const newSlots = [...slots];
//     newSlots[pick] = answer[pick];
//     setSlots(newSlots);
//     const r = [...revealed];
//     r[pick] = true;
//     setRevealed(r);
//     if (!newSlots.includes("")) checkAnswer(newSlots.join(""));
//   }

//   function useHintFree() {
//     if (!sdkReady) {
//       Swal.fire(
//         "Tunggu sebentar",
//         "Iklan sedang dipersiapkan, coba lagi sebentar.",
//         "info"
//       );
//       return;
//     }
//     if (!window.IronSource || !window.IronSource.hasRewardedVideo()) {
//       Swal.fire("Iklan belum tersedia", "Silakan coba lagi nanti.", "warning");
//       return;
//     }
//     setShowAdModal(true);
//     window.IronSource.showRewardedVideo();
//   }

//   if (loading) return <div className="p-6 text-white">Memuat...</div>;
//   if (!questions.length)
//     return <div className="p-6 text-white">Tidak ada soal.</div>;

//   const q = questions[currentIdx];
//   const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((r) =>
//     r.split("")
//   );

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden p-4">
//       <Header user={user} onOpenAccount={() => navigate("/account")} />

//       <main className="max-w-3xl mx-auto mt-6 space-y-6">
//         <div className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-purple-500/40">
//           <div className="flex flex-col md:flex-row gap-4 items-center">
//             <div className="w-28 flex-shrink-0">
//               <img
//                 src="/character.png"
//                 alt="Karakter"
//                 className="w-full h-auto rounded-xl shadow-lg"
//               />
//             </div>
//             <div className="flex-1">
//               <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
//                 {q.question}
//               </h3>
//               <div className="mt-4 flex flex-wrap gap-2">
//                 {slots.map((s, i) => (
//                   <div
//                     key={i}
//                     className={`w-10 h-12 md:w-12 md:h-14 border-2 rounded-md flex items-center justify-center text-lg font-bold
//                     ${
//                       revealed[i]
//                         ? "text-yellow-400 border-yellow-400"
//                         : "text-white border-white"
//                     } bg-gray-900/40 backdrop-blur-sm shadow-md`}
//                   >
//                     {s}
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-4 flex flex-wrap gap-2">
//                 <button
//                   onClick={useHintFree}
//                   className="flex items-center gap-1 px-3 py-1 bg-blue-500/90 hover:bg-blue-400 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
//                 >
//                   <FiVideo /> Hint Gratis
//                 </button>
//                 <button
//                   onClick={() => setShowStore(true)}
//                   className="flex items-center gap-1 px-3 py-1 bg-yellow-500/90 hover:bg-yellow-400 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
//                 >
//                   <FiDollarSign /> Toko Coin
//                 </button>
//                 <button
//                   onClick={() => Swal.fire("Belum implementasi")}
//                   className="flex items-center gap-1 px-3 py-1 bg-green-600/90 hover:bg-green-500 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
//                 >
//                   <FiZap /> Hint (15 Koin)
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Keyboard */}
//         <div className="bg-gray-900/50 backdrop-blur-sm p-3 rounded-2xl shadow-inner border border-purple-500/30">
//           {keyboardRows.map((row, ri) => (
//             <div key={ri} className="flex justify-center gap-2 mb-2 flex-wrap">
//               {row.map((key) => (
//                 <button
//                   key={key}
//                   onClick={() => onKeyPress(key)}
//                   className="w-10 h-10 md:w-12 md:h-12 bg-purple-700/70 hover:bg-purple-600 text-white font-bold rounded-md shadow-lg transition-transform transform hover:scale-110"
//                 >
//                   {key}
//                 </button>
//               ))}
//             </div>
//           ))}
//         </div>
//       </main>

//       {/* Modal Rewarded Video */}
//       {showAdModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
//           <div className="text-white text-center">
//             <p className="text-xl font-bold mb-4">Menampilkan iklan...</p>
//             <div className="loader border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin mx-auto"></div>
//             <p className="mt-2">
//               Tunggu hingga video selesai untuk mendapatkan hint.
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Header from "../components/Header";
import Swal from "sweetalert2";
import {
  FiDollarSign,
  FiZap,
  FiVideo,
  FiShoppingCart,
  FiArrowLeft,
} from "react-icons/fi";
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

  const [levelInfo, setLevelInfo] = useState(null);

  useEffect(() => {
    async function loadLevelInfo() {
      try {
        const docRef = doc(db, "categories", cid, "levels", lid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLevelInfo({ id: docSnap.id, ...docSnap.data() });
        } else {
          setLevelInfo({ id: lid, title: "Tidak ditemukan" });
        }
      } catch (e) {
        console.error(e);
        setLevelInfo({ id: lid, title: "Error" });
      }
    }
    loadLevelInfo();
  }, [cid, lid]);

  // Array gambar karakter
  const characterImages = [
    "/character.png",
    "/character1.png",
    "/character2.png",
    "/character3.png",
    "/character4.png",
    "/character5.png",
    "/character6.png",
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

  // IronSource SDK simulation
  useEffect(() => {
    setSdkReady(true);
  }, []);

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

  function useHintFree() {
    if (!sdkReady) {
      Swal.fire(
        "Tunggu sebentar",
        "Iklan sedang dipersiapkan, coba lagi sebentar.",
        "info"
      );
      return;
    }
    setShowAdModal(true);
    setTimeout(() => {
      revealOneLetter();
      setShowAdModal(false);
    }, 2000); // Simulasi rewarded video 2 detik
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
  const keyboardRows = ["AGQBMLE", "RZYKCHM", "DXVJWFT", "SNOPI"].map((r) =>
    r.split("")
  );

  function KeyboardKey({ letter, onPress, isBackspace }) {
    const [ripples, setRipples] = useState([]);

    const handleClick = (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = { x, y, key: Date.now() };
      setRipples((prev) => [...prev, newRipple]);

      onPress(letter);

      // Hapus ripple setelah animasi selesai
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
      }, 600); // durasi animasi
    };

    return (
      <button
        onClick={handleClick}
        className={`
        relative overflow-hidden
        ${
          isBackspace
            ? "w-20 h-10 md:w-24 md:h-12 bg-red-600 hover:bg-red-500"
            : "w-10 h-10 md:w-12 md:h-12 bg-purple-700/70 hover:bg-purple-600"
        }
        text-white font-bold rounded-md shadow-lg
        transition-transform transform hover:scale-110
      `}
      >
        {letter}
        {ripples.map((r) => (
          <span
            key={r.key}
            className="absolute rounded-full bg-white/50 animate-ripple"
            style={{
              left: r.x,
              top: r.y,
              width: 0,
              height: 0,
              transform: "translate(-50%, -50%)",
            }}
          ></span>
        ))}
      </button>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden ">
      <Header user={user} onOpenAccount={() => navigate("/account")} />

      <main className="max-w-3xl mx-auto  p-4 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              Swal.fire({
                title: "Yakin ingin keluar?",
                text: "Jika keluar, permainan akan dimulai dari awal.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya",
                cancelButtonText: "Batal",
              }).then((result) => {
                if (result.isConfirmed) {
                  setCurrentIdx(0);
                  if (questions.length > 0) {
                    const ans = (questions[0].answer || "")
                      .toUpperCase()
                      .replace(/\s+/g, "");
                    setSlots(Array(ans.length).fill(""));
                    setRevealed(Array(ans.length).fill(false));
                  }
                  navigate(`/category/${cid}`);
                }
              });
            }}
            className="flex items-center gap-2 px-3 py-1 bg-white/20 text-white hover:bg-white/30 font-semibold rounded-xl shadow-md transition-transform transform hover:scale-105"
          >
            <FiArrowLeft />
          </button>

          <span className="text-white font-bold text-lg md:text-xl drop-shadow-lg">
            {"Level " + levelInfo?.levelNumber || "Tidak ada judul"}
          </span>
          <span className="text-white/80 font-semibold">
            Soal {currentIdx + 1} / {questions.length}
          </span>
        </div>

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
        <div className="bg-gray-900/50 backdrop-blur-sm py-3 rounded-2xl shadow-inner border border-purple-500/30">
          {keyboardRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1 mb-2 flex-wrap">
              {row.map((key) => (
                <KeyboardKey key={key} letter={key} onPress={onKeyPress} />
              ))}
              {ri === keyboardRows.length - 1 && (
                <KeyboardKey letter="⌫" isBackspace onPress={onBackspace} />
              )}
            </div>
          ))}
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
