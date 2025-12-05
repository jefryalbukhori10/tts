import AdminPanel from "./pages/AdminPanel";
import CategoryDetailAdmin from "./pages/CategoryDetailAdmin";
import DaftarSoalPage from "./pages/DaftarSoalPage";
import DaftarUserPage from "./pages/DaftarUserPage";
import LevelDetailAdmin from "./pages/LevelDetailAdmin";
import ManageAdminPage from "./pages/ManageAdminPage";

export const adminRoutes = [
  { path: "/admin/panel", element: <AdminPanel /> },
  { path: "/admin/category/:catId", element: <CategoryDetailAdmin /> },
  {
    path: "/admin/category/:catId/level/:levelId",
    element: <LevelDetailAdmin />,
  },
  {
    path: "/admin/categories/:catId/levels/:levelId/questions",
    element: <DaftarSoalPage />,
  },
  {
    path: "/admin/category/:catId/level/:levelId/users",
    element: <DaftarUserPage />,
  },
  { path: "/admin/manage-admin", element: <ManageAdminPage /> },
];
