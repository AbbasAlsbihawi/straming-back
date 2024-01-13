import { Video } from "../models/init.js";
import DatabaseError from "../models/error.js";
import { pathName } from "../api/middlewares/file.js";


class VideoService {
  static async list({
    pageNumber = 1,
    pageSize = 25,
    search = "",
  }) {
    try {
      const where = search ? {
        title: { contains: search },
      } : {};

      const skipAmount = (parseInt(pageNumber) - 1) * parseInt(pageSize);

      const videos = await Video.findMany({
        where,
        skip: skipAmount,
        take: parseInt(pageSize),
      });

      const totalCount = await Video.count({ where });

      return {
        data: videos,
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
        total: totalCount,
        hasMore: ((parseInt(pageNumber) * parseInt(pageSize)) < totalCount),
      };
    } catch (err) {
      throw new DatabaseError(err);
    }
  }


  static async get(id) {
    try {
      return await Video.findUnique({ where: { id } });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
  static async play(videoUrl) {
    try {
     
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(data) {
    try {
      console.log("data", data);
      return await Video.create({ data });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await Video.update({
        where: { id },
        data,
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      await Video.delete({ where: { id } });
      return true;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default VideoService;
