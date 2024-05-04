import { Router } from "express";

import VideoService from "../../services/video.js";
import { requireUser } from "../middlewares/auth.js";
import { requireFile, requireSchema, requireValidId } from "../middlewares/validate.js";
import schema, { videoDataEdit } from "../schemas/video.js";
import { upload } from "../middlewares/upload.js";
import { pathName } from "../middlewares/file.js";
import fs from 'fs';
 import path from 'path';
const router = Router();

// router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Video
 *   description: API for managing Video objects
 *
 * /video:
 *   get:
 *     tags: [Video]
 *     summary: Get all the Video objects
 *     security:
 *       - BearerAuth: [] 
 *     parameters: 
 *       - in: query
 *         name: search
 *         description: Search query parameter
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageNumber
 *         description: pageNumber query parameter
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         description:   Page size query parameter
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of Video objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 */
router.get("", async (req, res, next) => {
  try {
    const results = await VideoService.list({
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      search: req.query.search,
    });
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
 * /video:
 *   post:
 *     tags: [Video]
 *     summary: Create a new Video
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *          multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       201:
 *         description: The created Video object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 */

router.post("", upload, requireFile(), requireSchema(schema), async (req, res, next) => {
  try {
    // console.log("req", req.user.id);
    req.validatedBody.userId = req.user.id;
    req.validatedBody.thumbnailUrl = req.validatedBody.file;
    delete req.validatedBody.file 
    const obj = await VideoService.create(req.validatedBody);
    res.status(201).json(obj);
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
 * /video/{id}:
 *   get:
 *     tags: [Video]
 *     summary: Get a Video by id
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
 *         description: Video object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 */
router.get("/:id", requireValidId, async (req, res, next) => {
  try {
    const obj = await VideoService.get(req.params.id);
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
 /** @swagger
 *
 * /video/play/{videoUrl}:
 *   get:
 *     tags: [Video]
 *     summary: Get a Video by videoUrl
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoUrl
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video object with the specified id
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/play/:videoUrl", async (req, res, next) => {
  try {
    
     // Ensure there is a range given for the video chunk 
     const range = req.headers.range;
     if (!range) {
       res.status(416).send("Requires Range header");
       return;
     }
     const videoPath = pathName + req.params.videoUrl;
     const videoSize = fs.statSync(videoPath).size;  
     // Parse Range
     const CHUNK_SIZE = 10 ** 6; // 1MB
     const startRange = Number(range.replace(/\D/g, "")); // remove non-digit values
     const endRange = Math.min(startRange + CHUNK_SIZE, videoSize - 1);

     // Create headers
     const contentLength = endRange - startRange + 1;
     const headers = {
       "Content-Range": `bytes ${startRange}-${endRange}/${videoSize}`,
       "Accept-Ranges": "bytes",
       "Content-Length": contentLength,
       "Content-Type": "video/mp4",
     };

     // HTTP Status 206 for Partial Content
     res.writeHead(206, headers);

     // Create video read stream for this particular chunk
     const videoStream = fs.createReadStream(videoPath, { start: startRange, end: endRange });

     // Stream the video chunk to the client
     videoStream.pipe(res);
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
 * /video/{id}:
 *   put:
 *     tags: [Video]
 *     summary: Update Video with the specified id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       200:
 *         description: The updated Video object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 */
router.put(
  "/:id",
  requireValidId,
  requireSchema(videoDataEdit),
  async (req, res, next) => {
    try {
      const obj = await VideoService.update(req.params.id, req.validatedBody);
      if (obj) {
        res.status(200).json(obj);
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
  }
);

/** @swagger
 *
 * /video/{id}:
 *   delete:
 *     tags: [Video]
 *     summary: Delete Video with the specified id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *        description: OK, object deleted
 */
router.delete("/:id", requireValidId, async (req, res, next) => {
  try {
    const success = await VideoService.delete(req.params.id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Not found, nothing deleted" });
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
