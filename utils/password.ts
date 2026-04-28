export const PASSWORD_AUTH_COOKIE = "fibofinance_auth_token";
export const PASSWORD_SETTING_KEY = "password";
export const PASSWORD_LENGTH_OPTIONS = [4, 6] as const;

export type PasswordLength = (typeof PASSWORD_LENGTH_OPTIONS)[number];

export const DEFAULT_PASSWORD_LENGTH: PasswordLength = 4;

export const isPasswordLength = (value: unknown): value is PasswordLength => {
  return PASSWORD_LENGTH_OPTIONS.includes(Number(value) as PasswordLength);
};

export const normalizePasswordLength = (value: unknown): PasswordLength => {
  const length = Number(value);

  return isPasswordLength(length) ? length : DEFAULT_PASSWORD_LENGTH;
};

export const isValidNumericPassword = (password: string, length: PasswordLength) => {
  return new RegExp(`^\\d{${length}}$`).test(password);
};
