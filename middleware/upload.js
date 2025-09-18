const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, 'uploads/');
},
filename: function (req, file, cb) {
const ext = path.extname(file.originalname);
cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
}
});


const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });


module.exports = upload;