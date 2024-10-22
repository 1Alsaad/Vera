import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, ...presentationData } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid presentation ID' });
  }

  try {
    console.log('Updating presentation with ID:', id);
    console.log('Presentation data:', JSON.stringify(presentationData, null, 2));

    const auth = new google.auth.GoogleAuth({
      keyFile: './bayan-439322-63d21d2e2c0b.json', // Replace with your key file path
      scopes: ['https://www.googleapis.com/auth/presentations'],
    });

    const slides = google.slides({ version: 'v1', auth });

    // Check if the presentation exists
    let presentation;
    try {
      presentation = await slides.presentations.get({ presentationId: id });
      console.log('Fetched presentation:', JSON.stringify(presentation.data, null, 2));
    } catch (error) {
      console.error('Error fetching presentation:', error);
      return res.status(404).json({ message: 'Presentation not found' });
    }

    const requests = await transformToUpdateRequests(presentationData, id, presentation.data);

    console.log('Update requests:', JSON.stringify(requests, null, 2));

    if (requests.length === 0) {
      console.log('No update requests generated. Skipping update.');
      return res.status(200).json({
        message: 'No updates required',
        presentationId: id,
        presentationUrl: `https://docs.google.com/presentation/d/${id}/edit?usp=sharing`,
      });
    }

    const updateResponse = await slides.presentations.batchUpdate({
      presentationId: id,
      requestBody: {
        requests: requests,
      },
    });

    console.log('Update response:', JSON.stringify(updateResponse.data, null, 2));

    // Fetch the updated presentation to verify changes
    const updatedPresentation = await slides.presentations.get({ presentationId: id });
    console.log('Updated presentation:', JSON.stringify(updatedPresentation.data, null, 2));

    res.status(200).json({
      message: 'Presentation updated successfully',
      presentationId: id,
      presentationUrl: `https://docs.google.com/presentation/d/${id}/edit?usp=sharing`,
    });
  } catch (error) {
    console.error('Error updating presentation:', error);
    res.status(500).json({
      message: 'Error updating presentation',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack:
        process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.stack
            : undefined
          : undefined,
    });
  }
}

// Function to transform data to update requests
async function transformToUpdateRequests(data: any, presentationId: string, presentation: any) {
  console.log('Starting transformToUpdateRequests');
  const requests: any[] = [];
  const existingSlides = presentation.slides || [];

  console.log('Existing slides:', existingSlides.length);

  if (data.title) {
    requests.push({
      replaceAllText: {
        replaceText: data.title,
        containsText: { text: '{{TITLE}}' },
      },
    });
  }

  if (Array.isArray(data.slides)) {
    console.log('Processing slides:', data.slides.length);
    data.slides.forEach((slide: any, index: number) => {
      console.log(`Processing slide ${index}`);
      const existingSlide = existingSlides[index];
      
      if (!existingSlide) {
        console.log(`Creating new slide at index ${index}`);
        requests.push({
          createSlide: {
            insertionIndex: index,
            slideLayoutReference: { predefinedLayout: 'BLANK' },
          },
        });
      }

      const slideObjectId = existingSlide ? existingSlide.objectId : `slide_${index}`;

      // Find or create a text box for content
      let textBoxId = findOrCreateTextBox(requests, slideObjectId, existingSlide);

      if (slide.title || slide.content) {
        // Clear existing content in the text box
        requests.push({
          deleteText: {
            objectId: textBoxId,
            textRange: { type: 'ALL' }
          }
        });

        let insertionIndex = 0;

        if (slide.title) {
          console.log(`Updating title for slide ${index}`);
          requests.push({
            insertText: {
              objectId: textBoxId,
              text: slide.title + '\n',
              insertionIndex: insertionIndex,
            },
          });
          insertionIndex += slide.title.length + 1;
        }

        if (Array.isArray(slide.content)) {
          console.log(`Updating content for slide ${index}`);
          const contentText = slide.content.join('\n') + '\n';
          requests.push({
            insertText: {
              objectId: textBoxId,
              text: contentText,
              insertionIndex: insertionIndex,
            },
          });
        }
      }
    });
  }

  console.log('Generated requests:', requests.length);
  return requests;
}

function findOrCreateTextBox(requests: any[], slideObjectId: string, existingSlide: any): string {
  let textBoxId = '';

  if (existingSlide) {
    // Try to find an existing text box
    const textBox = existingSlide.pageElements.find((element: any) => 
      element.shape && element.shape.shapeType === 'TEXT_BOX'
    );
    if (textBox) {
      textBoxId = textBox.objectId;
    }
  }

  if (!textBoxId) {
    // Create a new text box if one doesn't exist
    textBoxId = `textbox_${slideObjectId}`;
    requests.push({
      createShape: {
        objectId: textBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: 720, unit: 'PT' },
            height: { magnitude: 540, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0,
            unit: 'PT'
          }
        }
      }
    });
  }

  return textBoxId;
}
