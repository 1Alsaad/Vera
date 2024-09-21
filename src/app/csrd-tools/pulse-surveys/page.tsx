'use client'

import React, { useState } from 'react';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from '@/hooks/use-toast';
import ShimmerButton from "@/components/magicui/shimmer-button";

interface Question {
  id: number;
  text: string;
  type: 'text' | 'radio' | 'slider';
  options?: string[];
}

const seedQuestions: Question[] = [
  { id: 1, text: "How satisfied are you with the company's sustainability efforts?", type: 'slider' },
  { id: 2, text: "What area of sustainability should we focus on most?", type: 'radio', options: ['Climate Change', 'Biodiversity', 'Circular Economy', 'Social Responsibility'] },
  { id: 3, text: "Describe a sustainability initiative you'd like to see implemented.", type: 'text' },
];

const PulseSurveys: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, string | number>>({});

  const handleAnswerChange = (questionId: number, answer: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(answers);
    toast({ title: "Survey Submitted", description: "Thank you for your feedback!" });
    setAnswers({});
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <Textarea
            value={answers[question.id] as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="mt-2"
          />
        );
      case 'radio':
        return (
          <RadioGroup
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            value={answers[question.id] as string}
            className="mt-2"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'slider':
        return (
          <Slider
            onValueChange={(value) => handleAnswerChange(question.id, value[0])}
            value={[answers[question.id] as number || 0]}
            max={100}
            step={1}
            className="mt-2"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sustainability Pulse Survey</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {seedQuestions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-lg font-medium">{question.text}</Label>
                  {renderQuestion(question)}
                </div>
              ))}
              <ShimmerButton onClick={handleSubmit} className="w-full">
                Submit Survey
              </ShimmerButton>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PulseSurveys;