import { getBingWallpaper } from './bing';
import * as dotenv from 'dotenv';
import { getMdFilePath } from './utils/file';
import { saveWallpaperInfo } from './services/storage';
import { updateMarkdownFile } from './services/markdown';
import { generateReadme } from './services/readme';

dotenv.config();

async function main(): Promise<void> {
  const wallpaper = await getBingWallpaper();
  const date = wallpaper.date;

  // 保存图片信息到每月的 JSON 文件
  const isNew = await saveWallpaperInfo(date, wallpaper);

  // 无论是否新增，都重新生成派生文件（月度 Markdown、README），
  // 使它们始终与 JSON 数据一致；有无实际改动交给 git 判断
  const mdFilePath = getMdFilePath(date);
  await updateMarkdownFile(mdFilePath);
  await generateReadme();

  console.log(
    isNew
      ? `Wallpaper for ${date} added successfully.`
      : `Wallpaper for ${date} already archived; derived files refreshed.`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error updating wallpaper: ${message}`);
  // 让 CI 感知失败，而不是静默成功
  process.exitCode = 1;
});
