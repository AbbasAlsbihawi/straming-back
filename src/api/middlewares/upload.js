import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
// import { fileURLToPath } from 'url';
import { dirname } from 'path';

// __dirname is not available in ES module scope, so we create it
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Set The Storage Engine
const storage = multer.diskStorage({
  // destination
  destination: (req, file, cb) => { 
    // const path = `${__dirname__}/public/assets/video/`;  
    const path = `./public/assets/image/`;  
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    cb(null, path);
  },
  // filename 
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${extname}`);
  },
});

// Init Upload
export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Set file size limit to 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("file");

 

// Check File Type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  // Check extensions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
 const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: upload jpeg , jpg , png or gif Only!");
  }
}
