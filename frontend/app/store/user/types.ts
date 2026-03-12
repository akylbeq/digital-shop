export interface IUser {
  id: number;
  email: string;
  role: string;
}

export interface UserRegister {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface UserLogin {
  email: string;
  password: string;
}