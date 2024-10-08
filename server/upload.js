const express = require('express');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const crypto = require('crypto');

const router = express.Router();

// Route to handle file uploads
router.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();
  const uploadFolder = path.join(__dirname, '../uploads');

  // Check if upload folder exists; create it if not
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
  }

  // Configure form options
  form.uploadDir = uploadFolder; // Set upload directory
  form.keepExtensions = true; // Keep file extensions after upload
  form.multiples = true; // Allow multiple file uploads

  // Parse incoming form data (files and fields)
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log('Error parsing the files');
      return res.status(400).json({
        status: 'Fail',
        message: 'There was an error parsing the files',
        error: err,
      });
    }

    // Convert files object to an array, as multiple files can be uploaded
    const uploadedFiles = Array.isArray(files.image) ? files.image : [files.image];
    const fileDetails = [];

    // Iterate over each file and move it to the designated upload directory
    for (let file of uploadedFiles) {
      const oldpath = file.filepath; // Temporary file path
      const randomName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalFilename); // Generate unique filename
      const newpath = path.join(form.uploadDir, randomName);

      try {
        // Rename (move) the file from the temporary path to the new path
        fs.renameSync(oldpath, newpath);
        fileDetails.push({ filename: randomName, size: file.size }); // Collect file details for response
      } catch (err) {
        console.log('Error moving the file');
        return res.status(400).json({
          status: 'Fail',
          message: 'There was an error moving the file',
          error: err,
        });
      }
    }

    // Send response back to client with file details
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

  // Check if the file exists in the uploads directory
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        status: 'Fail',
        message: 'File not found'
      });
    }
    // Send the file to the client if it exists
    res.sendFile(filePath);
  });
});

module.exports = router;
