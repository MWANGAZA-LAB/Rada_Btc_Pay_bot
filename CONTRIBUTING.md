# Contributing to Rada Bot

Thank you for your interest in contributing to Rada Bot! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Redis (optional for development)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/rada-bot.git
   cd rada-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your development credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write tests for new features

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat: add airtime purchase service
fix: resolve payment validation issue
docs: update API documentation
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Mock external dependencies
- Aim for high test coverage

### Test Structure

```typescript
describe('Feature Name', () => {
  describe('Method Name', () => {
    it('should do something when condition is met', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## 🏗 Architecture

### Project Structure

```
src/
├── bot/              # Telegram bot implementation
├── services/         # Business logic services
├── server/           # Express server setup
├── utils/            # Utility functions
├── types/            # TypeScript definitions
└── __tests__/        # Test files
```

### Key Components

- **Bot**: Handles Telegram interactions
- **Services**: Business logic (Minmo, Session management)
- **Server**: Express server with webhooks
- **Utils**: Validation, formatting, logging

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to reproduce** - Detailed steps to reproduce the bug
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - OS, Node.js version, etc.
6. **Screenshots** - If applicable

## 💡 Feature Requests

When requesting features, please include:

1. **Use case** - Why is this feature needed?
2. **Description** - Detailed description of the feature
3. **Acceptance criteria** - How do we know it's done?
4. **Mockups** - Visual representations if applicable

## 🔒 Security

- Never commit sensitive information (API keys, tokens)
- Report security vulnerabilities privately
- Follow secure coding practices
- Validate all user inputs

## 📚 Documentation

- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update API documentation
- Include examples in documentation

## 🎯 Areas for Contribution

### High Priority
- [ ] Additional M-Pesa services
- [ ] Bitcoin wallet integration
- [ ] Multi-language support
- [ ] Advanced error handling

### Medium Priority
- [ ] Analytics dashboard
- [ ] User preferences
- [ ] Payment history
- [ ] Referral system

### Low Priority
- [ ] Mobile app
- [ ] Advanced trading features
- [ ] Social features
- [ ] Gamification

## 🤝 Code Review Process

1. **Automated checks** - CI/CD pipeline runs tests and linting
2. **Peer review** - At least one team member reviews the code
3. **Testing** - Manual testing of new features
4. **Documentation** - Ensure documentation is updated

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

## 📞 Getting Help

- 💬 **Discord**: Join our community server
- 📧 **Email**: dev@radabot.com
- 🐛 **Issues**: GitHub Issues
- 📖 **Docs**: Check the documentation

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Community highlights

Thank you for contributing to Rada Bot! 🚀
