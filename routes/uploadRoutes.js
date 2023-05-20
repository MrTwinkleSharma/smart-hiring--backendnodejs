const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const { pipeline } = require('stream/promises');
const fs = require('fs');
const jwtAuth = require("../lib/jwtAuth");
const User = require("../db/User");
const JobApplicant = require("../db/JobApplicant");

const router = express.Router();

// Create multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, `${__dirname}/../public/resume`);
    } else if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      cb(null, `${__dirname}/../public/profile`);
    }
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split('/')[1];
    const filename = `${uuidv4()}.${extension}`;
    cb(null, filename);
  },
});

// Create multer object with configuration
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      if (file.mimetype === 'application/pdf' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
      } else {
        cb(new Error('Invalid file format. Only PDF or PNG/JPG/JPEG files are allowed.'), false);
      }
    } else if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      const allowedExtensions = ['.jpg', '.png', '.jpeg'];
      const fileExtension = `.${file.mimetype.split('/')[1]}`;

      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file format. Only JPG and PNG images are allowed.'), false);
      }
    } else {
      cb(new Error('Invalid fieldname'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
  },
});


// Handle resume upload
router.post('/resume',jwtAuth, upload.single('file'), async (req, res) => {
  console.log("User request", req.user)
  try {
    const { file } = req;
    console.log('Uploading resume', file);

    if (!file) {
      res.status(400).json({
        message: 'No file uploaded',
      });
      return;
    }

    const filename = file.filename;
   
    await JobApplicant.findOneAndUpdate({userId: req.user._id}, {
      resume:filename
    })

    res.send({
      message: 'File uploaded successfully',
      url: `/host/resume/${filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: 'Error while uploading',
    });
  }
});

// Handle profile image upload
router.post('/profile', jwtAuth, upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    console.log('Uploading profile image', file);

    if (!file) {
      res.status(400).json({
        message: 'No file uploaded',
      });
      return;
    }

    const filename = file.filename;
     
    await JobApplicant.findOneAndUpdate({userId: req.user._id}, {
      profile:filename
    })

    res.send({
      message: 'Profile image uploaded successfully',
      url: `/host/profile/${filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: 'Error while uploading',
    });
  }
});

module.exports = router;
