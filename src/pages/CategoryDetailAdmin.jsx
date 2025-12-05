// src/pages/CategoryDetailAdmin.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiArrowLeft, FiTrash2, FiBookOpen, FiPlus } from "react-icons/fi";
import Loading from "../components/Loading";
import HeaderAdmin from "../components/HeaderAdmin";

export default function CategoryDetailAdmin() {
  const { catId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newLevelNumber, setNewLevelNumber] = useState("");

  // admin
  const [admin, setAdmin] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const levelsPerPage = 5;

  // Load Admin
  useEffect(() => {
    const loadAdmin = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return <Loading />;

      const adminSnap = await getDocs(
        query(collection(db, "users"), where("uid", "==", currentUser.uid))
      );

      if (adminSnap.empty) return;

      const docUser = adminSnap.docs[0];
      setAdmin({ id: docUser.id, ...docUser.data() });
    };

    loadAdmin();
  }, [navigate]);

  // Load category + levels
  useEffect(() => {
    const loadData = async () => {
      try {
        const catSnap = await getDoc(doc(db, "categories", catId));
        if (!catSnap.exists()) {
          Swal.fire("Error", "Kategori tidak ditemukan", "error");
          return <Loading />;
        }
        setCategory({ id: catSnap.id, ...catSnap.data() });

        const lvlSnap = await getDocs(
          collection(db, "categories", catId, "levels")
        );

        const lvlData = [];

        for (const lvl of lvlSnap.docs) {
          const qSnap = await getDocs(
            collection(db, "categories", catId, "levels", lvl.id, "questions")
          );

          lvlData.push({
            id: lvl.id,
            ...lvl.data(),
            questionsCount: qSnap.size,
          });
        }

        setLevels(lvlData.sort((a, b) => a.levelNumber - b.levelNumber));
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [catId, navigate]);

  // DELETE LEVEL
  const handleDeleteLevel = async (lvl) => {
    const confirm = await Swal.fire({
      title: "Hapus Level?",
      text: "Semua soal dalam level ini akan terhapus.",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      // hapus semua questions
      const qSnap = await getDocs(
        collection(db, "categories", catId, "levels", lvl.id, "questions")
      );

      for (const q of qSnap.docs) {
        await deleteDoc(
          doc(db, "categories", catId, "levels", lvl.id, "questions", q.id)
        );
      }

      // hapus level
      await deleteDoc(doc(db, "categories", catId, "levels", lvl.id));

      setLevels(levels.filter((l) => l.id !== lvl.id));

      Swal.fire("Berhasil", "Level dihapus", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ADD LEVEL
  const handleAddLevel = async () => {
    if (!newLevelNumber) {
      Swal.fire("Error", "Masukkan nomor level", "error");
      return;
    }

    const levelId = "level" + newLevelNumber;

    // 🔥 CEK APAKAH SUDAH ADA LEVEL INI DI STATE
    const exists = levels.some((lvl) => lvl.id === levelId);

    if (exists) {
      Swal.fire(
        "Level sudah ada",
        `Level ${newLevelNumber} sudah tersedia di kategori ini`,
        "warning"
      );
      return;
    }

    try {
      await setDoc(doc(db, "categories", catId, "levels", levelId), {
        id: levelId,
        levelNumber: Number(newLevelNumber),
      });
      setLevels(
        [
          ...levels,
          {
            id: levelId,
            levelNumber: Number(newLevelNumber),
            questionsCount: 0,
          },
        ].sort((a, b) => a.levelNumber - b.levelNumber)
      );

      setShowModal(false);
      setNewLevelNumber("");

      Swal.fire("Berhasil", "Level berhasil ditambahkan", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Pagination slice
  const indexOfLast = currentPage * levelsPerPage;
  const indexOfFirst = indexOfLast - levelsPerPage;
  const currentLevels = levels.slice(indexOfFirst, indexOfLast);

  // Total halaman
  const totalPages = Math.ceil(levels.length / levelsPerPage);

  // Change page
  const goNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* HEADER */}
      <HeaderAdmin admin={admin} />

      <div className="p-6">
        {/* Header Kategori */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/panel")}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
            >
              <FiArrowLeft size={22} />
            </button>

            <h2 className="text-xl font-bold">{category.name}</h2>
          </div>

          {/* Add Level Button */}
          <button
            onClick={() => setShowModal(true)}
            className="p-3 bg-green-500/80 hover:bg-green-500 rounded-full shadow-lg flex items-center justify-center transition border border-white/20"
          >
            <FiPlus size={22} />
          </button>
        </div>

        {/* Levels List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentLevels.map((lvl) => (
            <div
              key={lvl.id}
              className="p-5 bg-white/10 rounded-2xl shadow-xl backdrop-blur-md border border-white/10"
            >
              <h3 className="text-xl font-bold">Level {lvl.levelNumber}</h3>
              <p className="text-sm mt-1">Soal: {lvl.questionsCount}</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() =>
                    navigate(`/admin/category/${catId}/level/${lvl.id}`)
                  }
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FiBookOpen /> Buka
                </button>

                <button
                  onClick={() => handleDeleteLevel(lvl)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FiTrash2 /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* PAGINATION */}
        {levels.length > 5 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === 1
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              Previous
            </button>

            <span className="text-white text-lg font-bold">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === totalPages
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* MODAL ADD LEVEL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white text-black p-6 rounded-xl w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold mb-4">Tambah Level Baru</h3>

            <input
              type="number"
              placeholder="Masukkan nomor level"
              className="w-full p-2 border rounded-lg mb-4"
              value={newLevelNumber}
              onChange={(e) => setNewLevelNumber(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleAddLevel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
