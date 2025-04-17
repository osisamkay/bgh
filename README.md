# BGH - Next.js Application

This is a [Next.js](https://nextjs.org/) project with [Tailwind CSS](https://tailwindcss.com/) integration.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Next.js for React framework
- Tailwind CSS for styling
- Responsive design

## Learn More

To learn more about Next.js and Tailwind CSS, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/).

## Environment Variables

The application requires several environment variables to be set up. Create a `.env.local` file in the root directory with the following variables:

### JWT Configuration
- `JWT_SECRET`: Secret key for JWT token generation and verification

### Email Configuration (SMTP)
- `SMTP_HOST`: SMTP server host (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP server port (e.g., 587 for TLS)
- `SMTP_SECURE`: Whether to use SSL/TLS (false for TLS)
- `SMTP_USER`: SMTP server username/email
- `SMTP_PASS`: SMTP server password or app-specific password
- `SMTP_FROM`: Email address used as sender

### Development Email (for testing)
- `TEST_EMAIL_USER`: Test email account for development
- `TEST_EMAIL_PASS`: Test email password for development

### SendGrid Configuration (Alternative Email Service)
- `SENDGRID_API_KEY`: Your SendGrid API key
- `SENDGRID_FROM_EMAIL`: Verified sender email in SendGrid

### Application URLs
- `NEXT_PUBLIC_BASE_URL`: Base URL of your application (e.g., http://localhost:3000 for development)

### Environment
- `NODE_ENV`: Application environment (development/production)

## Setup Instructions

1. Clone the repository
2. Copy `.env.local.example` to `.env.local`
3. Fill in the environment variables with your values
4. Install dependencies: `npm install`
5. Run the development server: `npm run dev`

## Email Configuration Guide

### Using Gmail SMTP
1. Enable 2-Step Verification in your Google Account
2. Generate an App Password:
   - Go to Google Account Security
   - Select "App Passwords"
   - Generate a new app password for "Mail"
3. Use this app password as `SMTP_PASS`

### Using SendGrid
1. Create a SendGrid account
2. Generate an API key
3. Verify your sender domain/email
4. Use the API key as `SENDGRID_API_KEY`

## Security Notes
- Never commit `.env.local` to version control
- Use strong, unique passwords for all services
- Regularly rotate API keys and passwords
- Keep your JWT secret secure and complex

# Environment Setup

## Using the Example Environment File

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in your preferred text editor and replace the placeholder values with your actual configuration:

   - Generate a strong JWT secret (you can use a secure random string generator)
   - Set up your SMTP credentials (Gmail or other provider)
   - Configure SendGrid API key and verified sender email
   - Update the base URL according to your deployment environment

3. Make sure to keep your `.env.local` file secure and never commit it to version control