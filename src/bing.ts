import axios from 'axios';
import { BingWallpaper } from '@/types';

export async function getBingWallpaper(): Promise<BingWallpaper> {
  const url = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN';
  const response = await axios.get(url);
  const data = response.data.images[0];
  let originalUrl = data.url;
  // 替换分辨率部分
  let tempUrl = originalUrl.replace(/_1920x1080\.jpg/, '_UHD.jpg');

  // 移除多余的参数
  let finalUrl = tempUrl.replace(/&rf=LaDigue_1920x1080\.jpg&pid=hp/, '');
  return {
    url: `https://cn.bing.com${finalUrl}`,
    copyright: data.copyright,
    date: data.enddate,
  };
}
