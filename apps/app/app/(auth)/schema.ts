export interface AuthActionState {
  readonly error: string | null;
  readonly success: boolean;
  readonly message?: string | null;
}

export const initialAuthActionState: AuthActionState = {
  error: null,
  success: false,
  message: null,
};
