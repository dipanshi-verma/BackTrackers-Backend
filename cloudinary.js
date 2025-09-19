const cloudinary = require('cloudinary').v2;


function configureCloudinary({ cloud_name, api_key, api_secret }) {
cloudinary.config({
cloud_name,
api_key,
api_secret,
secure: true,
});
}


module.exports = { cloudinary, configureCloudinary };