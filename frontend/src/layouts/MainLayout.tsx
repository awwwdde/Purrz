import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/widgets/Header";
import { Footer } from "@/widgets/Footer";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
}
