// Placeholder — replace with real Cloudinary config when ready
// To use Cloudinary: npm install cloudinary, add keys to .env
const cloudinary = {
  uploader: {
    upload: async (filePath, options) => {
      // Returns the local path as the "url" so images still work locally
      return { secure_url: '/uploads/' + require('path').basename(filePath) };
    }
  }
};

module.exports = { cloudinary };
