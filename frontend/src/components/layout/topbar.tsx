import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Settings, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "../../context/themecontext";
import "./topbar.css";

interface Props {
  fullName: string;
  onLogout: () => void;
}

export default function TopBar({ fullName, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const firstName = fullName.split(" ")[0];
  const initial = fullName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <p className="topbar-greeting">
        Hola, <strong>{firstName}</strong> 👋
      </p>

      <div className="topbar-avatar-wrap" ref={menuRef}>
        <button
          className="topbar-avatar"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {initial}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="topbar-menu"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <div className="topbar-menu-header">
                <div className="topbar-avatar-lg">{initial}</div>
                <div>
                  <p className="topbar-menu-name">{fullName}</p>
                </div>
              </div>

              <button className="topbar-menu-item">
                <User size={16} /> Información personal
              </button>
              <button className="topbar-menu-item">
                <Settings size={16} /> Configuración del sistema
              </button>
              <button className="topbar-menu-item" onClick={toggleTheme}>
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </button>

              <div className="topbar-menu-divider" />

              <button className="topbar-menu-item danger" onClick={onLogout}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
