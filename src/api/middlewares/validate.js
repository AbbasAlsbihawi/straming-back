import { Validator } from "jsonschema";
import validator from "validator";

const defaultOptions = {
  required: true,
};

const jsValidator = new Validator();

export const requireSchema = (schema, options = {}) => {
  const validatorOptions = { ...defaultOptions, ...options };

  const validatorFunc = (req, res, next) => {
    const { body } = req;
    if (!body) {
      res.status(400).json({ error: "missing request body" });
      return;
    }

    const v = jsValidator.validate(body, schema, validatorOptions);
    if (!v.valid) {
      res.status(400).json({
        error: "request body validation failed",
        details: v.errors.map((err) => `${err.property}: ${err.message}`),
      });
      return;
    }

    req.validatedBody = v.instance;
    next();
  };

  return validatorFunc;
};

export const requireValidId = (req, res, next) => {
  if (validator.isInt(req.params.id, { min: 1 })) {
    req.params.id = parseInt(req.params.id);
  } else {
    res.status(400).json({ error: "URL does not contain a valid object ID" });
    return;
  }
  next();
};

export const requireFile = () => { 
  const validatorFunc = (req, res, next) => {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }  
    const newData = {
      ...req.body,
      file: req.file.filename // or any other file information you need
    };
    req.body = newData; 
    console.log("file: req.file.filename", req.body);
    next();
  };

  return validatorFunc;
};
