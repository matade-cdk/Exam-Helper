# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email the project maintainers.

- Do not open public GitHub issues for security vulnerabilities
- Include detailed steps to reproduce the issue
- Expected response time: 48 hours

## Security Best Practices

### API Keys
- Never commit `.env` files to version control
- Use environment variables for all sensitive configuration
- Rotate API keys regularly

### File Uploads
- The backend automatically deletes uploaded files after processing
- Supported file types are limited to PDF, DOCX, and TXT
- File size limits are enforced by the backend

### Dependencies
- Regularly update dependencies to patch known vulnerabilities
- Run `npm audit` to check for security issues
- Use `npm audit fix` to automatically update vulnerable packages
