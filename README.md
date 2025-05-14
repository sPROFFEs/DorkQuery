# Interactive Ethical Hacking Website

An educational platform for learning cybersecurity through practical challenges and interactive mini-courses. This project is designed for cybersecurity beginners and ethical hacking students who want to practice real skills directly from their browser.

## 🌐 Languages

The website is available in:
- Spanish (default)
- English
- German

The platform includes an automated translation system that can dynamically translate content.

## 🚀 Features

- **CTF Challenges**: Practical security challenges with different difficulty levels
- **Interactive Mini-courses**: Step-by-step tutorials with editable code examples
- **Automated Translation**: Dynamic content translation between supported languages
- **Progress Tracking**: Local storage-based progress tracking for challenges and courses
- **Responsive Design**: Works on desktop and mobile devices

## 📂 Project Structure

\`\`\`
/
├── app/                    # Next.js app directory
│   ├── [locale]/           # Internationalized routes
│   │   ├── page.tsx        # Home page
│   │   ├── ctf/            # CTF challenges
│   │   ├── curso/          # Mini-courses
│   │   └── about/          # About page
├── components/             # React components
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── messages/               # Translation files
├── public/                 # Static assets
└── .github/                # GitHub configuration
    └── workflows/          # GitHub Actions workflows
\`\`\`

## 🛠️ Technologies Used

- **Frontend**: Next.js, React, TailwindCSS, shadcn/ui
- **Internationalization**: next-intl
- **Automated Translation**: Translation API integration
- **Deployment**: GitHub Pages

## 🚀 Deployment

The website is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment process is handled by GitHub Actions.

### GitHub Pages Deployment

The deployment to GitHub Pages is configured in the `.github/workflows/deploy.yml` file. This workflow:

1. Checks out the repository
2. Sets up Node.js
3. Installs dependencies
4. Builds the project with the correct base path
5. Uploads the build artifacts
6. Deploys to GitHub Pages

### Environment Variables

The following environment variables are used in the deployment process:

- `NEXT_PUBLIC_BASE_PATH`: The base path for the GitHub Pages deployment (e.g., `/Interactive-Hacking-Website`)

### Troubleshooting Deployment

If you encounter issues with the GitHub Pages deployment, check the following:

1. Make sure the GitHub Actions workflow is using the correct versions of all actions
2. Verify that the `NEXT_PUBLIC_BASE_PATH` environment variable is set correctly
3. Check the GitHub Actions logs for any errors
4. Ensure that the `next.config.mjs` file is configured correctly for static export

### Manual Deployment

To deploy the website manually:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. The static files will be generated in the `out` directory
5. Deploy these files to your web server

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

### Adding New CTF Challenges

1. Create a new directory in `app/[locale]/ctf/` with your challenge name
2. Create a `page.tsx` file with your challenge content
3. Add translations for your challenge in the message files
4. Test your challenge locally
5. Submit a pull request

### Adding New Mini-courses

1. Create a new directory in `app/[locale]/curso/` with your course name
2. Create a `page.tsx` file with your course content
3. Add translations for your course in the message files
4. Test your course locally
5. Submit a pull request

### Improving Translations

1. Edit the translation files in the `messages/` directory
2. Test the translations locally
3. Submit a pull request

### General Contributions

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature-name`
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Lucide Icons](https://lucide.dev/)
\`\`\`

Let's also create a simple script to test the deployment:
