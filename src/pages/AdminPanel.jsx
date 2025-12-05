// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Swal from "sweetalert2";
import {
  FiBookOpen,
  FiEdit,
  FiFilePlus,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import HeaderAdmin from "../components/HeaderAdmin";
import Loading from "../components/Loading";

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [categories, setCategories] = useState([]);
  const [levelsMap, setLevelsMap] = useState({}); // { catId: [levels] }
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDocs(
            query(collection(db, "users"), where("uid", "==", user.uid))
          );
          if (snap.empty) return;

          const docUser = snap.docs[0];
          setAdmin({ id: docUser.id, ...docUser.data() });

          // Ambil kategori
          const catQuery = query(
            collection(db, "categories"),
            where("adminUid", "==", docUser.id)
          );
          const catSnap = await getDocs(catQuery);
          const cats = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setCategories(cats);

          // Ambil semua level untuk kategori ini
          const map = {};
          for (const cat of cats) {
            const levelsSnap = await getDocs(
              collection(db, "categories", cat.id, "levels")
            );
            map[cat.id] = levelsSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
          }
          setLevelsMap(map);
        } catch (err) {
          console.error(err);
          Swal.fire("Error", err.message, "error");
        }
      } else {
        setAdmin(null);
      }
    });

    return () => unsub();
  }, []);

  async function editCategory(cat) {
    const { value: newName } = await Swal.fire({
      title: "Edit Kategori",
      input: "text",
      inputLabel: "Nama Kategori",
      inputValue: cat.name,
      showCancelButton: true,
    });

    if (newName) {
      const catRef = doc(db, "categories", cat.id);
      await updateDoc(catRef, { name: newName });
      setCategories(
        categories.map((c) => (c.id === cat.id ? { ...c, name: newName } : c))
      );
      Swal.fire("Berhasil", "Kategori diperbarui", "success");
    }
  }

  async function deleteCategory(cat) {
    const res = await Swal.fire({
      title: "Hapus kategori?",
      text: "Semua level dan soal di dalam kategori ini akan terhapus!",
      icon: "warning",
      showCancelButton: true,
    });

    if (res.isConfirmed) {
      try {
        // Hapus semua level & question
        const levels = levelsMap[cat.id] || [];
        for (const lvl of levels) {
          const questionsSnap = await getDocs(
            collection(db, "categories", cat.id, "levels", lvl.id, "questions")
          );
          for (const q of questionsSnap.docs) {
            await deleteDoc(
              doc(db, "categories", cat.id, "levels", lvl.id, "questions", q.id)
            );
          }
          await deleteDoc(doc(db, "categories", cat.id, "levels", lvl.id));
        }

        // Hapus kategori
        await deleteDoc(doc(db, "categories", cat.id));
        setCategories(categories.filter((c) => c.id !== cat.id));
        Swal.fire(
          "Berhasil",
          "Kategori dan semua level & soal dihapus",
          "success"
        );
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message, "error");
      }
    }
  }

  const handleAddCategory = async () => {
    const { value: name } = await Swal.fire({
      title: "Tambah Kategori",
      input: "text",
      inputLabel: "Nama Kategori",
      showCancelButton: true,
    });

    if (name) {
      const newDocRef = doc(collection(db, "categories"));
      await setDoc(newDocRef, { name, adminUid: admin.id });
      setCategories([
        ...categories,
        { id: newDocRef.id, name, adminUid: admin.id },
      ]);
      Swal.fire("Berhasil", "Kategori ditambahkan", "success");
    }
  };

  if (!admin)
    return (
      <>
        <Loading />
      </>
    );
  // console.log(admin);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <HeaderAdmin admin={admin} />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-gradient-to-tr from-purple-400 to-indigo-400 p-2 rounded-full">
              📂
            </span>
            Kategori
          </h2>

          <button
            onClick={handleAddCategory}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-green-400 to-green-600 rounded-full shadow-lg hover:scale-110 transition-transform"
            title="Tambah Kategori"
          >
            <FiPlus size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((cat) => {
            const levels = levelsMap[cat.id] || [];
            return (
              <div
                key={cat.id}
                className="flex flex-col justify-between p-6 rounded-2xl shadow-lg bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 hover:shadow-2xl transition-transform duration-300 hover:scale-105"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                  <p className="text-xs mb-4">
                    {levels.length} Level{levels.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex justify-between mt-4 gap-2">
                  <button
                    onClick={() => editCategory(cat)}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg hover:from-yellow-300 hover:to-yellow-500 text-black font-semibold transition"
                  >
                    <FiEdit /> Edit
                  </button>

                  <button
                    onClick={() => deleteCategory(cat)}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-700 rounded-lg hover:from-red-400 hover:to-red-600 font-semibold transition"
                  >
                    <FiTrash2 /> Hapus
                  </button>

                  <button
                    onClick={() => navigate(`/admin/category/${cat.id}`)}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg hover:from-cyan-300 hover:to-blue-400 font-semibold transition text-white"
                  >
                    <FiBookOpen /> Buka
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-full font-semibold transition ${
                currentPage === i + 1
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
