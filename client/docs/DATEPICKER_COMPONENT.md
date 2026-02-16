# DatePicker Component Documentation

## Overview

The `DatePicker` component is a comprehensive, reusable date selection component that provides multiple interaction patterns and customization options. It was created to standardize date picking across the entire codebase, replacing various ad-hoc implementations.

## Features

- **Multiple Variants**: Default (modal), Modal, and Popover variants
- **Flexible Sizing**: Small, medium, and large sizes
- **Date Constraints**: Min/max date support
- **Accessibility**: Keyboard navigation and screen reader support
- **Customizable Styling**: Extensive className customization options
- **Error Handling**: Built-in error state support
- **Help Text**: Optional help text display
- **Responsive**: Works across all screen sizes

## Usage

### Basic Usage

```tsx
import { DatePicker } from "@/components/ui/date-picker";

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Pick a date"
      label="Select Date"
    />
  );
}
```

### Advanced Usage

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Pick a date"
  label="Due Date"
  required
  minDate={new Date()}
  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
  variant="popover"
  size="lg"
  error="This field is required"
  helpText="Select a date within the next 30 days"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| undefined` | `undefined` | The selected date |
| `onChange` | `(date: Date \| undefined) => void` | - | Callback when date changes |
| `placeholder` | `string` | `"Pick a date"` | Placeholder text |
| `label` | `string` | - | Label for the date picker |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `required` | `boolean` | `false` | Whether the field is required |
| `minDate` | `Date` | - | Minimum selectable date |
| `maxDate` | `Date` | - | Maximum selectable date |
| `className` | `string` | - | Additional CSS classes for container |
| `buttonClassName` | `string` | - | Additional CSS classes for button |
| `labelClassName` | `string` | - | Additional CSS classes for label |
| `variant` | `"default" \| "modal" \| "popover"` | `"default"` | Display variant |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size of the component |
| `showTime` | `boolean` | `false` | Whether to show time selection (future feature) |
| `timeFormat` | `"12h" \| "24h"` | `"12h"` | Time format (future feature) |
| `format` | `string` | `"PPP"` | Date format string |
| `error` | `string` | - | Error message to display |
| `helpText` | `string` | - | Help text to display |

## Variants

### Default Variant
The default variant uses a modal overlay with backdrop blur, similar to the original WorkOrderCreateDialog implementation.

```tsx
<DatePicker
  variant="default"
  value={date}
  onChange={setDate}
  label="Default Date Picker"
/>
```

### Modal Variant
Explicitly uses a modal overlay with enhanced styling.

```tsx
<DatePicker
  variant="modal"
  value={date}
  onChange={setDate}
  label="Modal Date Picker"
/>
```

### Popover Variant
Uses a lightweight popover that appears near the trigger button.

```tsx
<DatePicker
  variant="popover"
  value={date}
  onChange={setDate}
  label="Popover Date Picker"
/>
```

## Sizes

### Small
```tsx
<DatePicker size="sm" value={date} onChange={setDate} />
```

### Medium (Default)
```tsx
<DatePicker size="md" value={date} onChange={setDate} />
```

### Large
```tsx
<DatePicker size="lg" value={date} onChange={setDate} />
```

## Date Constraints

### Minimum Date
```tsx
<DatePicker
  minDate={new Date()}
  value={date}
  onChange={setDate}
  helpText="Cannot select dates before today"
/>
```

### Maximum Date
```tsx
<DatePicker
  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
  value={date}
  onChange={setDate}
  helpText="Cannot select dates more than 30 days in the future"
/>
```

### Date Range
```tsx
<DatePicker
  minDate={startDate}
  maxDate={endDate}
  value={date}
  onChange={setDate}
  helpText="Select a date within the specified range"
/>
```

## Error Handling

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  error="This field is required"
  required
/>
```

## Form Integration

### With Form Libraries
The DatePicker works seamlessly with form libraries like React Hook Form:

```tsx
import { useForm, Controller } from "react-hook-form";

function MyForm() {
  const { control } = useForm();

  return (
    <Controller
      name="dueDate"
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
          label="Due Date"
          required
        />
      )}
    />
  );
}
```

## Migration Guide

### From WorkOrderCreateDialog Calendar
**Before:**
```tsx
const [value, onChange] = useState<Date | undefined>(undefined);
const [showCalendar, setShowCalendar] = useState(false);
const [tempValue, setTempValue] = useState<Date | undefined>(undefined);

// Complex calendar JSX with backdrop, modal, etc.
```

**After:**
```tsx
<DatePicker
  value={formData.dueDate}
  onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
  placeholder="Pick a date"
  label="Due Date"
  minDate={new Date()}
  variant="default"
  size="md"
/>
```

### From Popover + Calendar Pattern
**Before:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start text-left font-normal">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      initialFocus
    />
  </PopoverContent>
</Popover>
```

**After:**
```tsx
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Pick a date"
  variant="popover"
/>
```

## Styling

### Custom Button Styling
```tsx
<DatePicker
  buttonClassName="border-blue-500 hover:border-blue-600"
  value={date}
  onChange={setDate}
/>
```

### Custom Container Styling
```tsx
<DatePicker
  className="my-custom-container"
  value={date}
  onChange={setDate}
/>
```

### Custom Label Styling
```tsx
<DatePicker
  labelClassName="text-blue-600 font-bold"
  label="Custom Label"
  value={date}
  onChange={setDate}
/>
```

## Accessibility

The DatePicker component includes comprehensive accessibility features:

- **Keyboard Navigation**: Full keyboard support for date selection
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Proper focus handling when opening/closing
- **Escape Key**: Closes the picker when pressed
- **Tab Navigation**: Integrates with tab order

## Examples

See `client/components/ui/date-picker-examples.tsx` for comprehensive usage examples.

## Implementation Details

### State Management
The component manages its own internal state for:
- Open/closed state
- Temporary value during selection
- Keyboard event handling

### Event Handling
- **Escape Key**: Closes the picker
- **Click Outside**: Closes the picker (modal variants)
- **Date Selection**: Immediately closes and calls onChange

### Performance
- **Lazy Rendering**: Calendar only renders when open
- **Event Cleanup**: Proper cleanup of event listeners
- **Memory Management**: No memory leaks from event listeners

## Future Enhancements

- **Time Selection**: Support for time picker integration
- **Date Ranges**: Support for selecting date ranges
- **Custom Formats**: More date format options
- **Internationalization**: Multi-language support
- **Themes**: Dark mode and custom themes

## Troubleshooting

### Common Issues

1. **Date not updating**: Ensure you're using the `onChange` callback properly
2. **Styling conflicts**: Use the `className` props for custom styling
3. **Accessibility issues**: Ensure proper labeling and keyboard navigation

### Debug Mode
Enable debug logging by setting the component in development mode:

```tsx
<DatePicker
  value={date}
  onChange={(date) => {
    console.log('Date selected:', date);
    setDate(date);
  }}
  // ... other props
/>
```

## Contributing

When modifying the DatePicker component:

1. **Maintain Backward Compatibility**: Don't break existing implementations
2. **Add Tests**: Include tests for new features
3. **Update Documentation**: Update this file for new features
4. **Consider Accessibility**: Ensure new features are accessible
5. **Performance**: Consider performance impact of changes

## Related Components

- `Calendar` - The underlying calendar component
- `Popover` - Used for popover variant
- `Button` - Used for the trigger button
- `Label` - Used for labeling
