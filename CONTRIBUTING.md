# Contributing to Calendarify AI

Thank you for your interest in contributing to Calendarify AI! We welcome contributions from the community and are grateful for your support.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [How to Contribute](#how-to-contribute)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Questions](#questions)

## 📜 Code of Conduct

This project follows a code of conduct that all contributors are expected to uphold. Please be respectful, inclusive, and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- Google Gemini API key (for testing AI features)
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Calendarify-AI.git
   cd Calendarify-AI
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/dspacks/Calendarify-AI.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Create `.env.local`** file:
   ```env
   GEMINI_API_KEY=your_test_api_key
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔄 Development Process

### Branching Strategy

We use a feature branch workflow:

- `main` - Stable, production-ready code
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/refactor-description` - Code refactoring

### Keeping Your Fork in Sync

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your local main
git checkout main
git merge upstream/main

# Push updates to your fork
git push origin main
```

## 🛠️ How to Contribute

### Reporting Bugs

Before creating a bug report, please:
1. Check the [existing issues](https://github.com/dspacks/Calendarify-AI/issues) to avoid duplicates
2. Gather information about the bug (browser, OS, steps to reproduce)

Create a bug report with:
- **Clear title** describing the issue
- **Detailed description** of the problem
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** (if applicable)
- **Environment details** (browser, OS, Node version)

### Suggesting Features

Feature requests are welcome! Please:
1. Check if the feature has already been suggested
2. Provide a clear use case for the feature
3. Explain how it benefits users
4. Consider potential implementation approaches

### Contributing Code

1. **Find or create an issue** to work on
2. **Comment on the issue** to let others know you're working on it
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes** following our [coding guidelines](#coding-guidelines)
5. **Test your changes** thoroughly
6. **Commit your changes** with clear messages
7. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

8. **Open a Pull Request** from your fork to the main repository

## 📝 Coding Guidelines

### TypeScript Standards

- **Use TypeScript** for all new code
- **Define proper types** - avoid `any` where possible
- **Use interfaces** for object shapes
- **Export types** that may be reused

Example:
```typescript
// Good
interface Event {
  id: string;
  title: string;
  date: Date;
}

// Avoid
const event: any = { ... }
```

### React Best Practices

- **Use functional components** with hooks
- **Keep components focused** - single responsibility principle
- **Use meaningful names** for components and variables
- **Extract reusable logic** into custom hooks
- **Avoid prop drilling** - consider context for deeply nested data

Example:
```typescript
// Good - focused component
export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <time>{format(event.date, 'PPP')}</time>
    </div>
  );
};
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings (except JSX attributes)
- **Semicolons**: Required
- **Line length**: Max 100 characters (soft limit)
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for components and types
  - `UPPER_CASE` for constants

### File Organization

- One component per file
- Group related files in folders
- Use index files for cleaner imports
- Keep utilities separate from components

### Comments

- Use comments to explain **why**, not **what**
- Add JSDoc comments for public APIs
- Update comments when code changes

Example:
```typescript
/**
 * Generates AI art for a day's events using Google Gemini.
 * @param eventSummaries - Array of event titles for the day
 * @param customPrompt - Optional custom prompt to inject
 * @returns Base64 encoded image data or null if generation fails
 */
export const generateDayImage = async (
  eventSummaries: string[],
  customPrompt?: string
): Promise<string | null> => {
  // Implementation
}
```

## 💬 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(calendar): add month navigation controls

Add left/right arrow buttons to navigate between months.
Users can now easily switch months without re-uploading files.

Closes #42
```

```bash
fix(pdf-export): correct aspect ratio calculation

The PDF export was cutting off calendar edges. Updated the
calculation to properly fit content within margins.
```

```bash
docs(readme): update installation instructions

Added troubleshooting section for common setup issues.
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No console.log statements left in code
- [ ] Tested in multiple browsers (if UI changes)
- [ ] Tested with various calendar files (if parser changes)

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in release notes

## 🧪 Testing

### Manual Testing

Test your changes with:
- Various ICS file formats
- Different calendar sizes (1 event to 100+ events)
- Multiple browsers (Chrome, Firefox, Safari)
- Different screen sizes (mobile, tablet, desktop)
- Edge cases (no events, all-day events, multi-day events)

### Testing AI Features

- Test with and without custom prompts
- Verify rate limiting doesn't cause errors
- Check image quality and relevance
- Test cancellation of bulk operations

### PDF Export Testing

- Verify all events are visible
- Check image quality in exported PDF
- Test on different paper sizes
- Verify colors print correctly

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing behavior
- Adding configuration options
- Fixing documentation errors

### Documentation Locations

- **README.md**: User-facing documentation
- **CONTRIBUTING.md**: This file
- **Code comments**: For complex logic
- **Type definitions**: JSDoc comments for public APIs

## ❓ Questions

If you have questions:
1. Check existing [documentation](README.md)
2. Search [closed issues](https://github.com/dspacks/Calendarify-AI/issues?q=is%3Aissue+is%3Aclosed)
3. Ask in [Discussions](https://github.com/dspacks/Calendarify-AI/discussions)
4. Create a new [issue](https://github.com/dspacks/Calendarify-AI/issues/new)

## 🎉 Recognition

Contributors will be:
- Listed in release notes
- Credited in the project
- Part of building something awesome!

## 📄 License

By contributing to Calendarify AI, you agree that your contributions will be licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

---

Thank you for contributing to Calendarify AI! 🙏
