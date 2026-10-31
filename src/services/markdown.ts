import { fileExists, readJsonFile, writeFileAtomic } from '../utils/file';
import { formatDate } from '../utils/date';
import { WallpaperMap } from '../types';
import { markdownTable } from 'markdown-table';

/**
 * 根据月度 JSON 重新生成整月 Markdown（幂等，每次覆盖写入）
 * @param mdFilePath Markdown 文件路径
 */
export async function updateMarkdownFile(mdFilePath: string): Promise<void> {
  // 从 JSON 文件路径中提取年份和月份
  const jsonFilePath = mdFilePath.replace(/\.md$/, '.json');
  if (!(await fileExists(jsonFilePath))) {
    console.log(`No wallpaper info file found at ${jsonFilePath}. Skipping update.`);
    return;
  }

  // 读取每月的壁纸信息文件（损坏时返回空对象，保留原有 Markdown 不动）
  const wallpapersInfo = await readJsonFile<WallpaperMap>(jsonFilePath, {});

  // 按日期排序（降序）
  const sortedDates = Object.keys(wallpapersInfo).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  if (sortedDates.length === 0) {
    console.warn(`No wallpaper entries in ${jsonFilePath}. Keeping existing Markdown.`);
    return;
  }

  // 获取最新日期（即第一个条目）
  const latestDate = sortedDates[0];
  const latestWallpaper = wallpapersInfo[latestDate];
  const formattedDate = formatDate(latestDate);

  // 生成 Markdown 文件内容
  let content = '';

  // 添加最新壁纸信息
  content += `## Bing Wallpaper (${formattedDate})\n![Wallpaper](${latestWallpaper.url}&w=1024) **Today**: ${latestWallpaper.copyright}\n\n`;

  // 构建表格数据
  const tableData = [
    ['Date', 'Image', 'Download Links', 'Copyright'],
    ...sortedDates.map((fullDate) => {
      const wallpaper = wallpapersInfo[fullDate];
      return [
        formatDate(fullDate),
        `![Thumbnail](${wallpaper.url}&w=384&h=216)`,
        `[2K](${wallpaper.url}&w=2560&h=1440) [4K](${wallpaper.url}&w=3840&h=2160)`,
        wallpaper.copyright,
      ];
    }),
  ];
  content += markdownTable(tableData, { align: ['c', 'c', 'c', 'l'] });
  content += '\n';

  // 原子写入 Markdown 文件
  await writeFileAtomic(mdFilePath, content);
  console.log(`Updated Markdown file at ${mdFilePath}`);
}
