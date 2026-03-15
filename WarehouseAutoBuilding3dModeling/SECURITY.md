# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: Yes |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to your-email@example.com. All security vulnerabilities will be promptly addressed.

### Guidelines for Reporting Vulnerabilities

1. **Do NOT** create public issues for security vulnerabilities
2. Email us directly at your-email@example.com
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

### What Happens Next?

1. We will acknowledge receipt of your report within 48 hours
2. We will investigate the vulnerability
3. We will provide a timeline for fixing the issue
4. We will notify you when the fix is deployed
5. You will be credited in the security advisory (if you wish)

### Security Best Practices

#### For Users

- Keep your dependencies up to date
- Use environment variables for sensitive data
- Never commit `.env` files or secrets
- Review the code before running in production
- Use HTTPS in production

#### For Developers

- Validate all user input
- Sanitize file uploads
- Use parameterized queries
- Implement rate limiting
- Keep dependencies updated
- Follow OWASP guidelines

## Security Features

### File Upload Security

- File type validation (DXF only)
- File size limits (10MB max)
- Virus scanning (planned)
- Sandboxed processing environment

### API Security

- CORS protection
- Rate limiting (planned)
- Input sanitization
- Error message sanitization (no sensitive data leakage)

### Dependency Management

We regularly update dependencies to address security vulnerabilities:

```bash
npm audit
npm audit fix
```

## Disclosure Policy

We follow responsible disclosure practices:

1. **Private Disclosure**: Report vulnerabilities privately
2. **Assessment**: We assess and validate the report
3. **Remediation**: We develop and test a fix
4. **Deployment**: We deploy the fix to all users
5. **Public Disclosure**: We publicly disclose after fixes are deployed

### Security Advisories

Security advisories will be published on GitHub with:
- CVE identifier (if applicable)
- Severity rating
- Impact assessment
- Mitigation steps
- Patch information

## Security Scanning

We use automated security scanning:

- **Dependabot**: Automated dependency updates
- **CodeQL**: Static code analysis (planned)
- **Snyk**: Vulnerability scanning (planned)

## Contact

For security-related questions:
- **Email**: your-email@example.com
- **PGP Key**: [Link to PGP key] (optional)

---

Thank you for helping keep this project secure! 🙏
