/** Lazy io reference to avoid circular imports (socket ↔ app ↔ routes ↔ controller). */
let ioInstance = null;

export const setIo = (io) => {
  ioInstance = io;
};

export const getIo = () => ioInstance;
