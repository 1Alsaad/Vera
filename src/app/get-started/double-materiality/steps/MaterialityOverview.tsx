"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

interface MaterialityData {
  topic: string
  impactScore: number
  financialScore: number
  justification: string
  esrsDisclosure: string
}

// Mock data for materiality assessment results
const materialityData: MaterialityData[] = [
  { topic: "Climate Change", impactScore: 18, financialScore: 20, justification: "High impact on environment and significant financial risks/opportunities", esrsDisclosure: "E1" },
  { topic: "Pollution", impactScore: 15, financialScore: 12, justification: "Moderate impact and financial implications", esrsDisclosure: "E2" },
  { topic: "Own Workforce", impactScore: 10, financialScore: 8, justification: "Important for operations but lower overall materiality", esrsDisclosure: "S1" },
  { topic: "Tax Policy", impactScore: 5, financialScore: 15, justification: "Low impact but high financial relevance", esrsDisclosure: "G1" },
  { topic: "Biodiversity", impactScore: 12, financialScore: 6, justification: "Moderate impact but lower financial materiality", esrsDisclosure: "E4" },
]

export default function MaterialityOverview() {
  const [visualizationType, setVisualizationType] = useState<"matrix" | "table">("matrix")

  const determineOverallMateriality = (impactScore: number, financialScore: number): string => {
    const totalScore = impactScore + financialScore
    if (totalScore >= 30) return "High"
    if (totalScore >= 20) return "Medium"
    return "Low"
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Materiality Overview</CardTitle>
        <CardDescription>Consolidated view of the materiality assessment results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Select value={visualizationType} onValueChange={(value: "matrix" | "table") => setVisualizationType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select visualization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matrix">Materiality Matrix</SelectItem>
                <SelectItem value="table">Materiality Table</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visualizationType === "matrix" ? (
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="impactScore" name="Impact Score" unit="" domain={[0, 25]} />
                  <YAxis type="number" dataKey="financialScore" name="Financial Score" unit="" domain={[0, 25]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Materiality" data={materialityData} fill="#8884d8">
                    {materialityData.map((entry, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <circle cx={entry.impactScore} cy={entry.financialScore} r={5} fill="#8884d8" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-bold">{entry.topic}</p>
                            <p>Impact Score: {entry.impactScore}</p>
                            <p>Financial Score: {entry.financialScore}</p>
                            <p>Overall Materiality: {determineOverallMateriality(entry.impactScore, entry.financialScore)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ScrollArea className="h-[500px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Impact Score</TableHead>
                    <TableHead>Financial Score</TableHead>
                    <TableHead>Overall Materiality</TableHead>
                    <TableHead>Justification</TableHead>
                    <TableHead>ESRS Disclosure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialityData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.topic}</TableCell>
                      <TableCell>{item.impactScore}</TableCell>
                      <TableCell>{item.financialScore}</TableCell>
                      <TableCell>{determineOverallMateriality(item.impactScore, item.financialScore)}</TableCell>
                      <TableCell>{item.justification}</TableCell>
                      <TableCell>{item.esrsDisclosure}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
}