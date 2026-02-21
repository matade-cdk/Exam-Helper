name: Pull Request
description: Submit a pull request to Exam Helper
body:
  - type: markdown
    attributes:
      value: |
        Thanks for your contribution! Please fill out this template to help us review your PR.
  
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What does this PR do?
      placeholder: This PR adds flashcard generation feature...
    validations:
      required: true
  
  - type: dropdown
    id: type
    attributes:
      label: Type of Change
      description: What type of change is this?
      options:
        - Bug fix
        - New feature
        - Enhancement
        - Documentation
        - Refactoring
        - Performance improvement
        - Testing
    validations:
      required: true
  
  - type: textarea
    id: changes
    attributes:
      label: Changes Made
      description: List the key changes
      placeholder: |
        - Added flashcard generation endpoint
        - Updated frontend UI with new button
        - Added tests for flashcard feature
    validations:
      required: true
  
  - type: textarea
    id: testing
    attributes:
      label: Testing
      description: How was this tested?
      placeholder: |
        - Manual testing with various PDF files
        - Added unit tests for new functions
        - Tested in Chrome, Firefox, and Safari
    validations:
      required: false
  
  - type: checkboxes
    id: checklist
    attributes:
      label: Checklist
      description: Please confirm the following
      options:
        - label: I have tested these changes locally
        - label: Code follows the project's style guidelines
        - label: I have commented complex code sections
        - label: Documentation has been updated if needed
        - label: No console errors or warnings
        - label: All existing tests pass
  
  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots (if applicable)
      description: Add screenshots for UI changes
    validations:
      required: false
  
  - type: textarea
    id: notes
    attributes:
      label: Additional Notes
      description: Any other information for reviewers
    validations:
      required: false
