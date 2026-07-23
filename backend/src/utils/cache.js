import { connectRedis } from "../../config/redis.js";

export const getCache = async (key) => {
  try {
    const redisClient = await connectRedis();
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`❌ Cache read failed for key ${key}:`, error.message);
    return null;
  }
};

export const setCache = async (key, value, ttl = 600) => {
  try {
    const redisClient = await connectRedis();
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`❌ Cache write failed for key ${key}:`, error.message);
  }
};

export const deleteCache = async (key) => {
  try {
    const redisClient = await connectRedis();
    await redisClient.del(key);
  } catch (error) {
    console.error(`❌ Cache delete failed for key ${key}:`, error.message);
  }
};