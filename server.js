const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

const VIDEO_FOLDER = path.join(__dirname, 'videos');

app.use('/videos', express.static(VIDEO_FOLDER));
app.use(express.static(__dirname));

app.get('/list-videos', (req, res) => {
  fs.readdir(VIDEO_FOLDER, (err, files) => {
    if (err) return res.status(500).send('Error reading folder');
    const videoFiles = files.filter(file => /\.(mp4|webm|ogg|mkv)$/i.test(file));
    res.json(videoFiles);
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEO_FOLDER);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (/\.(mp4|webm|ogg|mkv)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

app.post('/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or invalid file type.');
  }
  res.send('Video uploaded successfully.');
});


app.delete('/delete-video/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename) return res.status(400).send('No filename provided');

  const resolvedPath = path.resolve(VIDEO_FOLDER, filename);
  const normalizedVideoFolder = path.normalize(VIDEO_FOLDER + path.sep);

  if (!resolvedPath.startsWith(normalizedVideoFolder)) {
    return res.status(400).send('Invalid file path');
  }

  console.log("Trying to delete:", resolvedPath);

  fs.access(resolvedPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File does not exist:", resolvedPath);
      return res.status(404).send('File not found');
    }
    fs.unlink(resolvedPath, err => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).send('Error deleting file');
      }
      res.send('File deleted');
    });
  });
});