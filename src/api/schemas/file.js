export default {
  type: "object",
  properties: { 
    file: {
      type: "string",
      format: "binary",
      description: "The file to upload"
    }

  },
  required: ["file",],
  additionalProperties: false,
};


export const fileSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    fileUrl: { type: "string" },
    uploadDate: { type: "string" },  
  },
};
 