/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
}

// Email validation
export function validateEmail(email: string): FieldValidation {
  const trimmed = email.trim();

  if (!trimmed) {
    return { field: 'email', isValid: false, error: '이메일을 입력해주세요' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { field: 'email', isValid: false, error: '올바른 이메일 형식이 아닙니다' };
  }

  if (trimmed.length > 255) {
    return { field: 'email', isValid: false, error: '이메일이 너무 깁니다' };
  }

  return { field: 'email', isValid: true };
}

// Password validation
export function validatePassword(password: string): FieldValidation & { requirements?: string[] } {
  const errors: string[] = [];

  if (!password) {
    return { field: 'password', isValid: false, error: '비밀번호를 입력해주세요' };
  }

  if (password.length < 8) {
    errors.push('8자 이상');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자 포함');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('소문자 포함');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('숫자 포함');
  }

  if (errors.length > 0) {
    return {
      field: 'password',
      isValid: false,
      error: `비밀번호 요구사항: ${errors.join(', ')}`,
      requirements: errors
    };
  }

  return { field: 'password', isValid: true };
}

// Name validation
export function validateName(name: string): FieldValidation {
  const trimmed = name.trim();

  if (!trimmed) {
    return { field: 'name', isValid: false, error: '이름을 입력해주세요' };
  }

  if (trimmed.length < 2) {
    return { field: 'name', isValid: false, error: '이름은 2자 이상이어야 합니다' };
  }

  if (trimmed.length > 50) {
    return { field: 'name', isValid: false, error: '이름이 너무 깁니다 (최대 50자)' };
  }

  return { field: 'name', isValid: true };
}

// Required field validation
export function validateRequired(value: string, fieldName: string): FieldValidation {
  const trimmed = value.trim();

  if (!trimmed) {
    return { field: fieldName, isValid: false, error: `${fieldName}을(를) 입력해주세요` };
  }

  return { field: fieldName, isValid: true };
}

// Max length validation
export function validateMaxLength(value: string, maxLength: number, fieldName: string): FieldValidation {
  if (value.length > maxLength) {
    return {
      field: fieldName,
      isValid: false,
      error: `${fieldName}은(는) ${maxLength}자를 초과할 수 없습니다`
    };
  }

  return { field: fieldName, isValid: true };
}

// Idea form validation
export interface IdeaValidationInput {
  title: string;
  description: string;
  category: string;
}

export function validateIdeaForm(data: IdeaValidationInput): ValidationResult {
  const errors: string[] = [];

  // Title validation
  const titleTrimmed = data.title.trim();
  if (!titleTrimmed) {
    errors.push('제목을 입력해주세요');
  } else if (titleTrimmed.length < 2) {
    errors.push('제목은 2자 이상이어야 합니다');
  } else if (titleTrimmed.length > 200) {
    errors.push('제목은 200자를 초과할 수 없습니다');
  }

  // Description validation
  const descTrimmed = data.description.trim();
  if (!descTrimmed) {
    errors.push('설명을 입력해주세요');
  } else if (descTrimmed.length < 10) {
    errors.push('설명은 10자 이상이어야 합니다');
  } else if (descTrimmed.length > 5000) {
    errors.push('설명은 5000자를 초과할 수 없습니다');
  }

  // Category validation
  const catTrimmed = data.category.trim();
  if (!catTrimmed) {
    errors.push('카테고리를 입력해주세요');
  } else if (catTrimmed.length > 50) {
    errors.push('카테고리는 50자를 초과할 수 없습니다');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Login form validation
export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: string[] = [];

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid && emailValidation.error) {
    errors.push(emailValidation.error);
  }

  if (!password) {
    errors.push('비밀번호를 입력해주세요');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Shallow array comparison
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Efficient form data comparison (avoids JSON.stringify)
export function isFormDataEqual<T extends Record<string, unknown>>(
  a: T | null,
  b: T | null
): boolean {
  if (a === null || b === null) return a === b;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    const valA = a[key];
    const valB = b[key];

    // Handle arrays (like tags)
    if (Array.isArray(valA) && Array.isArray(valB)) {
      if (!arraysEqual(valA as string[], valB as string[])) return false;
    }
    // Handle primitive values
    else if (valA !== valB) {
      return false;
    }
  }

  return true;
}

// Register form validation
export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult {
  const errors: string[] = [];

  const nameValidation = validateName(name);
  if (!nameValidation.isValid && nameValidation.error) {
    errors.push(nameValidation.error);
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid && emailValidation.error) {
    errors.push(emailValidation.error);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid && passwordValidation.error) {
    errors.push(passwordValidation.error);
  }

  if (password !== confirmPassword) {
    errors.push('비밀번호가 일치하지 않습니다');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
