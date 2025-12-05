import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Loading from "../components/Loading";
import HeaderAdmin from "../components/HeaderAdmin";
import { FiArrowLeft } from "react-icons/fi";

export default function DaftarSoalPage() {
  const { catId, levelId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [inputQuestion, setInputQuestion] = useState("");
  const [inputAnswer, setInputAnswer] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const qSnap = await getDocs(
          collection(db, "categories", catId, "levels", levelId, "questions")
        );

        const arr = [];
        qSnap.forEach((d) =>
          arr.push({
            id: d.id,
            ...d.data(),
          })
        );

        setQuestions(arr);
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [catId, levelId]);

  const openAddModal = () => {
    setEditMode(false);
    setInputQuestion("");
    setInputAnswer("");
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditMode(true);
    setCurrentId(q.id);
    setInputQuestion(q.question);
    setInputAnswer(q.answer);
    setShowModal(true);
  };

  const saveQuestion = async () => {
    if (!inputQuestion || !inputAnswer) {
      Swal.fire("Error", "Pertanyaan dan Jawaban wajib diisi", "error");
      return;
    }

    try {
      if (editMode) {
        await updateDoc(
          doc(
            db,
            "categories",
            catId,
            "levels",
            levelId,
            "questions",
            currentId
          ),
          { question: inputQuestion, answer: inputAnswer.toUpperCase() }
        );

        setQuestions(
          questions.map((q) =>
            q.id === currentId
              ? {
                  ...q,
                  question: inputQuestion,
                  answer: inputAnswer.toUpperCase(),
                }
              : q
          )
        );

        Swal.fire("Berhasil", "Soal diperbarui!", "success");
      } else {
        const newDoc = await addDoc(
          collection(db, "categories", catId, "levels", levelId, "questions"),
          {
            question: inputQuestion,
            answer: inputAnswer.toUpperCase(),
          }
        );

        setQuestions([
          ...questions,
          {
            id: newDoc.id,
            question: inputQuestion,
            answer: inputAnswer.toUpperCase(),
          },
        ]);

        Swal.fire("Berhasil", "Soal ditambahkan!", "success");
      }

      setShowModal(false);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const deleteQuestion = (id) => {
    Swal.fire({
      title: "Hapus soal ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Hapus",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await deleteDoc(
          doc(db, "categories", catId, "levels", levelId, "questions", id)
        );

        setQuestions(questions.filter((q) => q.id !== id));
        Swal.fire("Terhapus!", "Soal berhasil dihapus", "success");
      }
    });
  };

  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const currentData = questions.slice(first, last);

  const totalPages = Math.ceil(questions.length / itemsPerPage);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0f29] to-black text-white">
      <HeaderAdmin />

      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-lg font-extrabold mb-4 tracking-wide neon-text flex items-center gap-3">
          <button
            onClick={() =>
              navigate(`/admin/category/${catId}/level/${levelId}`)
            }
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            <FiArrowLeft size={22} />
          </button>
          Daftar Soal — Level {levelId}
        </h2>

        <button
          onClick={openAddModal}
          className="px-5 py-2 mb-4 rounded-lg bg-[#14b8a6] hover:bg-[#0d9488] transition-all shadow-lg neon-btn"
        >
          + Tambah Soal
        </button>

        {/* TABEL SOAL */}
        <div className="overflow-x-auto mt-4 rounded-xl shadow-xl border border-white/10">
          <table className="min-w-full table-auto text-white">
            <thead className="bg-gradient-to-r from-purple-700/40 to-blue-700/40 backdrop-blur-xl">
              <tr>
                <th className="px-3 py-3 text-left w-[40px]">No</th>
                <th className="px-3 py-3 text-left">Pertanyaan</th>
                <th className="px-3 py-3 text-left w-[120px]">Jawaban</th>
                <th className="px-3 py-3 text-center w-[120px]">Aksi</th>
              </tr>
            </thead>

            <tbody className="backdrop-blur-xl bg-white/5">
              {questions.map((q, index) => (
                <tr key={q.id} className="border-b border-white/10">
                  <td className="px-3 py-4 align-top">{index + 1}</td>

                  {/* PERTANYAAN WRAP */}
                  <td className="px-3 py-4 whitespace-normal break-words">
                    {q.question}
                  </td>

                  <td className="px-3 py-4 font-bold text-cyan-300 uppercase">
                    {q.answer}
                  </td>

                  {/* BUTTON EDIT / HAPUS */}
                  <td className="px-3 py-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(q)}
                      className="px-3 py-1 mr-2 rounded bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === i + 1
                  ? "bg-[#6366f1] text-white neon-btn"
                  : "bg-white/10 text-white border border-white/20"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 w-full max-w-xl rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold neon-text mb-4">
                {editMode ? "Edit Soal" : "Tambah Soal"}
              </h2>

              <label>Pertanyaan:</label>
              <textarea
                className="w-full p-3 mt-1 rounded bg-black/30 border border-white/20 h-40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
              />

              <label className="block mt-4">Jawaban:</label>
              <input
                className="w-full p-3 rounded bg-black/30 border border-white/20 text-white focus:ring-2 focus:ring-cyan-400"
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400"
                >
                  Tutup
                </button>
                <button
                  onClick={saveQuestion}
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 neon-btn"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
