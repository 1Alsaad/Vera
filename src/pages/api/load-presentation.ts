import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid presentation ID' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './bayan-439322-63d21d2e2c0b.json',
      scopes: ['https://www.googleapis.com/auth/presentations.readonly'],
    });

    const slides = google.slides({ version: 'v1', auth });

    const presentation = await slides.presentations.get({ presentationId: id });

    // Transform the Google Slides data into our JSON format
    const transformedData = transformPresentationData(presentation.data);

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('Error loading presentation:', error);
    res.status(500).json({ 
      message: 'Error loading presentation', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function transformPresentationData(data: any) {
  // Implement the transformation logic here
  // This should convert the Google Slides format to our JSON format
  // You'll need to map the slides and their elements to match our structure
  // This is a placeholder and needs to be implemented based on your exact needs
  return {
    title: data.title,
    slides: data.slides.map((slide: any) => ({
      objectId: slide.objectId,
      pageType: 'SLIDE',
      pageElements: slide.pageElements.map((element: any) => ({
        // Transform each element based on its type
        // This is a simplified example
        shape: {
          shapeType: element.shape?.shapeType || 'RECTANGLE',
          text: element.shape?.text || { textElements: [{ textRun: { content: '' } }] }
        },
        size: element.size,
        transform: element.transform
      }))
    }))
  };
}
