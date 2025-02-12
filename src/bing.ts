import axios from 'axios';

interface BingWallpaper {
  url: string;
  copyright: string;
  date: string;
}

export async function getBingWallpaper(): Promise<BingWallpaper> {
  const url = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US';
  const response = await axios.get(url);
  const data = response.data.images[0];
  return {
    url: `https://cn.bing.com${data.url}`,
    copyright: data.copyright,
    date: data.enddate
  };
}