import path from 'path';
import fs from 'fs';
//import base64 from './base64';
import md5 from './md5';

const dir = path.join(__dirname, '..', 'cache');

const encode = md5; // base64.encode

async function set(key: string, val: any) {
  const content = JSON.stringify(val);
  const keyEncoded = encode(key);
  const filepath = path.join(dir, keyEncoded + '.json');
  return fs.promises.writeFile(filepath, content);
}

async function get(key: string): Promise<any> {
  const keyEncoded = encode(key);
  const filepath = path.join(dir, keyEncoded + '.json');
  let result: any = null, content;
  try {
    const buffer = await fs.promises.readFile(filepath);
    content = buffer.toString();
  } catch (readErr) {
    console.error('FileCache readErr', readErr.message);
  }
  try {
    if (content) {
      result = JSON.parse(content.toString());
    }
  } catch (parseErr) {
    console.error('FileCache parseErr', parseErr.message);
  }
  return result;
}

async function del(key: string) {
  const keyEncoded = encode(key);
  const filepath = path.join(dir, keyEncoded + '.json');
  return fs.promises.unlink(filepath,);
}

// TODO: use config
export default function newFileCache() {
  return {
    set,
    get,
    del,
  };
}
