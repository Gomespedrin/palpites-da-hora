import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes.tsx";
import { Toaster } from "@/components/ui/toaster";
import './index.css'

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <RouterProvider router={router} />
      <Toaster />
    </Suspense>
  </React.StrictMode>,
);
