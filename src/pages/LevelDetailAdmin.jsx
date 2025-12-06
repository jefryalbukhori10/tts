// src/pages/LevelDetailAdmin.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Loading from "../components/Loading";
import HeaderAdmin from "../components/HeaderAdmin";
import { FiUsers, FiBookOpen, FiArrowLeft } from "react-icons/fi";

export default function LevelDetailAdmin() {
  const { catId, levelId } = useParams();
  const navigate = useNavigate();

  const [levelData, setLevelData] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load Level Detail
  //   useEffect(() => {
  //     const loadLevel = async () => {
  //       try {
  //         const lvlSnap = await getDoc(
  //           doc(db, "categories", catId, "levels", levelId)
  //         );

  //         if (!lvlSnap.exists()) return;

  //         setLevelData({ id: lvlSnap.id, ...lvlSnap.data() });

  //         // Load Questions count
  //         const qSnap = await getDocs(
  //           collection(db, "categories", catId, "levels", levelId, "questions")
  //         );
  //         setQuestionCount(qSnap.size);

  //         // Load UserProgress count
  //         const uSnap = await getDocs(
  //           collection(db, "categories", catId, "levels", levelId, "users")
  //         );
  //         setUserCount(uSnap.size);
  //       } catch (err) {
  //         console.log(err);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     loadLevel();
  //   }, [catId, levelId]);

  useEffect(() => {
    const loadLevel = async () => {
      try {
        const lvlSnap = await getDoc(
          doc(db, "categories", catId, "levels", levelId)
        );

        if (!lvlSnap.exists()) return;

        setLevelData({ id: lvlSnap.id, ...lvlSnap.data() });

        // Load Questions count
        const qSnap = await getDocs(
          collection(db, "categories", catId, "levels", levelId, "questions")
        );
        setQuestionCount(qSnap.size);

        // Load UserProgress count
        const usersSnap = await getDocs(collection(db, "users"));
        let count = 0;

        usersSnap.forEach((d) => {
          const data = d.data();
          const progress = data.progress || {};

          // Cek kalau kategori ini ada di progress user
          if (progress[catId] && progress[catId].includes(levelId)) {
            count++;
          }
        });

        setUserCount(count);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadLevel();
  }, [catId, levelId]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <HeaderAdmin />

      <div className="p-6">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/admin/category/${catId}`)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 mb-6"
          >
            <FiArrowLeft size={22} />
          </button>

          <h2 className="text-2xl font-bold mb-6">
            Level {levelData?.levelNumber}
          </h2>
        </div>
        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card Daftar Soal */}
          <div
            onClick={() =>
              navigate(`/admin/categories/${catId}/levels/${levelId}/questions`)
            }
            className="cursor-pointer bg-white/10 border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:bg-white/20 transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Daftar Soal</h3>
              <FiBookOpen size={28} />
            </div>
            <p className="text-lg mt-3">Total Soal: {questionCount}</p>
          </div>

          {/* Card Daftar User */}
          <div
            onClick={() =>
              navigate(`/admin/category/${catId}/level/${levelId}/users`)
            }
            className="cursor-pointer bg-white/10 border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:bg-white/20 transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Daftar User</h3>
              <FiUsers size={28} />
            </div>
            <p className="text-lg mt-3">Total User Selesai: {userCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
