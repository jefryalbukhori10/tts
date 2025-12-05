// import React, { useState, useEffect } from "react";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   updateDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "../firebase";
// import { useNavigate, useParams } from "react-router-dom";
// import Swal from "sweetalert2";
// import Loading from "../components/Loading";
// import HeaderAdmin from "../components/HeaderAdmin";
// import { FiArrowLeft } from "react-icons/fi";

// export default function DaftarSoalPage() {
//   const { catId, levelId } = useParams();
//   const navigate = useNavigate();

//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentId, setCurrentId] = useState(null);

//   const [inputQuestion, setInputQuestion] = useState("");
//   const [inputAnswer, setInputAnswer] = useState("");

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const qSnap = await getDocs(
//           collection(db, "categories", catId, "levels", levelId, "questions")
//         );

//         const arr = [];
//         qSnap.forEach((d) =>
//           arr.push({
//             id: d.id,
//             ...d.data(),
//           })
//         );

//         setQuestions(arr);
//       } catch (err) {
//         Swal.fire("Error", err.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [catId, levelId]);

//   const openAddModal = () => {
//     setEditMode(false);
//     setInputQuestion("");
//     setInputAnswer("");
//     setShowModal(true);
//   };

//   const openEditModal = (q) => {
//     setEditMode(true);
//     setCurrentId(q.id);
//     setInputQuestion(q.question);
//     setInputAnswer(q.answer);
//     setShowModal(true);
//   };

//   const saveQuestion = async () => {
//     if (!inputQuestion || !inputAnswer) {
//       Swal.fire("Error", "Pertanyaan dan Jawaban wajib diisi", "error");
//       return;
//     }

//     try {
//       if (editMode) {
//         await updateDoc(
//           doc(
//             db,
//             "categories",
//             catId,
//             "levels",
//             levelId,
//             "questions",
//             currentId
//           ),
//           { question: inputQuestion, answer: inputAnswer.toUpperCase() }
//         );

//         setQuestions(
//           questions.map((q) =>
//             q.id === currentId
//               ? {
//                   ...q,
//                   question: inputQuestion,
//                   answer: inputAnswer.toUpperCase(),
//                 }
//               : q
//           )
//         );

//         Swal.fire("Berhasil", "Soal diperbarui!", "success");
//       } else {
//         const newDoc = await addDoc(
//           collection(db, "categories", catId, "levels", levelId, "questions"),
//           {
//             question: inputQuestion,
//             answer: inputAnswer.toUpperCase(),
//           }
//         );

//         setQuestions([
//           ...questions,
//           {
//             id: newDoc.id,
//             question: inputQuestion,
//             answer: inputAnswer.toUpperCase(),
//           },
//         ]);

//         Swal.fire("Berhasil", "Soal ditambahkan!", "success");
//       }

//       setShowModal(false);
//     } catch (err) {
//       Swal.fire("Error", err.message, "error");
//     }
//   };

//   const deleteQuestion = (id) => {
//     Swal.fire({
//       title: "Hapus soal ini?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Hapus",
//     }).then(async (res) => {
//       if (res.isConfirmed) {
//         await deleteDoc(
//           doc(db, "categories", catId, "levels", levelId, "questions", id)
//         );

//         setQuestions(questions.filter((q) => q.id !== id));
//         Swal.fire("Terhapus!", "Soal berhasil dihapus", "success");
//       }
//     });
//   };

//   const last = currentPage * itemsPerPage;
//   const first = last - itemsPerPage;
//   const currentData = questions.slice(first, last);

//   const totalPages = Math.ceil(questions.length / itemsPerPage);

//   if (loading) return <Loading />;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0f29] to-black text-white">
//       <HeaderAdmin />

//       <div className="p-6 max-w-6xl mx-auto">
//         <h2 className="text-lg font-extrabold mb-4 tracking-wide neon-text flex items-center gap-3">
//           <button
//             onClick={() =>
//               navigate(`/admin/category/${catId}/level/${levelId}`)
//             }
//             className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
//           >
//             <FiArrowLeft size={22} />
//           </button>
//           Daftar Soal — Level {levelId}
//         </h2>

//         <button
//           onClick={openAddModal}
//           className="px-5 py-2 mb-4 rounded-lg bg-[#14b8a6] hover:bg-[#0d9488] transition-all shadow-lg neon-btn"
//         >
//           + Tambah Soal
//         </button>

//         {/* TABEL SOAL */}
//         <div className="overflow-x-auto mt-4 rounded-xl shadow-xl border border-white/10">
//           <table className="min-w-full table-auto text-white">
//             <thead className="bg-gradient-to-r from-purple-700/40 to-blue-700/40 backdrop-blur-xl">
//               <tr>
//                 <th className="px-3 py-3 text-left w-[40px]">No</th>
//                 <th className="px-3 py-3 text-left">Pertanyaan</th>
//                 <th className="px-3 py-3 text-left w-[120px]">Jawaban</th>
//                 <th className="px-3 py-3 text-center w-[120px]">Aksi</th>
//               </tr>
//             </thead>

//             <tbody className="backdrop-blur-xl bg-white/5">
//               {questions.map((q, index) => (
//                 <tr key={q.id} className="border-b border-white/10">
//                   <td className="px-3 py-4 align-top">{index + 1}</td>

//                   {/* PERTANYAAN WRAP */}
//                   <td className="px-3 py-4 whitespace-normal break-words">
//                     {q.question}
//                   </td>

//                   <td className="px-3 py-4 font-bold text-cyan-300 uppercase">
//                     {q.answer}
//                   </td>

//                   {/* BUTTON EDIT / HAPUS */}
//                   <td className="px-3 py-4 text-center whitespace-nowrap">
//                     <button
//                       onClick={() => openEditModal(q)}
//                       className="px-3 py-1 mr-2 rounded bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
//                     >
//                       Edit
//                     </button>

//                     <button
//                       onClick={() => deleteQuestion(q.id)}
//                       className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
//                     >
//                       Hapus
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* PAGINATION */}
//         <div className="flex justify-center gap-2 mt-4">
//           {Array.from({ length: totalPages }).map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setCurrentPage(i + 1)}
//               className={`px-3 py-1 rounded-lg ${
//                 currentPage === i + 1
//                   ? "bg-[#6366f1] text-white neon-btn"
//                   : "bg-white/10 text-white border border-white/20"
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>

//         {/* MODAL */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center p-4">
//             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 w-full max-w-xl rounded-xl shadow-2xl">
//               <h2 className="text-2xl font-bold neon-text mb-4">
//                 {editMode ? "Edit Soal" : "Tambah Soal"}
//               </h2>

//               <label>Pertanyaan:</label>
//               <textarea
//                 className="w-full p-3 mt-1 rounded bg-black/30 border border-white/20 h-40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
//                 value={inputQuestion}
//                 onChange={(e) => setInputQuestion(e.target.value)}
//               />

//               <label className="block mt-4">Jawaban:</label>
//               <input
//                 className="w-full p-3 rounded bg-black/30 border border-white/20 text-white focus:ring-2 focus:ring-cyan-400"
//                 value={inputAnswer}
//                 onChange={(e) => setInputAnswer(e.target.value)}
//               />

//               <div className="flex justify-end gap-2 mt-5">
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400"
//                 >
//                   Tutup
//                 </button>
//                 <button
//                   onClick={saveQuestion}
//                   className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 neon-btn"
//                 >
//                   Simpan
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

//new
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
import {
  FiArrowLeft,
  FiDownload,
  FiPlus,
  FiPlusCircle,
  FiUpload,
  FiUploadCloud,
} from "react-icons/fi";
import * as XLSX from "xlsx";

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
  const [uploading, setUploading] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);

  const openImportModal = () => setShowImportModal(true);
  const closeImportModal = () => setShowImportModal(false);

  // ===== Load data =====
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

  // ===== Modal tambah / edit =====
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
          { question: inputQuestion, answer: inputAnswer.toUpperCase() }
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

  // ===== Delete soal =====
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

  // ===== Pagination =====
  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const currentData = questions.slice(first, last);
  const totalPages = Math.ceil(questions.length / itemsPerPage);

  // ===== Upload Excel =====
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // PERINGATAN STRUKTUR EXCEL
    const confirmUpload = await Swal.fire({
      title: "Peringatan",
      html: `
      Pastikan struktur Excel tidak diubah.<br>
      Header harus: <b>question</b> | <b>answer</b><br>
      Upload akan menambahkan semua soal ke level ini.
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Lanjutkan",
      cancelButtonText: "Batal",
    });

    if (!confirmUpload.isConfirmed) return;

    setUploading(true); // MULAI LOADING

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        Swal.fire("Error", "File Excel kosong!", "error");
        setUploading(false);
        return;
      }

      try {
        const batch = [];
        for (const row of jsonData) {
          if (row.question && row.answer) {
            const docRef = await addDoc(
              collection(
                db,
                "categories",
                catId,
                "levels",
                levelId,
                "questions"
              ),
              {
                question: row.question,
                answer: row.answer.toString().toUpperCase(),
              }
            );
            batch.push({
              id: docRef.id,
              question: row.question,
              answer: row.answer.toString().toUpperCase(),
            });
          }
        }

        setQuestions([...questions, ...batch]);
        Swal.fire(
          "Berhasil",
          `${batch.length} soal berhasil ditambahkan!`,
          "success"
        );
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setUploading(false); // SELESAI LOADING
        setShowImportModal(false);
        e.target.value = "";
      }
    };
  };

  // ===== Download Template Excel =====
  const downloadTemplate = async () => {
    const confirm = await Swal.fire({
      title: "Peringatan",
      html: `
      Pastikan header Excel <b>tidak diubah</b>.<br>
      Header harus: <b>question</b> | <b>answer</b>.<br>
      Gunakan template ini untuk menambahkan soal banyak sekaligus.
    `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Download Template",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    // BUAT DAN DOWNLOAD FILE EXCEL
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["question", "answer"],
      ["Siapa nabi terakhir?", "MUHAMMAD"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "TemplateSoal");
    XLSX.writeFile(wb, "Template_Soal.xlsx");
  };

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

        {/* Tambah & Upload & Template */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#14b8a6] hover:bg-[#0d9488] transition-all shadow-lg neon-btn"
          >
            <FiPlusCircle size={20} />
            Tambah Soal (1 per 1)
          </button>

          <button
            onClick={openImportModal}
            className="flex items-center gap-2 mt-2 px-5 py-2 rounded-lg bg-purple-500 hover:bg-[#d97706] text-black shadow-lg"
          >
            <FiUploadCloud size={20} />
            Import Excel (Banyak sekaligus)
          </button>
          {/* <input
            type="file"
            accept=".xlsx"
            onChange={handleExcelUpload}
            className="p-2 rounded bg-white/10 text-white cursor-pointer"
          />

          <button
            onClick={downloadTemplate}
            className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg"
          >
            Download Template Excel
          </button> */}
        </div>

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
              {currentData.map((q, index) => (
                <tr key={q.id} className="border-b border-white/10">
                  <td className="px-3 py-4 align-top">{first + index + 1}</td>
                  <td className="px-3 py-4 whitespace-normal break-words">
                    {q.question}
                  </td>
                  <td className="px-3 py-4 font-bold text-cyan-300 uppercase">
                    {q.answer}
                  </td>
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
        {uploading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
            <div className="bg-white p-6 rounded shadow-lg flex items-center gap-3 pointer-events-none">
              <div className="loader border-4 border-t-4 border-gray-200 border-t-gray-800 rounded-full w-8 h-8 animate-spin"></div>
              <span className="text-black">Uploading, mohon tunggu...</span>
            </div>
          </div>
        )}

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

        {/* Modal Import */}
        {showImportModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 w-full max-w-md rounded-xl shadow-2xl text-white">
              <h2 className="text-xl font-bold mb-4 neon-text">
                Import Soal dari Excel
              </h2>

              {/* Input file */}
              <label className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-lg bg-[#14b8a6] hover:bg-[#0d9488] cursor-pointer text-center">
                <FiUpload size={20} />
                Upload File Excel
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>

              {/* Download template */}
              <button
                onClick={downloadTemplate}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black mb-4"
              >
                <FiDownload size={20} />
                Download Template Excel
              </button>

              {/* Tutup modal */}
              <button
                onClick={closeImportModal}
                className="w-full px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-400 mt-2"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
