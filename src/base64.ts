const BASE64 = 'base64';
const UTF8 = 'utf-8';

function decode(data: string) {
  let buffer = Buffer.from(data, BASE64);
  return buffer.toString(UTF8);
}

function encode(data: string) {
  let buffer = Buffer.from(data);
  return buffer.toString(BASE64);
}

export default {
  encode,
  decode,
}
