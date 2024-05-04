import { Router } from "express";
import { v4 as uuid } from 'uuid';
import FileService from "../../services/file.js";
import { requireUser } from "../middlewares/auth.js";
import { requireValidId } from "../middlewares/validate.js";
import { uploadFile } from "../middlewares/file.js";
import fs from 'fs';
import { File } from "../../models/init.js";
import path from 'path';

const router = Router();

// router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: File
 *   description: API for managing File objects
 *
 * /file:
 *   get:
 *     tags: [File]
 *     summary: Get all the File objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of File objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreateFile'
 */
router.get("", async (req, res, next) => {
  try {
    const results = await FileService.list();
    res.json(results);
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /file:
 *   post:
 *     tags: [File]
 *     summary: Create a new File
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *          multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/File'
 *     responses:
 *       201:
 *         description: The created File object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateFile'
 */


router.post("", uploadFile, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const tempPath = req.file.path;
    const extname = path.extname(req.file.originalname).toLowerCase(); 
    const fileName=`${uuid()}${extname}`
    const targetPath = `./public/assets/file/${fileName}`;

    const src = fs.createReadStream(tempPath);
    const dest = fs.createWriteStream(targetPath);

    src.pipe(dest);
    src.on('end', async () => {
      const data = await File.create({
        data: {
          fileUrl: fileName,
        }
      })
      // Optionally, you can delete the temp file here if you want
      res.status(200).send(data);
    });
    src.on('error', (err) => {
      console.error('Error during file upload:', err);
      res.status(500).send('An error occurred during the upload');
    });
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /file/{id}:
 *   get:
 *     tags: [File]
 *     summary: Get a File by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateFile'
 */
router.get("/:id", requireValidId, async (req, res, next) => {
  try {
    const obj = await FileService.get(req.params.id);
    if (obj) {
      res.json(obj);
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});



export default router;
