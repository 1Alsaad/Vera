'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function SurveyResultsPage() {
  // This would typically come from your backend
  const surveyData = {
    title: "Employee Satisfaction 2023",
    totalResponses: 45,
    questions: [
      {
        text: "How satisfied are you with your current role?",
        type: "likert-scale",
        responses: [
          { label: "Very Dissatisfied", count: 2 },
          { label: "Dissatisfied", count: 5 },
          { label: "Neutral", count: 10 },
          { label: "Satisfied", count: 20 },
          { label: "Very Satisfied", count: 8 },
        ]
      },
      {
        text: "What area do you think the company should focus on improving?",
        type: "multiple-choice",
        responses: [
          { label: "Work-Life Balance", count: 15 },
          { label: "Professional Development", count: 12 },
          { label: "Company Culture", count: 8 },
          { label: "Compensation and Benefits", count: 10 },
        ]
      },
      {
        text: "Any additional comments or suggestions?",
        type: "open-ended",
        responses: [
          "More flexible working hours would be great.",
          "I'd like to see more opportunities for career growth.",
          "The recent team building activities have been fantastic!",
        ]
      }
    ]
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{surveyData.title} - Results</CardTitle>
          <CardDescription>Total Responses: {surveyData.totalResponses}</CardDescription>
        </CardHeader>
        <CardContent>
          {surveyData.questions.map((question, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
              {question.type === 'likert-scale' || question.type === 'multiple-choice' ? (
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={question.responses}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Responses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {question.responses.map((response, i) => (
                      <TableRow key={i}>
                        <TableCell>{response}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}