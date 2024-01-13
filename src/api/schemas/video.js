export default {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" }, 
    videoUrl: { type: "string" }, 
    file: {
      type: "string",
      format: "binary",
      description: "The thumbnail image to upload"
    }

  },
  required: ["title", "description", "file","videoUrl"],
  additionalProperties: false,
};

export const videoSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    fileUrl: { type: "string" },
    uploadDate: { type: "string" },  
  },
};
