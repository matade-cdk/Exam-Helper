# Contributing to Exam Helper

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Exam-Helper.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages: `git commit -m "Add feature: brief description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- OpenRouter API key (sign up at https://openrouter.ai/)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Code Style

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code formatting
- Keep functions small and focused
- Use ES6+ features (async/await, arrow functions, destructuring)

## Commit Message Guidelines

- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference issues when applicable: "Fix #123: resolve upload bug"

## Pull Request Guidelines

- Provide a clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Keep PRs focused on a single feature/fix

## Reporting Bugs

- Use GitHub Issues
- Include steps to reproduce
- Describe expected vs. actual behavior
- Include error messages and logs
- Specify your environment (OS, Node version, browser)

## Feature Requests

- Use GitHub Issues with "enhancement" label
- Clearly describe the feature and use case
- Explain why it would benefit users

## Questions?

Open an issue with the "question" label or start a discussion.

Thank you for contributing! 🚀
