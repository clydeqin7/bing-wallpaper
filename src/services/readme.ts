import { promises as fsPromises } from 'fs';
import path from 'path';
import { formatDate } from '../utils/date';

// 读取最新壁纸信息（假设 2025-08.md/json 为最新，可根据实际逻辑动态获取）
async function getLatestWallpaperInfo(): Promise<{
  date: string;
  url: string;
  copyright: string;
}> {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const jsonPath = path.resolve(process.cwd(), `public/wallpapers/${year}/${year}-${month}.json`);
  const infoContent = await fsPromises.readFile(jsonPath, 'utf-8');
  const wallpapersInfo = JSON.parse(infoContent);
  // 取最新日期
  const sortedDates = Object.keys(wallpapersInfo).sort((a, b) => parseInt(b) - parseInt(a));
  const latestDate = sortedDates[0];
  const latest = wallpapersInfo[latestDate];
  return {
    date: formatDate(latestDate),
    url: latest.url,
    copyright: latest.copyright,
  };
}

// 生成年度-月份归档
async function getArchiveLinks(): Promise<string> {
  const wallpapersDir = path.resolve(process.cwd(), 'public/wallpapers');
  const years = await fsPromises.readdir(wallpapersDir);
  let archive = '';
  for (const year of years.sort().reverse()) {
    const yearDir = path.join(wallpapersDir, year);
    if (!(await fsPromises.stat(yearDir)).isDirectory()) continue;
    const months = (await fsPromises.readdir(yearDir))
      .filter(f => f.endsWith('.md'))
      .sort();
    if (months.length === 0) continue;
    archive += `- ${year}\n`;
    for (const m of months) {
      archive += `  - [${m.replace('.md', '')}](public/wallpapers/${year}/${m})\n`;
    }
  }
  return archive;
}

export async function generateReadme() {
  const latest = await getLatestWallpaperInfo();
  const archive = await getArchiveLinks();
  const content = `# Bing Wallpaper 今日壁纸\n\n> 自动抓取并归档 Bing 每日壁纸\n\n## 今日壁纸 (${latest.date})\n\n![Wallpaper](${latest.url}&w=1024)\n\n${latest.copyright}\n\n---\n\n## 年度归档\n\n${archive}\n> 更多壁纸请在 public/wallpapers/ 目录下查看\n`;
  await fsPromises.writeFile(path.resolve(process.cwd(), 'README.md'), content, 'utf-8');
  console.log('README.md updated');
}

// 你可以在主入口调用 generateReadme()
// generateReadme();
