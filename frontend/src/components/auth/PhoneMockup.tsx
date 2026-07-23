import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

/**
 * PhoneMockup - Animated phone with Instagram-like feed preview
 * Shows a realistic phone displaying Vibely posts
 */
const PhoneMockup: React.FC = () => {
  // Sample posts for the feed
  const posts = [
    {
      id: 1,
      username: 'sarah_travels',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      likes: '2,847',
      caption: 'Sunset vibes in Santorini ✨',
      time: '2h',
    },
    {
      id: 2,
      username: 'alex_studio',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
      likes: '1,234',
      caption: 'New artwork dropping soon 🎨',
      time: '4h',
    },
    {
      id: 3,
      username: 'foodie_mike',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
      likes: '5,621',
      caption: 'Best pizza in NYC! 🍕',
      time: '6h',
    },
  ];

  return (
    <div className="relative">
      {/* Phone Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20 rounded-[3rem] blur-2xl" />
      
      {/* Phone Frame */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-[280px] h-[580px] bg-zinc-900 rounded-[3rem] p-2 border border-zinc-800 shadow-2xl"
      >
        {/* Phone Inner Frame */}
        <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20" />
          
          {/* Screen Content */}
          <div className="h-full overflow-hidden">
            {/* Status Bar */}
            <div className="h-12 bg-black flex items-end justify-between px-6 pb-1">
              <span className="text-white text-xs font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-3/4 h-full bg-white rounded-sm" />
                </div>
              </div>
            </div>

            {/* App Header */}
            <div className="h-12 bg-black flex items-center justify-between px-4 border-b border-zinc-900">
              <span className="text-white font-semibold text-lg">Vibely</span>
              <div className="flex items-center gap-4">
                <Heart className="w-5 h-5 text-white" />
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Feed - Scrolling Animation */}
            <motion.div
              animate={{ y: [0, -200, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-black"
            >
              {posts.map((post) => (
                <div key={post.id} className="border-b border-zinc-900">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.avatar}
                        alt={post.username}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/50"
                      />
                      <div>
                        <p className="text-white text-xs font-semibold">{post.username}</p>
                        <p className="text-zinc-500 text-[10px]">{post.time}</p>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                  </div>

                  {/* Post Image */}
                  <div className="relative aspect-square bg-zinc-900">
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Post Actions */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <Heart className="w-5 h-5 text-white fill-red-500 stroke-red-500" />
                        <MessageCircle className="w-5 h-5 text-white" />
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <Bookmark className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white text-xs font-semibold mb-1">{post.likes} likes</p>
                    <p className="text-white text-xs">
                      <span className="font-semibold">{post.username}</span>{' '}
                      <span className="text-zinc-400">{post.caption}</span>
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-700 rounded-full" />
      </motion.div>

      {/* Reflection */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[200px] h-20 bg-gradient-to-b from-violet-500/10 to-transparent blur-2xl rounded-full" />
    </div>
  );
};

export default PhoneMockup;
