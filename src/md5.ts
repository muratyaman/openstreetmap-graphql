import crypto from 'crypto';

export default function (data: string) {
  return crypto.createHash('md5').update(data).digest('hex');
}
