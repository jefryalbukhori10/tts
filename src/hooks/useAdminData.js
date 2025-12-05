// src/hooks/useAdminData.js
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useAdminData(adminUid) {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (!adminUid) return;

    const fetchAdmin = async () => {
      const ref = doc(db, "users", adminUid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setAdmin(snap.data());
      }
    };

    fetchAdmin();
  }, [adminUid]);

  return admin;
}
