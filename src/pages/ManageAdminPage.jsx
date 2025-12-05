import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import HeaderAdmin from "../components/HeaderAdmin";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";

export default function ManageAdminPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const adminsPerPage = 10;

  // Load admins
  const loadAdmins = async () => {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);

    const adminsData = snap.docs
      .map((d) => ({ uid: d.id, ...d.data() }))
      .filter((u) => u.type === "admin");

    setAdmins(adminsData);
    setLoading(false);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setEditId(null);
  };

  const handleSave = async () => {
    if (!name || !email) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Nama & Email wajib diisi!",
      });
      return;
    }

    try {
      if (editId) {
        // UPDATE ADMIN
        await setDoc(
          doc(db, "users", editId),
          { name, email },
          { merge: true }
        );
      } else {
        // CREATE NEW ADMIN
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          name,
          email,
          type: "admin",
          coins: 0,
          code: null,
          createdAt: serverTimestamp(),
        });
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Admin ${editId ? "diupdate" : "ditambahkan"}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      resetForm();
      setModalOpen(false);
      loadAdmins();
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menyimpan data admin!",
      });
    }
  };

  const handleDelete = async (uid) => {
    const result = await Swal.fire({
      title: "Yakin?",
      text: "Admin ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "users", uid));
      Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "Admin berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });
      loadAdmins();
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * adminsPerPage;
  const indexOfFirst = indexOfLast - adminsPerPage;
  const currentAdmins = admins.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(admins.length / adminsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] text-white font-sans relative overflow-hidden">
      <HeaderAdmin />

      {/* Background futuristik grid */}
      <div className="absolute inset-0 bg-grid-neon pointer-events-none"></div>

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/admin/panel`)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            <FiHome size={22} />
          </button>
          <h1 className="text-3xl font-extrabold mb-6 text-gradient-neon">
            Kelola Admin
          </h1>
        </div>

        {/* <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="bg-blue-500/80 hover:bg-blue-600/80 px-5 py-2 rounded-full shadow-lg text-white text-lg transition-all duration-300 glow-button"
        >
          + Tambah Admin
        </button> */}

        {/* TABLE ADMIN */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-white backdrop-blur-md bg-black/40 shadow-lg rounded-xl border border-gray-700">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="p-3 text-left text-cyan-400 uppercase tracking-wider">
                  Nama
                </th>
                <th className="p-3 text-left text-cyan-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="p-3 text-center text-cyan-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    Belum ada admin
                  </td>
                </tr>
              ) : (
                currentAdmins.map((admin) => (
                  <tr
                    key={admin.uid}
                    className="border-b border-gray-700 hover:bg-white/5 transition-all"
                  >
                    <td className="p-3">{admin.name}</td>
                    <td className="p-3">{admin.email}</td>
                    <td className="p-3 text-center flex gap-3 justify-center">
                      <button
                        className="px-4 py-1 bg-yellow-500/80 hover:bg-yellow-600/80 rounded-full shadow-inner transition-all glow-button"
                        onClick={() => {
                          setEditId(admin.uid);
                          setName(admin.name);
                          setEmail(admin.email);
                          setPassword("");
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>

                      {/* Hanya tampilkan tombol Hapus jika admin bukan yang login */}
                      {admin.uid !== auth.currentUser.uid && (
                        <button
                          className="px-4 py-1 bg-red-600/80 hover:bg-red-700/80 rounded-full shadow-inner transition-all glow-button"
                          onClick={() => handleDelete(admin.uid)}
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    currentPage === i + 1
                      ? "bg-cyan-500 shadow-lg glow-button"
                      : "bg-gray-700/60 hover:bg-gray-600/60"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FORM */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-20">
            <div className="bg-black/80 p-6 rounded-2xl shadow-xl w-96 border border-cyan-400/40 animate-fade-in backdrop-blur-md">
              <h2 className="text-2xl font-bold mb-4 text-gradient-neon">
                {editId ? "Edit Admin" : "Tambah Admin"}
              </h2>

              <input
                className="w-full p-3 mb-3 border border-gray-600 rounded-lg bg-black/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all"
                placeholder="Nama Admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full p-3 mb-3 border border-gray-600 rounded-lg bg-black/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all"
                placeholder="Email Admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {!editId && (
                <input
                  className="w-full p-3 mb-3 border border-gray-600 rounded-lg bg-black/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                />
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-all"
                  onClick={() => setModalOpen(false)}
                >
                  Batal
                </button>

                <button
                  className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600/80 rounded-full text-white glow-button transition-all"
                  onClick={handleSave}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles khusus untuk futuristik */}
      <style>
        {`
          .text-gradient-neon {
            background: linear-gradient(90deg, #00ffff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .glow-button {
            box-shadow: 0 0 10px #00ffff55, 0 0 20px #ff00ff55;
          }

          .bg-grid-neon {
            background-image: 
              radial-gradient(circle, rgba(0,255,255,0.05) 1px, transparent 1px),
              radial-gradient(circle, rgba(255,0,255,0.05) 1px, transparent 1px);
            background-size: 40px 40px;
            background-position: 0 0, 20px 20px;
          }

          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
