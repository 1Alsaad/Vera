import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const presentationData = req.body;

    // Generate a simple HTML preview
    const previewHtml = generatePreviewHtml(presentationData);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(previewHtml);
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ 
      message: 'Error generating preview', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generatePreviewHtml(presentationData: any): string {
  const slides = presentationData.slides.map((slide: any, index: number) => {
    const elements = slide.pageElements.map((element: any) => {
      if (element.shape && element.shape.text) {
        const content = element.shape.text.textElements[0].textRun.content;
        return `<div style="position: absolute; left: ${element.transform.translateX}pt; top: ${element.transform.translateY}pt; width: ${element.size.width.magnitude}pt; height: ${element.size.height.magnitude}pt;">
          <p>${content}</p>
        </div>`;
      }
      return '';
    }).join('');

    return `<div style="width: 1200px; height: 900px; border: 1px solid #ccc; position: relative; margin-bottom: 20px;">
      <h2>Slide ${index + 1}</h2>
      ${elements}
    </div>`;
  }).join('');

  return `
    <html>
      <head>
        <title>Presentation Preview</title>
        <style>
          body { font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>${presentationData.title}</h1>
        ${slides}
      </body>
    </html>
  `;
}
