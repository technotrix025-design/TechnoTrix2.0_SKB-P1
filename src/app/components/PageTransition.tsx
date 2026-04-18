import { motion } from 'motion/react';
import { useLocation, Outlet } from 'react-router';

/**
 * Wraps <Outlet /> with a smooth Framer Motion fade+slide transition
 * on every route change. Gives the app a native-app feel.
 */
export function PageTransition() {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Outlet />
    </motion.div>
  );
}
