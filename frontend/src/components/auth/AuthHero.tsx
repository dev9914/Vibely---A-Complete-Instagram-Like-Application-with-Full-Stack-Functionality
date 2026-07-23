import { motion } from 'framer-motion';
import PhoneMockup from './PhoneMockup';
import FloatingElements from './FloatingElements';

/**
 * AuthHero - Right panel hero section
 * Contains stats, phone mockup, and floating elements
 */
const AuthHero: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0f0a1a] via-[#0a0a0a] to-[#0a0f1a] overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px]" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-12">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              1M+ posts shared.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Infinite connections.
            </span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-md mx-auto">
            Join thousands of creators sharing their moments with the world.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mb-12"
        >
          <div className="px-6 py-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm shadow-lg shadow-violet-500/25">
            Join Now
          </div>
        </motion.div>

        {/* Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <PhoneMockup />
        </motion.div>

        {/* Floating Elements */}
        <FloatingElements />
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </div>
  );
};

export default AuthHero;
