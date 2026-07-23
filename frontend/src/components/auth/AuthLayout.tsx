import { motion } from 'framer-motion';
import AuthHero from './AuthHero';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

/**
 * AuthLayout - Split screen layout for authentication pages
 * Left side: Form content
 * Right side: Hero section with phone mockup
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex" >
      {/* Left Panel - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full lg:w-[45%] min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-20 pb-12 -mt-16 relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 text-white"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Vibely</span>
          </div>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {title}
          </h1>
          <p className="text-zinc-400 text-lg">
            {subtitle}
          </p>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Right Panel - Hero */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <AuthHero />
      </div>
    </div>
  );
};

export default AuthLayout;
