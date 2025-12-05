// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Menu from "./pages/Menu";
import Category from "./pages/Category";
import GamePage from "./pages/GamePage";
import Account from "./pages/Account";
import { useLocalUser } from "./hooks/useLocalUser";
import Welcome from "./pages/Welcome";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import CategoryDetailAdmin from "./pages/CategoryDetailAdmin";
import LevelDetailAdmin from "./pages/LevelDetailAdmin";
import DaftarSoalPage from "./pages/DaftarSoalPage";
import DaftarUserPage from "./pages/DaftarUserPage";
import ManageAdminPage from "./pages/ManageAdminPage";

/**
 * App: central routing + pass user hooks to pages
 */
export default function App() {
  const { user, createUser, loginWithCode, updateUser, setUser } =
    useLocalUser();

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/menu" element={<Menu user={user} setUser={setUser} />} />
      <Route
        path="/account"
        element={
          <Account
            user={user}
            createUser={createUser}
            loginWithCode={loginWithCode}
            setUser={setUser}
          />
        }
      />
      <Route
        path="/category/:cid"
        element={<Category user={user} setUser={setUser} />}
      />
      <Route
        path="/category/:cid/level/:lid"
        element={
          <GamePage user={user} setUser={setUser} updateUser={updateUser} />
        }
      />
      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/panel" element={<AdminPanel />} />
      <Route path="/admin/category/:catId" element={<CategoryDetailAdmin />} />
      <Route
        path="/admin/category/:catId/level/:levelId"
        element={<LevelDetailAdmin />}
      />
      <Route
        path="/admin/categories/:catId/levels/:levelId/questions"
        element={<DaftarSoalPage />}
      />
      <Route
        path="/admin/category/:catId/level/:levelId/users"
        element={<DaftarUserPage />}
      />
      <Route path="/admin/manage-admin" element={<ManageAdminPage />} />

      <Route
        path="*"
        element={<div style={{ padding: 24 }}>Halaman tidak ditemukan</div>}
      />
    </Routes>
  );
}
