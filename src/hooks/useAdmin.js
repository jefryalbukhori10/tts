import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function useAdmin() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const adminRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(adminRef);
          if (snap.exists() && snap.data().type === "admin") {
            setAdmin({ uid: firebaseUser.uid, ...snap.data() });
          } else {
            setAdmin(null);
          }
        } catch (e) {
          console.error("Gagal fetch admin:", e);
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { admin, loading };
}
