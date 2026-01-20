# [Component/Module/API] Reference

> **Type:** Reference (Information-Oriented)  
> **Version:** [Version number]  
> **Last Updated:** [Date]

## Plain English Summary

- This is the technical reference for [component/module/API name]
- Use this document to look up specific details, parameters, and behaviors
- For learning how to use this, see [Tutorial link]
- For solving specific problems, see [How-To link]
- For understanding design decisions, see [Explanation link]

## Overview

[Brief 2-3 sentence description of what this component/module/API does]

**Location:** `[file path]`  
**Type:** `[TypeScript type]`  
**Module:** `[parent module]`  
**Since:** `[version introduced]`

---

## Quick Reference

```typescript
// Basic usage
import { ComponentName } from '@/path/to/component';

<ComponentName
  prop1="value"
  prop2={value}
  onEvent={handler}
/>
```

---

## Props / Parameters

### Required Props

#### `propName`
- **Type:** `string | number`
- **Required:** Yes
- **Description:** [What this prop does]
- **Example:** `propName="value"`
- **Constraints:** [Any validation rules]

#### `anotherProp`
- **Type:** `boolean`
- **Required:** Yes
- **Default:** N/A
- **Description:** [What this prop does]
- **Example:** `anotherProp={true}`

### Optional Props

#### `optionalProp`
- **Type:** `string`
- **Required:** No
- **Default:** `"default value"`
- **Description:** [What this prop does]
- **Example:** `optionalProp="custom"`
- **Notes:** [Additional context]

---

## Methods / Functions

### `methodName(param1, param2)`

**Description:** [What this method does]

**Signature:**
```typescript
methodName(param1: string, param2: number): Promise<ReturnType>
```

**Parameters:**
- `param1` (string): [Description]
- `param2` (number): [Description]

**Returns:**
- Type: `Promise<ReturnType>`
- Description: [What is returned]

**Example:**
```typescript
const result = await methodName("value", 42);
console.log(result); // { ... }
```

**Throws:**
- `ErrorType`: [When this error is thrown]

**See also:** [Related methods]

---

## Events / Callbacks

### `onEvent`

**Description:** [When this event fires]

**Signature:**
```typescript
onEvent?: (data: EventData) => void
```

**Parameters:**
- `data` (EventData): [Description of event data]

**Example:**
```typescript
<Component
  onEvent={(data) => {
    console.log('Event fired:', data);
  }}
/>
```

**Timing:** [When this fires relative to other events]

---

## Types / Interfaces

### `TypeName`

```typescript
interface TypeName {
  field1: string;
  field2: number;
  field3?: boolean;
  nested: {
    subField: string;
  };
}
```

**Fields:**
- `field1`: [Description]
- `field2`: [Description]
- `field3`: [Description] (optional)
- `nested.subField`: [Description]

**Usage:**
```typescript
const example: TypeName = {
  field1: "value",
  field2: 42,
  nested: {
    subField: "value"
  }
};
```

---

## Configuration

### Configuration Options

```typescript
interface ConfigOptions {
  option1: string;
  option2: number;
  option3: boolean;
}
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `option1` | string | `"default"` | [Description] |
| `option2` | number | `0` | [Description] |
| `option3` | boolean | `false` | [Description] |

**Example:**
```typescript
const config: ConfigOptions = {
  option1: "custom",
  option2: 100,
  option3: true
};
```

---

## Constants / Enums

### `EnumName`

```typescript
enum EnumName {
  VALUE1 = 'value1',
  VALUE2 = 'value2',
  VALUE3 = 'value3',
}
```

**Values:**
- `VALUE1`: [When to use]
- `VALUE2`: [When to use]
- `VALUE3`: [When to use]

---

## Return Values

### Success Response

```typescript
{
  status: 'success',
  data: {
    // Structure of successful response
  }
}
```

### Error Response

```typescript
{
  status: 'error',
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable message'
  }
}
```

---

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `ERROR_1` | [What it means] | [How to fix] |
| `ERROR_2` | [What it means] | [How to fix] |

---

## Constraints and Validation

- [Constraint #1]
- [Constraint #2]
- [Validation rule #1]
- [Validation rule #2]

**Example validation:**
```typescript
if (!isValid(input)) {
  throw new Error('Validation failed');
}
```

---

## State Management

**Internal State:**
- `state1`: [Description]
- `state2`: [Description]

**State Transitions:**
```
INITIAL → LOADING → LOADED
          ↓
        ERROR
```

---

## Side Effects

- [Side effect #1]
- [Side effect #2]
- [External dependencies called]

---

## Performance Characteristics

- **Time Complexity:** O(n)
- **Space Complexity:** O(1)
- **Rendering:** [React-specific perf notes]
- **Optimization:** [Memoization, etc.]

---

## Dependencies

**Required:**
- `dependency1`: [Why needed]
- `dependency2`: [Why needed]

**Optional:**
- `optionalDep`: [Enhanced functionality]

---

## Browser/Platform Support

- ✅ iOS 14+
- ✅ Android 10+
- ✅ Web (Chrome, Safari, Firefox)
- ❌ IE 11

---

## Examples

### Basic Example

```typescript
// Minimal usage
import { Component } from '@/path';

export default function Example() {
  return <Component prop="value" />;
}
```

### Advanced Example

```typescript
// Complex usage with all options
import { Component, ConfigType } from '@/path';

const config: ConfigType = {
  // Configuration
};

export default function AdvancedExample() {
  return (
    <Component
      required="value"
      optional="custom"
      config={config}
      onEvent={(data) => console.log(data)}
    />
  );
}
```

---

## Related APIs

- [Related component #1] - [Brief description]
- [Related component #2] - [Brief description]
- [Parent module] - [Brief description]

---

## Changelog

### v1.2.0
- Added `newProp` parameter
- Fixed issue with [specific bug]

### v1.1.0
- Initial release

**Full changelog:** [Link to CHANGELOG.md]

---

## Assumptions

- TypeScript types are current
- Examples are tested and working
- Documentation matches implementation
- Version specified is accurate

## Failure Modes

| Failure | Symptom | Investigation |
|---------|---------|---------------|
| [Failure] | [What happens] | [How to debug] |

## How to Verify

```bash
# Check implementation
cat [file path]

# Run tests
npm test [test file]

# Type check
npx tsc --noEmit
```

---

## See Also

- **Tutorial:** [Learn how to use this]
- **How-To:** [Solve specific problems]
- **Explanation:** [Understand the design]
- **Architecture:** [System context]

---

*This reference is auto-generated from source code types where possible.*  
*File: `[source file path]`*  
*Last verified: [Date]*
