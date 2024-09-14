'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Question = {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating';
  options?: string[];
};

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'multiple_choice' | 'rating'>('text');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');

  const addQuestion = () => {
    if (!newQuestionText) return;
    const newQuestion: Question = {
      id: uuidv4(),
      text: newQuestionText,
      type: newQuestionType,
      options: newQuestionType === 'multiple_choice' ? newQuestionOptions.split(',').map(o => o.trim()) : undefined,
    };
    setQuestions([...questions, newQuestion]);
    setNewQuestionText('');
    setNewQuestionType('text');
    setNewQuestionOptions('');
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const createSurvey = async () => {
    if (!title || questions.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a title and at least one question.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get the company_id for the current user
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('company')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Insert the survey
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          company: userData.company, // Change this line
          title,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      // Insert questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .insert(
          questions.map((q, index) => ({
            survey_id: surveyData.id,
            text: q.text,
            type: q.type,
            order: index + 1,
          }))
        )
        .select();

      if (questionsError) throw questionsError;

      // Insert options for multiple choice questions
      const multipleChoiceQuestions = questions.filter(q => q.type === 'multiple_choice' && q.options);
      if (multipleChoiceQuestions.length > 0) {
        const optionsToInsert = multipleChoiceQuestions.flatMap(q => {
          const insertedQuestion = questionsData.find(iq => iq.text === q.text);
          if (!insertedQuestion) {
            throw new Error(`Question not found: ${q.text}`);
          }
          return q.options!.map((optionText, index) => ({
            question_id: insertedQuestion.id,
            text: optionText,
            order: index + 1,
          }));
        });

        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      }

      toast({
        title: "Success",
        description: "Survey created successfully!",
      });

      router.push(`/surveys/${surveyData.id}`);
    } catch (error) {
      console.error('Error creating survey:', error);
      toast({
        title: "Error",
        description: "Failed to create survey. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Survey</h1>
      
      <Input
        placeholder="Survey Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />
      
      <Textarea
        placeholder="Survey Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4"
      />
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Questions</h2>
        {questions.map((q, index) => (
          <div key={q.id} className="mb-2 p-2 border rounded">
            <p><strong>{index + 1}. {q.text}</strong> ({q.type})</p>
            {q.options && <p>Options: {q.options.join(', ')}</p>}
            <Button variant="destructive" size="sm" onClick={() => removeQuestion(q.id)}>Remove</Button>
          </div>
        ))}
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="New Question"
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          className="mb-2"
        />
        <Select value={newQuestionType} onValueChange={(value: 'text' | 'multiple_choice' | 'rating') => setNewQuestionType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Question Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
        {newQuestionType === 'multiple_choice' && (
          <Input
            placeholder="Options (comma-separated)"
            value={newQuestionOptions}
            onChange={(e) => setNewQuestionOptions(e.target.value)}
            className="mt-2"
          />
        )}
        <Button onClick={addQuestion} className="mt-2">Add Question</Button>
      </div>
      
      <Button onClick={createSurvey}>Create Survey</Button>
    </div>
  );
}