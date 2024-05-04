import cors from "cors";
import express from "express";
import compression from "compression";
import routes from "./api/routes/index.js";

const app = express();

app.enable("json spaces");
app.enable("strict routing");
app.use(cors());
app.use(express.json({
    limit: '100000mb'
}));
app.use(express.urlencoded({
    extended: true
}));
app.use(compression())
app.use(express.json());
app.use(routes);

export default app;
