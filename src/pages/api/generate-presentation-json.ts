import { NextApiRequest, NextApiResponse } from 'next';
import { CohereClient } from 'cohere-ai';

const cohereApiKey = process.env.NEXT_PUBLIC_COHERE_API_KEY;

if (!cohereApiKey) {
  console.error('Cohere API key is missing');
  process.exit(1);
}

const cohere = new CohereClient({
  token: cohereApiKey,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('Request body:', req.body);
    const { title, description, slideCount } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    console.log('Generating presentation JSON for:', { title, description, slideCount });

    const slideCountPrompt = slideCount ? `Create exactly ${slideCount} slides.` : 'Create an appropriate number of slides based on the content.';

    const prompt = `Create a JSON structure for a Google Slides presentation with the following details:
Title: ${title}
Description: ${description}
${slideCountPrompt}

Use the following schema as a guide for the JSON structure:

{
  "title": "Presentation Title",
  "pageSize": {
    "width": { "magnitude": 1200, "unit": "PT" },
    "height": { "magnitude": 900, "unit": "PT" }
  },
  "slides": [
    {
      "objectId": "slide1",
      "pageType": "SLIDE",
      "pageElements": [
        {
          "shape": {
            "shapeType": "TEXT_BOX",
            "text": {
              "textElements": [
                {
                  "textRun": {
                    "content": "Slide Title",
                    "style": {
                      "fontSize": { "magnitude": 24, "unit": "PT" },
                      "bold": true,
                      "color": { "rgbColor": { "red": 0.2, "green": 0.2, "blue": 0.2 } }
                    }
                  }
                }
              ]
            }
          },
          "size": {
            "width": { "magnitude": 300, "unit": "PT" },
            "height": { "magnitude": 50, "unit": "PT" }
          },
          "transform": {
            "scaleX": 1,
            "scaleY": 1,
            "translateX": 30,
            "translateY": 30,
            "unit": "PT"
          }
        }
      ]
    }
  ],
  "locale": "en"
}

Create a presentation with a title slide, content slides based on the description, and a conclusion slide. Be creative with layouts and use various shape types where appropriate. Only return the JSON structure, nothing else.`;

    console.log('Sending request to Cohere API');
    const response = await cohere.generate({
      model: 'command',
      prompt: prompt,
      temperature: 0.7,
      stopSequences: [],
      returnLikelihoods: 'NONE',
    });

    console.log('Cohere API response:', JSON.stringify(response, null, 2));

    if (!response.generations || response.generations.length === 0) {
      throw new Error('No content generated from Cohere API');
    }

    const generatedContent = response.generations[0].text.trim();

    console.log('Generated content:', generatedContent);

    let generatedJson;
    try {
      generatedJson = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(200).json({ 
        rawContent: generatedContent,
        error: 'Failed to parse generated content as JSON. Please check the rawContent and modify it to be valid JSON.'
      });
    }

    // Validate and transform the generated JSON
    const validatedJson = validateAndTransformJson(generatedJson);

    res.status(200).json(validatedJson);
  } catch (error) {
    console.error('Error generating presentation JSON:', error);
    res.status(500).json({ 
      message: 'Error generating presentation JSON', 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
}

function validateAndTransformJson(json: any): any {
  const validatedJson: any = {
    title: json.title || 'Untitled Presentation',
    pageSize: json.pageSize || { width: { magnitude: 1200, unit: 'PT' }, height: { magnitude: 900, unit: 'PT' } },
    slides: [],
    locale: json.locale || 'en'
  };

  if (!Array.isArray(json.slides)) {
    throw new Error('Invalid JSON structure: slides must be an array');
  }

  validatedJson.slides = json.slides.map((slide: any, index: number) => {
    if (typeof slide !== 'object' || !Array.isArray(slide.pageElements)) {
      throw new Error(`Invalid slide structure at index ${index}`);
    }

    return {
      objectId: slide.objectId || `slide_${index + 1}`,
      pageType: 'SLIDE',
      pageElements: slide.pageElements.map((element: any, elementIndex: number) => {
        if (typeof element !== 'object') {
          throw new Error(`Invalid page element at slide ${index}, element ${elementIndex}`);
        }

        // Ensure each element has a shape property with a valid shape type
        if (!element.shape || !element.shape.shapeType) {
          element.shape = { shapeType: 'RECTANGLE' };
        } else {
          // List of valid shape types (same as in create-presentation.ts)
          const validShapeTypes = [
            'TEXT_BOX', 'RECTANGLE', 'ROUND_RECTANGLE', 'ELLIPSE', 'ARC',
            // ... (include all the shape types listed above)
          ];
          if (!validShapeTypes.includes(element.shape.shapeType)) {
            element.shape.shapeType = 'RECTANGLE';
          }
        }

        // Ensure each shape has a text property
        if (!element.shape.text) {
          element.shape.text = { textElements: [{ textRun: { content: '' } }] };
        }

        // Ensure each element has size and transform properties
        if (!element.size) {
          element.size = { width: { magnitude: 300, unit: 'PT' }, height: { magnitude: 50, unit: 'PT' } };
        }
        if (!element.transform) {
          element.transform = { scaleX: 1, scaleY: 1, translateX: 30, translateY: 30, unit: 'PT' };
        }

        return element;
      })
    };
  });

  return validatedJson;
}
