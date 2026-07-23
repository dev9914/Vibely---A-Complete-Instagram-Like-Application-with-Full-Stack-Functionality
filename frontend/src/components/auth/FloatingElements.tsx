import { motion } from 'framer-motion';
import { Heart, MessageCircle, UserPlus, Star, Sparkles } from 'lucide-react';

/**
 * FloatingElements - Animated floating social icons
 * Creates an engaging visual effect around the phone mockup
 */
const FloatingElements: React.FC = () => {
  const elements = [
    {
      Icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-500/20',
      position: 'top-32 left-8',
      delay: 0,
      duration: 4,
    },
    {
      Icon: MessageCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-400/20',
      position: 'top-48 right-12',
      delay: 0.5,
      duration: 5,
    },
    {
      Icon: UserPlus,
      color: 'text-green-400',
      bg: 'bg-green-400/20',
      position: 'top-72 left-16',
      delay: 1,
      duration: 4.5,
    },
    {
      Icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/20',
      position: 'bottom-48 right-20',
      delay: 1.5,
      duration: 5.5,
    },
    {
      Icon: Sparkles,
      color: 'text-violet-400',
      bg: 'bg-violet-400/20',
      position: 'bottom-64 left-24',
      delay: 2,
      duration: 4,
    },
    {
      Icon: Heart,
      color: 'text-pink-400',
      bg: 'bg-pink-400/20',
      position: 'top-20 right-32',
      delay: 0.8,
      duration: 5,
    },
  ];

  // Notification badges
  const notifications = [
    {
      text: '+128 likes',
      position: 'top-40 right-4',
      delay: 1,
    },
    {
      text: 'New follower!',
      position: 'bottom-56 left-4',
      delay: 2.5,
    },
    {
      text: '🔥 Trending',
      position: 'top-64 left-2',
      delay: 3.5,
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating Icons */}
      {elements.map(({ Icon, color, bg, position, delay, duration }, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
            y: [0, -20, 0, 20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            delay,
            duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute ${position}`}
        >
          <div className={`${bg} backdrop-blur-sm p-3 rounded-2xl border border-white/10 shadow-lg`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </motion.div>
      ))}

      {/* Notification Badges */}
      {notifications.map(({ text, position, delay }, index) => (
        <motion.div
          key={`notif-${index}`}
          initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: 0,
          }}
          transition={{
            delay,
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute ${position}`}
        >
          <div className="bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-zinc-800 shadow-lg">
            <span className="text-xs font-medium text-white">{text}</span>
          </div>
        </motion.div>
      ))}

      {/* Particle Dots */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.5, 0],
            y: [0, -100],
          }}
          transition={{
            delay: i * 0.3,
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-1 h-1 bg-violet-400/50 rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            bottom: `${Math.random() * 30}%`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;
