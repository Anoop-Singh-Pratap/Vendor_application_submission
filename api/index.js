const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.office365.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Vendor submission endpoint
app.post('/vendors', upload.array('supportingDocuments', 10), async (req, res) => {
  try {
    const {
      name,
      designation,
      companyName,
      firmType,
      website,
      vendorType,
      country,
      customCountry,
      customCountryCode,
      contactNo,
      email,
      category,
      subcategory,
      productDescription,
      experience,
      certifications,
      additionalInfo
    } = req.body;

    // Validate required fields
    if (!name || !designation || !companyName || !firmType || !country || !contactNo || !email || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create email transporter
    const transporter = createTransporter();

    // Prepare email content
    const emailContent = `
      <h2>New Vendor Profile Submission</h2>

      <h3>Contact Person Details</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Designation:</strong> ${designation}</p>

      <h3>Company Information</h3>
      <p><strong>Company Name:</strong> ${companyName}</p>
      <p><strong>Firm Type:</strong> ${firmType}</p>
      <p><strong>Website:</strong> ${website || 'Not provided'}</p>
      <p><strong>Vendor Type:</strong> ${vendorType}</p>
      <p><strong>Country:</strong> ${country === 'others' ? customCountry : country}</p>

      <h3>Contact Details</h3>
      <p><strong>Contact Number:</strong> ${contactNo}</p>
      <p><strong>Email:</strong> ${email}</p>

      <h3>Product/Service Information</h3>
      <p><strong>Primary Category:</strong> ${category}</p>
      <p><strong>Subcategory:</strong> ${subcategory || 'Not specified'}</p>
      <p><strong>Product Description:</strong> ${productDescription || 'Not provided'}</p>
      <p><strong>Experience:</strong> ${experience || 'Not provided'}</p>
      <p><strong>Certifications:</strong> ${certifications || 'Not provided'}</p>
      <p><strong>Additional Information:</strong> ${additionalInfo || 'Not provided'}</p>

      <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
    `;

    // Prepare attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      content: file.buffer
    })) : [];

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Vendor Profile Submission - ${companyName}`,
      html: emailContent,
      attachments: attachments
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Vendor profile submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting vendor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit vendor profile',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;
