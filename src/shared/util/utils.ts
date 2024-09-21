import * as bcrypt from 'bcrypt';
import { appConfig } from '../../config/config';

export async function generateHashedPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, appConfig.SALT_ROUNDS);
  return hashedPassword;
}

export async function isPasswordValid(password1: string, password2: string): Promise<boolean> {
  const isValid = await bcrypt.compare(password1, password2);
  return isValid;
}

export function generateRandomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
