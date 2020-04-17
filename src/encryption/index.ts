import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const algorithm = 'aes-256-ctr';
const outputEncoding = 'hex';
const inputEncoding = 'utf8';

export const encrypt = (value: string, key: string): string => {
  const iv = Buffer.from(randomBytes(16));
  const cipher = createCipheriv(algorithm, key, iv);
  let crypted = cipher.update(value, inputEncoding, outputEncoding);
  crypted += cipher.final(outputEncoding);
  return `${iv.toString('hex')}:${crypted.toString()}`;
};

export const decrypt = (value: string, key: string): string => {
  const textParts = value.split(':');
  const IV = Buffer.from(textParts.shift()!, outputEncoding);
  const encryptedText = Buffer.from(textParts.join(':')!, outputEncoding);
  const decipher = createDecipheriv(algorithm, key, IV);
  let decrypted = decipher.update(
    encryptedText.toString(outputEncoding),
    outputEncoding,
    inputEncoding
  );
  decrypted += decipher.final(inputEncoding);
  return decrypted.toString();
};
