import { useState, useEffect, useRef } from "react";
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function generateCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function useLocalUser() {
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem("tts_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  // simpan unsubscribe listener
  const unsubRef = useRef(null);

  /**
   * Setup realtime listener setiap kali user berubah
   */
  useEffect(() => {
    // Hapus listener lama
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    if (!user?.code) return;

    // Pasang listener realtime ke Firestore
    const userRef = doc(db, "users", user.code);

    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserState(data); // update UI dan localStorage

        localStorage.setItem("tts_user", JSON.stringify(data));
      }
    });

    unsubRef.current = unsub;

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [user?.code]);

  /**
   * LokalStorage sync
   */
  useEffect(() => {
    if (user) localStorage.setItem("tts_user", JSON.stringify(user));
    else localStorage.removeItem("tts_user");
  }, [user]);

  /** CREATE USER */
  async function createUser(username) {
    const code = generateCode();
    const userDoc = {
      username,
      code,
      coins: 50,
      progress: {},
      createdAt: Date.now(),
    };

    await setDoc(doc(db, "users", code), userDoc);
    setUserState(userDoc);
    return userDoc;
  }

  /** LOGIN */
  async function loginWithCode(code) {
    const snap = await getDoc(doc(db, "users", code));
    if (!snap.exists()) throw new Error("Kode tidak ditemukan");
    const data = snap.data();
    setUserState(data);
    return data;
  }

  /** UPDATE USER */
  async function updateUser(updatedFields) {
    if (!user?.code) throw new Error("No user logged in");

    const userRef = doc(db, "users", user.code);
    await updateDoc(userRef, updatedFields);
    // tidak perlu setUserState — realtime listener akan update otomatis
  }

  return {
    user,
    createUser,
    loginWithCode,
    updateUser,
    setUser: setUserState,
  };
}
