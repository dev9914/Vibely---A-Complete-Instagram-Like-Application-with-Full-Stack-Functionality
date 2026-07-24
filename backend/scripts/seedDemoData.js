
import "../src/config/env.js";
import connectDb, { disconnectDb } from "../src/db/DbConnect.js";
import { User } from "../src/models/user.models.js";
import { Post } from "../src/models/post.model.js";
import Conversation from "../src/models/conversation.model.js";
import Message from "../src/models/message.model.js";
import { Notification } from "../src/models/notification.model.js";
import { findOrCreateConversation } from "../src/services/message.service.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Utility functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = (arr) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Demo data arrays for realistic content
const demoFirstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Jamie", "Riley", "Avery", "Quinn", "Parker"];
const demoLastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const demoUsernames = ["alex123", "jordan_2024", "taylor_photos", "morgan_travels", "casey_codes", "jamie_fitness", "riley_art", "avery_cooks", "quinn_music", "parker_gaming"];
const demoEmails = demoUsernames.map(u => `${u}@example.com`);

const realisticCaptions = [
  "Sunrise adventures 🌅✨",
  "Coffee and good vibes ☕️",
  "Exploring new places! 🗺️",
  "Grateful for today 🙏",
  "Weekend mode activated 🎉",
  "Nature never fails to amaze 🌿",
  "Best day with friends! 🥳",
  "Learning something new every day 📚",
  "Fitness journey continues 💪",
  "Foodie heaven 🍕🍔",
  "Art is everywhere 🎨",
  "Music is my therapy 🎶",
  "Gaming night with the crew 🎮",
  "Coding and coffee, perfect combo 💻",
  "Travel memories that last forever ✈️",
  "Just chilling 😎",
  "Work hard, play harder 💼",
  "Pet parent life 🐶🐱",
  "Fashion forward 👗👔",
  "Beautiful sunset tonight 🌇"
];

const realisticComments = [
  "Wow, this is amazing! 😍",
  "Love this! ❤️",
  "Great shot! 📸",
  "So beautiful! 🌺",
  "Incredible! 👏",
  "This is awesome! 🤩",
  "Perfect! 👌",
  "Love your content! 🙌",
  "So inspiring! 💫",
  "Beautiful! 🌸",
  "Absolutely stunning! ✨",
  "This made my day! 😊",
  "You're killing it! 🔥",
  "So cool! 🤙",
  "Adorable! 🥰"
];

const demoAvatarUrls = [
  "https://ui-avatars.com/api/?name=Alex+Smith&background=random&size=300",
  "https://ui-avatars.com/api/?name=Jordan+Johnson&background=random&size=300",
  "https://ui-avatars.com/api/?name=Taylor+Williams&background=random&size=300",
  "https://ui-avatars.com/api/?name=Morgan+Brown&background=random&size=300",
  "https://ui-avatars.com/api/?name=Casey+Jones&background=random&size=300",
  "https://ui-avatars.com/api/?name=Jamie+Garcia&background=random&size=300",
  "https://ui-avatars.com/api/?name=Riley&Miller&background=random&size=300",
  "https://ui-avatars.com/api/?name=Avery+Davis&background=random&size=300",
  "https://ui-avatars.com/api/?name=Quinn+Rodriguez&background=random&size=300",
  "https://ui-avatars.com/api/?name=Parker+Martinez&background=random&size=300"
];

const demoPostImageUrls = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
  "https://images.unsplash.com/photo-1501785888041-af3ef281b399?w=800",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800"
];

// Main seed function
const seedDemoData = async (clearExisting = false) => {
  console.log("🚀 Starting demo data generation...");

  // Connect to database
  await connectDb();

  try {
    // Step 1: Clear existing demo data if requested
    if (clearExisting) {
      console.log("🗑️ Clearing existing demo data...");
      await Post.deleteMany({});
      await Conversation.deleteMany({});
      await Message.deleteMany({});
      await Notification.deleteMany({});
      // Don't delete users, just clear their posts, follows, etc.
      await User.updateMany({}, {
        $set: {
          followers: [],
          following: [],
          noOfFollower: 0,
          noOfFollowing: 0
        }
      });
      console.log("✅ Existing demo data cleared!");
    }

    // Step 2: Check if we have enough users, create some if not
    console.log("👥 Checking for existing users...");
    let users = await User.find({});
    if (users.length < 5) {
      console.log("📝 Creating demo users...");
      const demoUsers = [];
      for (let i = 0; i < 10; i++) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        demoUsers.push({
          username: demoUsernames[i],
          email: demoEmails[i],
          fullName: `${demoFirstNames[i]} ${demoLastNames[i]}`,
          avatar: demoAvatarUrls[i],
          password: hashedPassword,
          bio: randomFromArray([
            "Living life to the fullest!",
            "Coffee addict ☕",
            "Travel enthusiast ✈️",
            "Foodie forever 🍕",
            "Art lover 🎨",
            "Music fan 🎶"
          ])
        });
      }
      users = await User.create(demoUsers);
      console.log(`✅ Created ${users.length} demo users!`);
    } else {
      console.log(`✅ Found ${users.length} existing users!`);
    }
    const userIds = users.map(u => u._id.toString());

    // Step 3: Create posts for each user
    console.log("📸 Creating demo posts...");
    const posts = [];
    for (const user of users) {
      const numPosts = randomInt(4, 6);
      for (let i = 0; i < numPosts; i++) {
        const post = await Post.create({
          userId: user._id,
          postImage: [randomFromArray(demoPostImageUrls)],
          description: randomFromArray(realisticCaptions),
          likes: [],
          comments: [],
          likecount: 0,
          commentcount: 0
        });
        posts.push(post);
      }
    }
    console.log(`✅ Created ${posts.length} demo posts!`);

    // Step 4: Add likes and comments to posts
    console.log("❤️ Adding likes and comments to posts...");
    for (const post of posts) {
      // Add likes
      const numLikes = randomInt(2, users.length - 1);
      const shuffledUserIds = shuffleArray(userIds);
      const likedUserIds = shuffledUserIds.filter(id => id !== post.userId.toString()).slice(0, numLikes);
      post.likes = likedUserIds.map(id => new mongoose.Types.ObjectId(id));
      post.likecount = post.likes.length;

      // Add comments
      const numComments = randomInt(8, 15);
      const comments = [];
      for (let i = 0; i < numComments; i++) {
        const commentUser = randomFromArray(users.filter(u => u._id.toString() !== post.userId.toString()));
        comments.push({
          userId: commentUser._id,
          text: randomFromArray(realisticComments),
          username: commentUser.username,
          avatar: commentUser.avatar,
          createdAt: new Date(Date.now() - randomInt(1, 7) * 24 * 60 * 60 * 1000) // Random date in last 7 days
        });
      }
      post.comments = comments;
      post.commentcount = comments.length;

      await post.save();
    }
    console.log("✅ Added likes and comments!");

    // Step 5: Create follow relationships
    console.log("👥 Creating follow relationships...");
    for (const user of users) {
      const numFollowing = randomInt(2, users.length - 1);
      const shuffledOtherUsers = shuffleArray(users.filter(u => u._id.toString() !== user._id.toString()));
      const usersToFollow = shuffledOtherUsers.slice(0, numFollowing);

      for (const toFollow of usersToFollow) {
        // Add to following of current user
        if (!user.following.includes(toFollow._id)) {
          user.following.push(toFollow._id);
        }
        // Add to followers of toFollow user
        if (!toFollow.followers.includes(user._id)) {
          toFollow.followers.push(user._id);
        }
      }
      user.noOfFollowing = user.following.length;
      await user.save();
      // Update the toFollow users
      for (const toFollow of usersToFollow) {
        toFollow.noOfFollower = toFollow.followers.length;
        await toFollow.save();
      }
    }
    console.log("✅ Created follow relationships!");

    // Step 6: Create conversations and messages
    console.log("💬 Creating conversations and messages...");
    const numConversations = randomInt(users.length, users.length * 2);
    const conversationPairs = new Set();
    let createdConversations = 0;
    for (let i = 0; i < numConversations * 2; i++) { // Try up to twice to avoid duplicates
      if (createdConversations >= numConversations) break;
      const user1 = randomFromArray(users);
      const user2 = randomFromArray(users.filter(u => u._id.toString() !== user1._id.toString()));
      const pairKey = [user1._id.toString(), user2._id.toString()].sort().join("-");
      if (conversationPairs.has(pairKey)) continue;
      conversationPairs.add(pairKey);

      // Create or find conversation using existing service
      const conversation = await findOrCreateConversation(user1._id, user2._id);
      createdConversations++;

      // Create messages
      const numMessages = randomInt(5, 20);
      let lastMessage = null;
      for (let j = 0; j < numMessages; j++) {
        const sender = randomFromArray([user1, user2]);
        const receiver = sender._id.toString() === user1._id.toString() ? user2 : user1;
        const message = await Message.create({
          conversationId: conversation._id,
          senderId: sender._id,
          receiverId: receiver._id,
          message: randomFromArray(realisticComments),
          type: "text",
          status: "seen"
        });
        conversation.messages.push(message._id);
        lastMessage = message;
      }

      if (lastMessage) {
        conversation.lastMessage = {
          messageId: lastMessage._id,
          text: lastMessage.message,
          senderId: lastMessage.senderId,
          type: "text",
          createdAt: lastMessage.createdAt
        };
      }
      await conversation.save();
    }
    console.log(`✅ Created ${createdConversations} conversations!`);

    console.log("🎉 Demo data generation complete!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await disconnectDb();
    process.exit(0);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const clearExisting = args.includes("--clear");

// Run the seed function
seedDemoData(clearExisting);
