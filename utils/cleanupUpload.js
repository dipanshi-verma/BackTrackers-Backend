const fs = require('fs');

function removeLocalFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Could not remove local file:', err.message);
  }
}

module.exports = { removeLocalFile };
