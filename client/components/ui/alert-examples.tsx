import React from 'react';
import { useAlert } from '@/hooks/use-alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Alert System Examples
 * 
 * This file demonstrates how to use the new unified alert system
 * that replaces all window.alert() and window.confirm() calls.
 */

export function AlertExamples() {
  const alert = useAlert();

  // Toast notifications (non-blocking)
  const showSuccessToast = () => {
    alert.success('Operation Successful', 'Your data has been saved successfully.');
  };

  const showErrorToast = () => {
    alert.error('Operation Failed', 'Something went wrong. Please try again.');
  };

  const showWarningToast = () => {
    alert.warning('Warning', 'This action may have unintended consequences.');
  };

  const showInfoToast = () => {
    alert.info('Information', 'Here is some helpful information for you.');
  };

  // Blocking dialogs
  const showAlertDialog = async () => {
    await alert.alert('Important Notice', 'This is a blocking alert dialog that requires user interaction.');
  };

  const showConfirmDialog = async () => {
    const confirmed = await alert.confirm({
      title: 'Confirm Action',
      description: 'Are you sure you want to proceed with this action?',
      confirmText: 'Yes, Continue',
      cancelText: 'Cancel',
      variant: 'warning'
    });
    
    if (confirmed) {
      alert.success('Action Confirmed', 'You have confirmed the action.');
    }
  };

  // Specialized helpers
  const showValidationError = () => {
    alert.validationError('Please fill in all required fields');
  };

  const showApiError = () => {
    alert.apiError('Failed to connect to server');
  };

  const showFeatureUnderConstruction = () => {
    alert.featureUnderConstruction('Advanced Analytics');
  };

  const showExportNotification = () => {
    alert.exportNotification('CSV');
  };

  const showFileUploadSuccess = () => {
    alert.fileUploadSuccess('document.pdf');
  };

  const showFileUploadError = () => {
    alert.fileUploadError('document.pdf');
  };

  const showWorkOrderCreated = () => {
    alert.workOrderCreated();
  };

  const showWorkOrderError = () => {
    alert.workOrderError('create');
  };

  const showCommentAdded = () => {
    alert.commentAdded();
  };

  const showCommentError = () => {
    alert.commentError();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alert System Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Toast Notifications */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Toast Notifications (Non-blocking)</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={showSuccessToast} variant="default">
                Success Toast
              </Button>
              <Button onClick={showErrorToast} variant="destructive">
                Error Toast
              </Button>
              <Button onClick={showWarningToast} variant="outline">
                Warning Toast
              </Button>
              <Button onClick={showInfoToast} variant="secondary">
                Info Toast
              </Button>
            </div>
          </div>

          {/* Blocking Dialogs */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Blocking Dialogs</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={showAlertDialog} variant="outline">
                Alert Dialog
              </Button>
              <Button onClick={showConfirmDialog} variant="outline">
                Confirm Dialog
              </Button>
            </div>
          </div>

          {/* Specialized Helpers */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Specialized Helpers</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={showValidationError} variant="outline" size="sm">
                Validation Error
              </Button>
              <Button onClick={showApiError} variant="outline" size="sm">
                API Error
              </Button>
              <Button onClick={showFeatureUnderConstruction} variant="outline" size="sm">
                Feature Under Construction
              </Button>
              <Button onClick={showExportNotification} variant="outline" size="sm">
                Export Notification
              </Button>
              <Button onClick={showFileUploadSuccess} variant="outline" size="sm">
                File Upload Success
              </Button>
              <Button onClick={showFileUploadError} variant="outline" size="sm">
                File Upload Error
              </Button>
              <Button onClick={showWorkOrderCreated} variant="outline" size="sm">
                Work Order Created
              </Button>
              <Button onClick={showWorkOrderError} variant="outline" size="sm">
                Work Order Error
              </Button>
              <Button onClick={showCommentAdded} variant="outline" size="sm">
                Comment Added
              </Button>
              <Button onClick={showCommentError} variant="outline" size="sm">
                Comment Error
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Usage:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useAlert } from '@/hooks/use-alert';

function MyComponent() {
  const alert = useAlert();
  
  const handleSubmit = async () => {
    try {
      // Your logic here
      alert.success('Success!', 'Data saved successfully');
    } catch (error) {
      alert.error('Error!', 'Failed to save data');
    }
  };
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Confirmation Dialog:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const handleDelete = async () => {
  const confirmed = await alert.confirm({
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item?',
    variant: 'error'
  });
  
  if (confirmed) {
    // Proceed with deletion
  }
};`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Form Validation:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const handleSubmit = () => {
  if (!formData.email) {
    alert.validationError('Email is required');
    return;
  }
  
  if (!formData.password) {
    alert.validationError('Password is required');
    return;
  }
  
  // Proceed with form submission
};`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AlertExamples;
