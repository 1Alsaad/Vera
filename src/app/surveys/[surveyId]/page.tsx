'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating';
  options?: string[];
}

export default function SurveyPage() {
  const params = useParams();
  const surveyId = params?.surveyId as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<{[key: string]: string | number}>({});

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError) {
      console.error('Error fetching survey:', surveyError);
      toast({
        title: "Error",
        description: "Failed to load survey. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        text,
        type,
        question_options (
          id,
          text,
          order
        )
      `)
      .eq('survey_id', surveyId)
      .order('order');

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      toast({
        title: "Error",
        description: "Failed to load survey questions. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setSurvey({
      ...surveyData,
      questions: questionsData.map(q => ({
        ...q,
        options: q.question_options?.sort((a, b) => a.order - b.order).map(o => o.text)
      }))
    });
  };

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!survey) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: responseData, error: responseError } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: survey.id,
          respondent_id: user.id,
        })
        .select()
        .single();

      if (responseError) throw responseError;

      const answersToInsert = Object.entries(answers).map(([questionId, answer]) => ({
        response_id: responseData.id,
        question_id: questionId,
        answer_text: typeof answer === 'string' ? answer : answer.toString(),
      }));

      const { error: answersError } = await supabase
        .from('response_answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      toast({
        title: "Success",
        description: "Survey response submitted successfully!",
      });
    } catch (error) {
      console.error('Error submitting survey response:', error);
      toast({
        title: "Error",
        description: "Failed to submit survey response. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!survey) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{survey.title}</h1>
      <p className="mb-6">{survey.description}</p>

      {survey.questions.map((question) => (
        <Card key={question.id} className="mb-4">
          <CardHeader>
            <CardTitle>{question.text}</CardTitle>
          </CardHeader>
          <CardContent>
            {question.type === 'text' && (
              <Textarea
                placeholder="Your answer"
                value={answers[question.id] as string || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
            )}
            {question.type === 'multiple_choice' && question.options && (
              <div>
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="radio"
                      id={`${question.id}-${index}`}
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`${question.id}-${index}`}>{option}</label>
                  </div>
                ))}
              </div>
            )}
            {question.type === 'rating' && (
              <Input
                type="number"
                min="1"
                max="5"
                value={answers[question.id] as number || ''}
                onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                placeholder="Rate from 1 to 5"
              />
            )}
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSubmit}>Submit Survey</Button>
    </div>
  );
}