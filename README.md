# Vendor Registration Portal for Rashmi Metaliks

A standalone vendor registration portal for Rashmi Metaliks Limited. This application allows suppliers to register as vendors by submitting their company information and supporting documents.

## Features

- User-friendly vendor registration form
- File upload functionality for supporting documents
- Email notifications to both admin and vendor
- Responsive design with modern UI
- SEO optimized with proper meta tags

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui for UI components
- Framer Motion for animations
- React Hook Form for form handling
- Zod for validation
- Axios for API requests

### Backend
- Node.js with Express
- TypeScript
- Multer for file handling
- Nodemailer for email functionality

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vendor-registration.git
cd vendor-registration
```

2. Install dependencies for both frontend and backend:
```bash
npm run install:all
```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in the backend folder
   - Update the email configuration in the `.env` file

### Development

To run the application in development mode:

```bash
npm run dev
```

This will start both the frontend and backend servers concurrently.
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Building for Production

To build the application for production:

```bash
npm run build
```

This will build both frontend and backend.

### Deployment

To deploy the frontend to GitHub Pages:

```bash
npm run deploy
```

For the backend, you can deploy to any Node.js hosting service (e.g., Heroku, Vercel, Netlify).

## API Endpoints

### POST /api/vendors
Submit a vendor registration with supporting documents.

**Request:**
- Form data with vendor information and optional file uploads

**Response:**
```json
{
  "success": true,
  "message": "Vendor registration submitted successfully",
  "referenceId": "TOKEN-123456"
}
```

## License

This project is licensed under the ISC License.

## Acknowledgements

- Rashmi Metaliks Limited for the requirements and design inspiration
- All open-source libraries and tools used in this project 