"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Slide {
  objectId: string;
  pageType: string;
  pageElements: any[];
}

export default function DesignPDF() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slideCount, setSlideCount] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentationUrl, setPresentationUrl] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [presentationId, setPresentationId] = useState<string | null>(null);

  const handleGenerateJson = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending request to generate JSON');
      const response = await fetch('/api/generate-presentation-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          description, 
          slideCount: slideCount ? parseInt(slideCount) : undefined 
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to generate presentation JSON');
      }

      if (responseData.rawContent) {
        setJsonText(responseData.rawContent);
        alert('The generated content could not be parsed as JSON. Please review and correct the JSON structure manually.');
      } else {
        setJsonText(JSON.stringify(responseData, null, 2));
        setSlides(responseData.slides);
      }

      console.log('Generated JSON:', responseData);
    } catch (error) {
      console.error('Error generating presentation JSON:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while generating the presentation JSON');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePresentation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let presentationData;
      try {
        presentationData = JSON.parse(jsonText);
      } catch (error) {
        throw new Error('Invalid JSON. Please check the JSON structure.');
      }

      console.log('Creating presentation with data:', presentationData);

      const createResponse = await fetch('/api/create-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presentationData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create presentation');
      }

      const result = await createResponse.json();
      console.log('Presentation created:', result);
      setPresentationUrl(result.presentationUrl);
      setPresentationId(result.presentationId);
    } catch (error) {
      console.error('Error creating presentation:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlideContentChange = (index: number, content: string) => {
    const newSlides = [...slides];
    const slide = newSlides[index];
    if (slide) {
      if (!slide.pageElements) {
        slide.pageElements = [];
      }
      if (!slide.pageElements[0]) {
        slide.pageElements[0] = { shape: {} };
      }
      if (!slide.pageElements[0].shape) {
        slide.pageElements[0].shape = {};
      }
      if (!slide.pageElements[0].shape.text) {
        slide.pageElements[0].shape.text = { textElements: [] };
      }
      if (!slide.pageElements[0].shape.text.textElements[0]) {
        slide.pageElements[0].shape.text.textElements[0] = { textRun: {} };
      }
      if (!slide.pageElements[0].shape.text.textElements[0].textRun) {
        slide.pageElements[0].shape.text.textElements[0].textRun = {};
      }
      slide.pageElements[0].shape.text.textElements[0].textRun.content = content;
      setSlides(newSlides);
      updateJsonText(newSlides);
    }
  };

  const updateJsonText = (newSlides: Slide[]) => {
    try {
      const currentJson = JSON.parse(jsonText);
      currentJson.slides = newSlides;
      setJsonText(JSON.stringify(currentJson, null, 2));
    } catch (error) {
      console.error('Error updating JSON text:', error);
    }
  };

  const handleJsonTextChange = (newJsonText: string) => {
    setJsonText(newJsonText);
    try {
      const parsedJson = JSON.parse(newJsonText);
      if (parsedJson.slides && Array.isArray(parsedJson.slides)) {
        setSlides(parsedJson.slides);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let presentationData;
      try {
        presentationData = JSON.parse(jsonText);
      } catch (error) {
        throw new Error('Invalid JSON. Please check the JSON structure.');
      }

      console.log('Generating preview for:', presentationData);

      const previewResponse = await fetch('/api/preview-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presentationData),
      });

      if (!previewResponse.ok) {
        const errorData = await previewResponse.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to generate preview');
      }

      const result = await previewResponse.text();
      setPreviewHtml(result);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPresentation = async () => {
    if (!presentationId) {
      setError('No presentation ID provided');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/load-presentation?id=${presentationId}`);
      if (!response.ok) {
        throw new Error('Failed to load presentation');
      }
      const data = await response.json();
      console.log('Loaded presentation data:', JSON.stringify(data, null, 2));
      setJsonText(JSON.stringify(data, null, 2));
      setSlides(data.slides);
      setTitle(data.title);
    } catch (error) {
      console.error('Error loading presentation:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePresentation = async () => {
    if (!presentationId) {
      setError('No presentation ID provided');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let presentationData = JSON.parse(jsonText);
      const updateResponse = await fetch('/api/update-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: presentationId, ...presentationData }),
      });
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to update presentation');
      }
      const result = await updateResponse.json();
      console.log('Presentation updated:', result);
      setPresentationUrl(result.presentationUrl);
    } catch (error) {
      console.error('Error updating presentation:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter the title of your presentation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter a description for your presentation"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slideCount">Number of Slides (Optional)</Label>
        <Input
          id="slideCount"
          type="number"
          min="3"
          value={slideCount}
          onChange={(e) => setSlideCount(e.target.value)}
          placeholder="Leave blank for AI to decide"
        />
      </div>
      <Button type="button" onClick={handleGenerateJson} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Presentation'}
      </Button>
      
      {slides.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Preview and Edit Slides</h2>
          {slides.map((slide, index) => (
            <div key={slide.objectId} className="border p-4 rounded">
              <h3 className="font-bold">Slide {index + 1}</h3>
              <Textarea
                value={
                  slide.pageElements &&
                  slide.pageElements[0] &&
                  slide.pageElements[0].shape &&
                  slide.pageElements[0].shape.text &&
                  slide.pageElements[0].shape.text.textElements &&
                  slide.pageElements[0].shape.text.textElements[0] &&
                  slide.pageElements[0].shape.text.textElements[0].textRun
                    ? slide.pageElements[0].shape.text.textElements[0].textRun.content
                    : ''
                }
                onChange={(e) => handleSlideContentChange(index, e.target.value)}
                rows={3}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="jsonEditor">Edit JSON</Label>
        <Textarea
          id="jsonEditor"
          value={jsonText}
          onChange={(e) => handleJsonTextChange(e.target.value)}
          rows={10}
          className="font-mono text-sm"
        />
      </div>

      <Button type="button" onClick={handlePreview} disabled={isLoading || jsonText.trim() === ''}>
        {isLoading ? 'Generating Preview...' : 'Preview Presentation'}
      </Button>

      {previewHtml && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Preview</h2>
          <iframe
            srcDoc={previewHtml}
            style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
            title="Presentation Preview"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="presentationId">Presentation ID (for editing)</Label>
        <Input
          id="presentationId"
          value={presentationId || ''}
          onChange={(e) => setPresentationId(e.target.value)}
          placeholder="Enter presentation ID to edit"
        />
      </div>

      <Button type="button" onClick={handleLoadPresentation} disabled={isLoading || !presentationId}>
        Load Presentation
      </Button>

      <Button type="button" onClick={handleCreatePresentation} disabled={isLoading || jsonText.trim() === ''}>
        {isLoading ? 'Creating...' : 'Create Presentation'}
      </Button>
      <Button type="button" onClick={handleUpdatePresentation} disabled={isLoading || !presentationId}>
        Update Presentation
      </Button>
      {error && <div className="text-red-500">{error}</div>}
      {presentationUrl && (
        <div>
          <p>Presentation created successfully!</p>
          <a href={presentationUrl} target="_blank" rel="noopener noreferrer">View Presentation</a>
        </div>
      )}
    </form>
  );
}
