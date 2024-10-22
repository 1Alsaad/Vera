import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Slide {
  title?: string;
  content?: string[];
}

interface PresentationData {
  title: string;
  slides: Slide[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const presentationData: PresentationData = req.body;

  if (!presentationData.title || typeof presentationData.title !== 'string') {
    return res.status(400).json({ message: 'Invalid title' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './bayan-439322-63d21d2e2c0b.json', // Path to your service account key file
      scopes: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const slides = google.slides({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    const presentation = await slides.presentations.create({
      requestBody: {
        title: presentationData.title,
      },
    });

    const presentationId = presentation.data.presentationId;

    if (!presentationId) {
      throw new Error('Failed to create presentation');
    }

    const requests = createSlideRequests(presentationData);

    await slides.presentations.batchUpdate({
      presentationId: presentationId,
      requestBody: {
        requests: requests
      }
    });

    // Share the presentation with your Google account
    await drive.permissions.create({
      fileId: presentationId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: 'Moh4mm4d.alsaad@gmail.com', // Replace with your Google account email
      },
    });

    res.status(200).json({
      message: 'Presentation created, populated, and shared successfully',
      presentationId: presentationId,
      presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit?usp=sharing`,
    });
  } catch (error) {
    console.error('Error creating, populating, or sharing presentation:', error);
    res.status(500).json({
      message: 'Error creating, populating, or sharing presentation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function createSlideRequests(presentationData: PresentationData): any[] {
  const requests: any[] = [
    {
      createSlide: {
        objectId: 'titleSlide',
        insertionIndex: 0,
        slideLayoutReference: {
          predefinedLayout: 'TITLE'
        }
      }
    },
    {
      createShape: {
        objectId: 'titleTextBox',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: 'titleSlide',
          size: {
            width: { magnitude: 720, unit: 'PT' },
            height: { magnitude: 100, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 50,
            unit: 'PT'
          }
        }
      }
    },
    {
      insertText: {
        objectId: 'titleTextBox',
        insertionIndex: 0,
        text: presentationData.title
      }
    }
  ];

  // Add content slides
  presentationData.slides.forEach((slide, index) => {
    const slideId = `slide_${index + 1}`;
    const textBoxId = `textBox_${index + 1}`;

    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: index + 1,
        slideLayoutReference: {
          predefinedLayout: 'BLANK'
        }
      }
    });

    requests.push({
      createShape: {
        objectId: textBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 720, unit: 'PT' },
            height: { magnitude: 540, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 50,
            unit: 'PT'
          }
        }
      }
    });

    let text = '';
    if (slide.title) {
      text += slide.title + '\n\n';
    }
    if (slide.content) {
      text += slide.content.join('\n');
    }

    if (text) {
      requests.push({
        insertText: {
          objectId: textBoxId,
          insertionIndex: 0,
          text: text
        }
      });
    }
  });

  return requests;
}
