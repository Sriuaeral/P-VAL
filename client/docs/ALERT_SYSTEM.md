# Unified Alert System

This document describes the new unified alert system that replaces all `window.alert()` and `window.confirm()` calls throughout the application with a modern, accessible, and beautiful UI/UX.

## Overview

The alert system provides:
- **Toast Notifications**: Non-blocking notifications for success, error, warning, and info messages
- **Dialog Alerts**: Blocking dialogs for confirmations and critical alerts
- **Specialized Helpers**: Pre-configured alerts for common use cases
- **Accessibility**: Full keyboard navigation and screen reader support
- **Modern UI**: Beautiful, consistent design with animations

## Components

### Core Components
- `AlertDialog` - Base dialog component with variants
- `EnhancedAlertDialog` - Enhanced dialog with icons and styling
- `AlertService` - Service for managing alerts
- `useAlert` - React hook for easy integration

### Providers
- `AlertProvider` - Global alert context provider

## Usage

### Basic Setup

1. **Import the hook in your component:**
```tsx
import { useAlert } from '@/hooks/use-alert';

function MyComponent() {
  const alert = useAlert();
  // ... rest of your component
}
```

2. **Use the alert methods:**
```tsx
// Toast notifications (non-blocking)
alert.success('Success!', 'Operation completed successfully');
alert.error('Error!', 'Something went wrong');
alert.warning('Warning!', 'Please check your input');
alert.info('Info', 'Here is some information');

// Blocking dialogs
await alert.alert('Title', 'Description');
const confirmed = await alert.confirm({
  title: 'Confirm Action',
  description: 'Are you sure?',
  variant: 'warning'
});
```

### Toast Notifications

Toast notifications are non-blocking and appear in the top-right corner:

```tsx
// Basic toast
alert.success('Success!', 'Data saved successfully');

// Toast with custom options
alert.error('Error!', 'Failed to save data', {
  duration: 5000,
  action: {
    label: 'Retry',
    onClick: () => retryOperation()
  }
});
```

### Dialog Alerts

Dialog alerts are blocking and require user interaction:

```tsx
// Simple alert
await alert.alert('Important', 'This is important information');

// Confirmation dialog
const confirmed = await alert.confirm({
  title: 'Delete Item',
  description: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'error'
});

if (confirmed) {
  // User confirmed
} else {
  // User cancelled
}
```

### Specialized Helpers

The system includes pre-configured helpers for common scenarios:

```tsx
// Validation errors
alert.validationError('Please fill in all required fields');

// API errors
alert.apiError('Failed to connect to server');

// Feature under construction
alert.featureUnderConstruction('Advanced Analytics');

// Export notifications
alert.exportNotification('CSV');

// File upload
alert.fileUploadSuccess('document.pdf');
alert.fileUploadError('document.pdf');

// Work orders
alert.workOrderCreated();
alert.workOrderUpdated();
alert.workOrderError('create');

// Comments
alert.commentAdded();
alert.commentError();
```

## Migration from window.alert()

### Before (Old System)
```tsx
// Basic alert
alert('Please fill in all required fields');

// Confirmation
const confirmed = window.confirm('Are you sure?');
if (confirmed) {
  // Proceed
}
```

### After (New System)
```tsx
// Basic alert
alert.validationError('Please fill in all required fields');

// Confirmation
const confirmed = await alert.confirm({
  title: 'Confirm Action',
  description: 'Are you sure?'
});
if (confirmed) {
  // Proceed
}
```

## Alert Variants

The system supports different visual variants:

- `default` - Standard blue theme
- `success` - Green theme for success messages
- `warning` - Yellow theme for warnings
- `error` - Red theme for errors
- `info` - Blue theme for information

## Configuration

### Toast Configuration
```tsx
alert.success('Title', 'Description', {
  duration: 5000,        // Auto-dismiss after 5 seconds
  position: 'top-right', // Position on screen
  action: {               // Optional action button
    label: 'View',
    onClick: () => navigate('/details')
  }
});
```

### Dialog Configuration
```tsx
await alert.confirm({
  title: 'Delete Item',
  description: 'This action cannot be undone.',
  confirmText: 'Delete',     // Custom confirm button text
  cancelText: 'Cancel',       // Custom cancel button text
  variant: 'error',           // Visual variant
  onConfirm: () => {          // Optional callback
    console.log('Confirmed');
  },
  onCancel: () => {            // Optional callback
    console.log('Cancelled');
  }
});
```

## Best Practices

1. **Use appropriate alert types:**
   - Toast for non-critical notifications
   - Dialog for critical actions requiring confirmation

2. **Provide clear, actionable messages:**
   - Be specific about what went wrong
   - Suggest next steps when possible

3. **Use specialized helpers when available:**
   - They provide consistent messaging
   - They're optimized for common scenarios

4. **Consider accessibility:**
   - All alerts are keyboard navigable
   - Screen reader friendly
   - High contrast support

## Examples

See `client/components/ui/alert-examples.tsx` for comprehensive examples of all alert types and configurations.

## Troubleshooting

### Common Issues

1. **Alert not showing:**
   - Ensure `AlertProvider` is wrapped around your app
   - Check that `useAlert` hook is properly imported

2. **Styling issues:**
   - Ensure Tailwind CSS is properly configured
   - Check that all UI components are imported

3. **TypeScript errors:**
   - Ensure all types are properly imported
   - Check that alert service is properly typed

### Debug Mode

Enable debug mode to see alert system logs:

```tsx
// In your component
const alert = useAlert();

// Enable debug mode
alert.debug = true;
```

## Performance

The alert system is optimized for performance:
- Lazy loading of dialog components
- Efficient state management
- Minimal re-renders
- Memory leak prevention

## Browser Support

The alert system supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

Full accessibility support:
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus management
