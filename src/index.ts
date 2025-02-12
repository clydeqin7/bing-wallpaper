import { getBingWallpaper } from './bing';
import { saveImage } from './utils';
import { promises as fsPromises } from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

async function downloadWallpaper() {
  try {
    const wallpaper = await getBingWallpaper();
    const filePath = getFilePath(wallpaper.date);
    if (await fileExists(filePath)) {
      console.log(`Wallpaper for ${wallpaper.date} already exists.`);
      return;
    }
    await saveImage(wallpaper.url, filePath);
    console.log(`Wallpaper for ${wallpaper.date} downloaded successfully.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error downloading wallpaper: ${error.message}`);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

function getFilePath(date: string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  const wallpapersPath = process.env.WALLPAPERS_PATH || '../public/wallpapers';
  const yearFolderPath = path.resolve(__dirname, wallpapersPath, `${year}`);
  const monthFolderPath = path.join(yearFolderPath, `${month}`);
  return path.join(monthFolderPath, `${formattedDate}.jpg`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createDirectoryIfNotExists(dirPath: string): Promise<void> {
  try {
    await fsPromises.access(dirPath);
  } catch {
    await fsPromises.mkdir(dirPath, { recursive: true });
  }
}

downloadWallpaper();