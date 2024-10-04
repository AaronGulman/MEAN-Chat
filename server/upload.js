const express = require('express');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const crypto = require('crypto');

const router = express.Router();

// Route to upload image files
router.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();
  const uploadFolder = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
  }
  form.uploadDir = uploadFolder;
  form.keepExtensions = true;
  form.multiples = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log('Error parsing the files');
      return res.status(400).json({
        status: 'Fail',
        message: 'There was an error parsing the files',
        error: err,
      });
    }

    const uploadedFiles = Array.isArray(files.image) ? files.image : [files.image];
    const fileDetails = [];

    for (let file of uploadedFiles) {
      const oldpath = file.filepath;
      const randomName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalFilename);
      const newpath = form.uploadDir + '/' + randomName;

      try {
        fs.renameSync(oldpath, newpath);
        fileDetails.push({ filename: randomName, size: file.size });
      } catch (err) {
        console.log('Error moving the file');
        return res.status(400).json({
          status: 'Fail',
          message: 'There was an error moving the file',
          error: err,
        });
      }
    }

    res.send({
      result: 'OK',
      data: fileDetails,
      numberOfImages: fileDetails.length,
      message: 'Upload successful'
    });
  });
});

// Route to retrieve a specific file by filename
router.get('/file/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        status: 'Fail',
        message: 'File not found'
      });
    }
    res.sendFile(filePath);
  });
});

module.exports = router;
