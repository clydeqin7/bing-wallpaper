import fs from 'fs';
import path from 'path';

export function saveImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    axios({
      method: 'get',
      url,
      responseType: 'stream'
    }).then(response => {
      response.data.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).catch(err => {
      reject(err);
    });
  });
}