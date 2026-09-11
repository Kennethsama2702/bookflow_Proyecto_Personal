import { motion } from "framer-motion";
import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-spinner" />
      <p>Preparando tu panel...</p>
    </motion.div>
  );
}
