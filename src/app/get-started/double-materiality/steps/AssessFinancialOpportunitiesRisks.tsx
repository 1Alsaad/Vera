"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface FinancialAssessment {
  description: string
  type: "Risk" | "Opportunity"
  likelihood: number
  magnitude: number
}

// Mock data for financial assessments (in a real application, this would come from Step 3)
const initialFinancialAssessments: Record<string, FinancialAssessment[]> = {
  "Climate Change": [
    { description: "Carbon tax implementation", type: "Risk", likelihood: 4, magnitude: 5 },
    { description: "Green technology investments", type: "Opportunity", likelihood: 3, magnitude: 4 },
  ],
  "Pollution": [
    { description: "Environmental fines", type: "Risk", likelihood: 3, magnitude: 4 },
    { description: "Waste reduction initiatives", type: "Opportunity", likelihood: 4, magnitude: 3 },
  ],
  "Own Workforce": [
    { description: "Increased healthcare costs", type: "Risk", likelihood: 3, magnitude: 2 },
    { description: "Productivity gains from upskilling", type: "Opportunity", likelihood: 4, magnitude: 3 },
  ],
  "Tax Policy": [
    { description: "Changes in corporate tax rates", type: "Risk", likelihood: 2, magnitude: 5 },
    { description: "Tax incentives for sustainability", type: "Opportunity", likelihood: 3, magnitude: 4 },
  ],
}

export default function AssessFinancialOpportunitiesRisks() {
  const [financialAssessments, setFinancialAssessments] = useState(initialFinancialAssessments)
  const [selectedTopic, setSelectedTopic] = useState(Object.keys(initialFinancialAssessments)[0])
  const [riskThreshold, setRiskThreshold] = useState(15)
  const [opportunityThreshold, setOpportunityThreshold] = useState(15)
  const [chartData, setChartData] = useState<{ topic: string; riskScore: number; opportunityScore: number }[]>([])

  const calculateFinancialScore = (assessment: FinancialAssessment) => {
    return assessment.likelihood * assessment.magnitude
  }

  useEffect(() => {
    const newChartData = Object.entries(financialAssessments).map(([topic, assessments]) => {
      const riskScore = assessments
        .filter(a => a.type === "Risk")
        .reduce((sum, a) => sum + calculateFinancialScore(a), 0)
      const opportunityScore = assessments
        .filter(a => a.type === "Opportunity")
        .reduce((sum, a) => sum + calculateFinancialScore(a), 0)
      return { topic, riskScore, opportunityScore }
    })
    setChartData(newChartData)
  }, [financialAssessments])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Assess Financial Opportunities and Risks</CardTitle>
        <CardDescription>Quantify the likelihood and magnitude of financial effects for each topic</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="topic-select">Select Topic</Label>
              <Select id="topic-select" value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(financialAssessments).map((topic) => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="risk-threshold">Risk Threshold</Label>
              <Input
                id="risk-threshold"
                type="number"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                min={1}
                max={25}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="opportunity-threshold">Opportunity Threshold</Label>
              <Input
                id="opportunity-threshold"
                type="number"
                value={opportunityThreshold}
                onChange={(e) => setOpportunityThreshold(Number(e.target.value))}
                min={1}
                max={25}
              />
            </div>
          </div>
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Likelihood (1-5)</TableHead>
                  <TableHead>Magnitude (1-5)</TableHead>
                  <TableHead>Financial Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialAssessments[selectedTopic].map((assessment, index) => (
                  <TableRow key={index}>
                    <TableCell>{assessment.description}</TableCell>
                    <TableCell>{assessment.type}</TableCell>
                    <TableCell>{assessment.likelihood}</TableCell>
                    <TableCell>{assessment.magnitude}</TableCell>
                    <TableCell>{calculateFinancialScore(assessment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div>
            <h3 className="text-lg font-semibold mb-4">Financial Risk and Opportunity Scores by Topic</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="riskScore" fill="#ff8042" name="Risk Score" />
                <Bar dataKey="opportunityScore" fill="#82ca9d" name="Opportunity Score" />
                <ReferenceLine y={riskThreshold} stroke="red" strokeDasharray="3 3" />
                <ReferenceLine y={opportunityThreshold} stroke="green" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}