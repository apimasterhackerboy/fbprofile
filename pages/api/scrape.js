import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fburl } = req.query;

  if (!fburl) {
    return res.status(400).json({ error: 'Facebook URL is required' });
  }

  try {
    const response = await axios.get(fburl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const image = $('meta[property="og:image"]').attr('content');
    const title = $('meta[property="og:title"]').attr('content');

    if (!image) {
      return res.status(404).json({
        error: 'Profile picture not found. It might be private or blocked by Facebook.',
        credit: 'Tofazzal Hossain'
      });
    }

    res.status(200).json({
      image,
      title: title || 'Profile',
      credit: 'Tofazzal Hossain'
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile data. Please check the URL and try again.',
      credit: 'Tofazzal Hossain'
    });
  }
      }
