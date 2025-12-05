// src/pages/admin/DaftarUserPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import HeaderAdmin from "../components/HeaderAdmin";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";

export default function DaftarUserPage() {
  const { levelId } = useParams(); // catId tidak perlu kalau data user di collection users
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const arr = [];

        snap.forEach((d) => {
          const data = d.data();

          const progress = data.progress || {};
          let completed = false;

          // cek apakah levelId ada di salah satu key progress
          for (let key in progress) {
            if (progress[key].includes(levelId)) {
              console.log(data);

              completed = true;
              break;
            }
          }

          if (completed) {
            arr.push({
              id: d.id,
              ...data,
            });
          }
        });

        setUsers(arr);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [levelId]);

  if (loading) return <Loading />;

  const deleteUser = (uid) => {
    Swal.fire({
      title: "Hapus User ini?",
      text: "Data progres user akan hilang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Hapus",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await deleteDoc(doc(db, "users", uid));

        setUsers(users.filter((u) => u.id !== uid));

        Swal.fire("Terhapus!", "Data user berhasil dihapus.", "success");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0e1133] to-black text-white">
      <HeaderAdmin />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            <FiArrowLeft size={22} />
          </button>

          <h2 className="text-lg font-extrabold tracking-wide neon-text">
            Daftar User — Level {levelId}
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-xl border border-white/10">
          <table className="min-w-full table-auto text-white">
            <thead className="bg-gradient-to-r from-blue-700/40 to-purple-700/40 backdrop-blur-xl">
              <tr>
                <th className="py-3 px-4 text-left">No</th>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="bg-white/5 backdrop-blur-xl">
              {users.map((u, i) => (
                <tr key={u.id} className="border-b border-white/10">
                  <td className="py-3 px-4 align-top">{i + 1}</td>
                  <td className="py-3 px-4 break-words">{u.username || "-"}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded shadow-lg shadow-red-600/30 flex items-center gap-2 mx-auto"
                    >
                      <FiTrash2 size={16} /> Hapus
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-gray-300 italic"
                  >
                    Belum ada user yang menyelesaikan level ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
