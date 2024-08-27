import crypto, { BinaryLike } from 'crypto';

export const encryptToSha256 = (value: string | BinaryLike): string =>
  crypto.createHash('sha256').update(value).digest('hex');
