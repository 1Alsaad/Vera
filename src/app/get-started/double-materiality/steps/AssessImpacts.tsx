"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Impact {
  description: string
  type: string
  scale: number
  scope: number
  irremediability: number
  likelihood: number
}

// Mock data for impacts (in a real application, this would come from Step 3)
const initialImpacts: Record<string, Impact[]> = {
  "Climate Change": [
    { description: "Increased carbon emissions", type: "Negative", scale: 4, scope: 5, irremediability: 3, likelihood: 5 },
    { description: "Renewable energy adoption", type: "Positive", scale: 3, scope: 4, irremediability: 2, likelihood: 4 },
  ],
  "Pollution": [
    { description: "Water contamination", type: "Negative", scale: 5, scope: 3, irremediability: 4, likelihood: 3 },
  ],
  "Own Workforce": [
    { description: "Improved workplace safety", type: "Positive", scale: 3, scope: 2, irremediability: 1, likelihood: 5 },
    { description: "Skill gap due to automation", type: "Negative", scale: 2, scope: 3, irremediability: 2, likelihood: 4 },
  ],
  "Tax Policy": [
    { description: "Increased tax transparency", type: "Positive", scale: 2, scope: 4, irremediability: 1, likelihood: 5 },
  ],
}

export default function AssessImpacts() {
  const [impacts, setImpacts] = useState(initialImpacts)
  const [selectedTopic, setSelectedTopic] = useState(Object.keys(initialImpacts)[0])
  const [chartData, setChartData] = useState<{ topic: string; score: number }[]>([])

  const calculateImpactMaterialityScore = (impact: Impact) => {
    const { scale, scope, irremediability, likelihood } = impact
    return (scale + scope + irremediability) * likelihood
  }

  useEffect(() => {
    const newChartData = Object.entries(impacts).map(([topic, topicImpacts]) => ({
      topic,
      score: topicImpacts.reduce((sum, impact) => sum + calculateImpactMaterialityScore(impact), 0) / topicImpacts.length
    }))
    setChartData(newChartData)
  }, [impacts])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Assess Impacts</CardTitle>
        <CardDescription>Quantify the impacts identified in Step 3 and calculate overall impact materiality scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(impacts).map((topic) => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Impact Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scale (1-5)</TableHead>
                  <TableHead>Scope (1-5)</TableHead>
                  <TableHead>Irremediability (1-5)</TableHead>
                  <TableHead>Likelihood (1-5)</TableHead>
                  <TableHead>Impact Materiality Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impacts[selectedTopic].map((impact, index) => (
                  <TableRow key={index}>
                    <TableCell>{impact.description}</TableCell>
                    <TableCell>{impact.type}</TableCell>
                    <TableCell>{impact.scale}</TableCell>
                    <TableCell>{impact.scope}</TableCell>
                    <TableCell>{impact.irremediability}</TableCell>
                    <TableCell>{impact.likelihood}</TableCell>
                    <TableCell>{calculateImpactMaterialityScore(impact)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div>
            <h3 className="text-lg font-semibold mb-4">Impact Materiality Scores by Topic</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}