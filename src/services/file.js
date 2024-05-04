import { File } from "../models/init.js";
import DatabaseError from "../models/error.js";

import fs from 'fs';

class FileService {
  static async list() {
    try {
      return File.findMany();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async get(id) {
    try {
      return await File.findUnique({ where: { id } });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(req) {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }

      const tempPath = req.file.path;
      const targetPath = `./public/assets/file/${req.file.originalname}`;

      const src = fs.createReadStream(tempPath);
      const dest = fs.createWriteStream(targetPath);

      src.pipe(dest);
      const data = src.on('end', async () => {
        return await File.create({
          data: {
            fileUrl: req.file.filename,
          }
        });
      });

      src.on('error', (err) => {
        throw new DatabaseError('Error during file upload:', err);
      });
      console.log('data', data);

      return data

    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await File.update({
        where: { id },
        data,
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      await File.delete({ where: { id } });
      return true;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default FileService;
