# Accessibility Features

This document describes the accessibility features implemented in the Hostes application.

## Overview

The application has been designed with accessibility in mind, following WCAG 2.1 Level AA guidelines. All interactive components support keyboard navigation and include proper ARIA attributes.

## Keyboard Navigation

### Global

- **Tab**: Navigate through focusable elements
- **Shift + Tab**: Navigate backwards
- **Enter**: Activate buttons and links
- **Escape**: Close modals and dialogs

### Modal Dialogs

- **Escape**: Close modal
- **Tab**: Navigate within modal (focus trap enabled)
- **Shift + Tab**: Navigate backwards within modal
- Focus is automatically returned to the trigger element when modal closes

### Tables (Drag & Drop)

- **Enter/Space**: Select table
- **Tab**: Navigate between tables
- Mouse drag-and-drop is also fully supported

### Forms

- All form fields have associated labels
- Error messages are announced to screen readers
- Required fields are properly marked
- Validation errors are connected via `aria-describedby`

## ARIA Attributes

### Button Component

- `aria-busy`: Indicates loading state
- `aria-disabled`: Indicates disabled state
- `aria-label`: For icon-only buttons
- `role="status"`: For loading spinners

### Input Component

- `aria-invalid`: Indicates validation errors
- `aria-describedby`: Connects to error/helper text
- Unique IDs generated with React's `useId()` hook
- Icons marked with `aria-hidden="true"`

### Select Component

- `aria-invalid`: Indicates validation errors
- `aria-describedby`: Connects to error/helper text
- Icons marked with `aria-hidden="true"`
- Proper `htmlFor` labels

### Modal Component

- `role="dialog"`: Identifies modal as dialog
- `aria-modal="true"`: Indicates modal state
- `aria-labelledby`: Connects to modal title
- `role="presentation"`: For backdrop
- Focus trap implementation
- Focus restoration on close

### Table Items (Drag & Drop)

- `role="button"`: Makes draggable items keyboard accessible
- `aria-label`: Descriptive label with table number and seats
- `aria-pressed`: Indicates selection state
- `tabIndex={0}`: Makes items keyboard focusable

## Focus Management

### Modal Focus Trap

When a modal opens:
1. The previously focused element is saved
2. Focus is moved to the modal container
3. Tab navigation is trapped within the modal
4. Pressing Tab on the last element focuses the first element
5. Pressing Shift+Tab on the first element focuses the last element
6. Focus is restored to the previous element when modal closes

### Visual Focus Indicators

All interactive elements have visible focus indicators:

```css
&:focus-visible {
  outline: 2px solid primary-color;
  outline-offset: 2px;
}
```

## Screen Reader Support

### Announcements

- Form validation errors are announced via `role="alert"`
- Loading states are announced via `aria-busy` and `role="status"`
- Modal titles are properly connected via `aria-labelledby`

### Semantic HTML

- Proper heading hierarchy (`h1`, `h2`, `h3`)
- Semantic form elements (`label`, `input`, `select`)
- Buttons use `<button>` elements
- Links use `<a>` elements with proper hrefs

## Error Handling

The application includes an ErrorBoundary component that:
- Catches JavaScript errors in child components
- Displays a user-friendly error message
- Provides options to retry or reload
- Shows detailed error information in development mode

## Color Contrast

All text and interactive elements meet WCAG AA contrast requirements:
- Normal text: minimum 4.5:1
- Large text: minimum 3:1
- UI components: minimum 3:1

## Testing Recommendations

### Keyboard Testing

1. Navigate through the entire app using only keyboard
2. Ensure all interactive elements are reachable
3. Verify focus indicators are visible
4. Test modal focus trapping
5. Test form submission with keyboard

### Screen Reader Testing

Recommended screen readers:
- **Windows**: NVDA or JAWS
- **macOS**: VoiceOver
- **Linux**: Orca

Test checklist:
- [ ] All images have appropriate alt text or aria-labels
- [ ] Form labels are properly announced
- [ ] Error messages are announced
- [ ] Button purposes are clear
- [ ] Modal titles are announced
- [ ] Table information is descriptive

### Automated Testing

Tools to use:
- **axe DevTools**: Browser extension for accessibility testing
- **Lighthouse**: Built into Chrome DevTools
- **WAVE**: Web accessibility evaluation tool

## Known Limitations

1. **Drag and Drop**: While keyboard selection is supported, moving tables via keyboard is not yet implemented (requires arrow key handlers)
2. **Color Picker**: Future table color customization will need accessible color selection
3. **Date Picker**: Native date inputs are used, which have varying accessibility support across browsers

## Future Improvements

- [ ] Add arrow key navigation for moving selected tables
- [ ] Implement skip links for navigation
- [ ] Add high contrast mode
- [ ] Provide keyboard shortcuts documentation
- [ ] Add preference for reduced motion
- [ ] Implement live regions for dynamic updates
- [ ] Add text size controls
- [ ] Support for multiple languages with proper lang attributes

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
