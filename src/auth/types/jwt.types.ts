// JWT payload interfaces for type safety
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface PasswordResetPayload extends JwtPayload {
  type: 'password-reset';
}

export interface EmailVerificationPayload extends JwtPayload {
  type: 'email-verification';
}

// Union type for all possible JWT payloads
export type AuthJwtPayload =
  | PasswordResetPayload
  | EmailVerificationPayload
  | JwtPayload;
