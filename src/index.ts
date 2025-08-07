import { getBingWallpaper } from './bing';
import * as dotenv from 'dotenv';
import { getMdFilePath } from './utils/file';
import { saveWallpaperInfo } from './services/storage';
import { updateMarkdownFile } from './services/markdown';
dotenv.config();

async function downloadWallpaper() {
  try {
    const wallpaper = await getBingWallpaper();
    const date = wallpaper.date;

    // 保存图片信息到每月的JSON文件，并检查是否更新成功
    const isUpdated = await saveWallpaperInfo(date, wallpaper); // Call to service

    if (!isUpdated) {
      console.log(`No new wallpaper info for ${date}. Skipping Markdown file update.`);
      return;
    }

    const mdFilePath = getMdFilePath(date); // Call to utility
    await updateMarkdownFile(mdFilePath); // Call to service
    console.log(`Wallpaper for ${date} added to Markdown file successfully.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error downloading wallpaper: ${error.message}`);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

downloadWallpaper();
