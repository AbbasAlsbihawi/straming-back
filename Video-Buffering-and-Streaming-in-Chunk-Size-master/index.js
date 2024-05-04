const express = require("express");
const fs = require("fs");
const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("video"); // it will redirect to video.ejs file inside views directory
});

// In video.ejs file, set the src location to http://localhost:4000/chunk/video
app.get("/chunk/video", function (req, res) {
    // Ensure there is a range given for the video chunk
    const range = req.headers.range;
    if (!range) {
        res.status(416).send("Requires Range header");
        return;
    }

    const videoPath = "playvideo.mp4";
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
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}`);
});
