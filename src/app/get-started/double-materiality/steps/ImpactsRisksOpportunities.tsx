"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"

interface Topic {
  id: number
  name: string
}

interface Impact {
  description: string
  type: "Positive" | "Negative"
  affectedStakeholder: string
  valueChainStage: "Upstream" | "Own operations" | "Downstream"
  timeHorizon: "Short-term" | "Medium-term" | "Long-term"
}

interface Risk {
  description: string
  likelihood: "Low" | "Medium" | "High"
  severity: "Low" | "Medium" | "High"
  valueChainStage: "Upstream" | "Own operations" | "Downstream"
  timeHorizon: "Short-term" | "Medium-term" | "Long-term"
}

interface Opportunity {
  description: string
  likelihood: "Low" | "Medium" | "High"
  potentialBenefit: "Low" | "Medium" | "High"
  valueChainStage: "Upstream" | "Own operations" | "Downstream"
  timeHorizon: "Short-term" | "Medium-term" | "Long-term"
}

// Mock data for topics (this would come from the previous step in a real application)
const topics: Topic[] = [
  { id: 1, name: "Climate change" },
  { id: 2, name: "Water management" },
  { id: 3, name: "Biodiversity" },
  { id: 4, name: "Human rights" },
]

export default function ImpactsRisksOpportunities() {
  const [selectedTopic, setSelectedTopic] = useState<Topic>(topics[0])
  const [impacts, setImpacts] = useState<Impact[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])

  const addImpact = () => {
    setImpacts([...impacts, {
      description: "",
      type: "Positive",
      affectedStakeholder: "",
      valueChainStage: "Own operations",
      timeHorizon: "Short-term"
    }])
  }

  const updateImpact = (index: number, field: keyof Impact, value: string) => {
    const newImpacts = [...impacts]
    newImpacts[index] = { ...newImpacts[index], [field]: value }
    setImpacts(newImpacts)
  }

  const addRisk = () => {
    setRisks([...risks, {
      description: "",
      likelihood: "Medium",
      severity: "Medium",
      valueChainStage: "Own operations",
      timeHorizon: "Short-term"
    }])
  }

  const updateRisk = (index: number, field: keyof Risk, value: string) => {
    const newRisks = [...risks]
    newRisks[index] = { ...newRisks[index], [field]: value }
    setRisks(newRisks)
  }

  const addOpportunity = () => {
    setOpportunities([...opportunities, {
      description: "",
      likelihood: "Medium",
      potentialBenefit: "Medium",
      valueChainStage: "Own operations",
      timeHorizon: "Short-term"
    }])
  }

  const updateOpportunity = (index: number, field: keyof Opportunity, value: string) => {
    const newOpportunities = [...opportunities]
    newOpportunities[index] = { ...newOpportunities[index], [field]: value }
    setOpportunities(newOpportunities)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Define Impacts, Risks, and Opportunities</CardTitle>
        <CardDescription>Analyze the effects, risks, and opportunities for each potentially material topic</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="topic-select">Select Topic</Label>
            <Select
              value={selectedTopic.id.toString()}
              onValueChange={(value) => setSelectedTopic(topics.find(t => t.id.toString() === value) || topics[0])}
            >
              <SelectTrigger id="topic-select">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id.toString()}>{topic.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="impacts">
            <TabsList>
              <TabsTrigger value="impacts">Impacts</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>
            <TabsContent value="impacts">
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Affected Stakeholder</TableHead>
                      <TableHead>Value Chain Stage</TableHead>
                      <TableHead>Time Horizon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {impacts.map((impact, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Textarea
                            value={impact.description}
                            onChange={(e) => updateImpact(index, "description", e.target.value)}
                            placeholder="Describe the impact..."
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={impact.type}
                            onValueChange={(value: "Positive" | "Negative") => updateImpact(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Positive">Positive</SelectItem>
                              <SelectItem value="Negative">Negative</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={impact.affectedStakeholder}
                            onChange={(e) => updateImpact(index, "affectedStakeholder", e.target.value)}
                            placeholder="e.g., Local communities"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={impact.valueChainStage}
                            onValueChange={(value: "Upstream" | "Own operations" | "Downstream") => updateImpact(index, "valueChainStage", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upstream">Upstream</SelectItem>
                              <SelectItem value="Own operations">Own operations</SelectItem>
                              <SelectItem value="Downstream">Downstream</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={impact.timeHorizon}
                            onValueChange={(value: "Short-term" | "Medium-term" | "Long-term") => updateImpact(index, "timeHorizon", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Short-term">Short-term</SelectItem>
                              <SelectItem value="Medium-term">Medium-term</SelectItem>
                              <SelectItem value="Long-term">Long-term</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <Button onClick={addImpact} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Impact
              </Button>
            </TabsContent>
            <TabsContent value="risks">
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Likelihood</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Value Chain Stage</TableHead>
                      <TableHead>Time Horizon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risks.map((risk, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Textarea
                            value={risk.description}
                            onChange={(e) => updateRisk(index, "description", e.target.value)}
                            placeholder="Describe the risk..."
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={risk.likelihood}
                            onValueChange={(value: "Low" | "Medium" | "High") => updateRisk(index, "likelihood", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={risk.severity}
                            onValueChange={(value: "Low" | "Medium" | "High") => updateRisk(index, "severity", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={risk.valueChainStage}
                            onValueChange={(value: "Upstream" | "Own operations" | "Downstream") => updateRisk(index, "valueChainStage", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upstream">Upstream</SelectItem>
                              <SelectItem value="Own operations">Own operations</SelectItem>
                              <SelectItem value="Downstream">Downstream</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={risk.timeHorizon}
                            onValueChange={(value: "Short-term" | "Medium-term" | "Long-term") => updateRisk(index, "timeHorizon", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Short-term">Short-term</SelectItem>
                              <SelectItem value="Medium-term">Medium-term</SelectItem>
                              <SelectItem value="Long-term">Long-term</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <Button onClick={addRisk} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Risk
              </Button>
            </TabsContent>
            <TabsContent value="opportunities">
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Likelihood</TableHead>
                      <TableHead>Potential Benefit</TableHead>
                      <TableHead>Value Chain Stage</TableHead>
                      <TableHead>Time Horizon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((opportunity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Textarea
                            value={opportunity.description}
                            onChange={(e) => updateOpportunity(index, "description", e.target.value)}
                            placeholder="Describe the opportunity..."
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={opportunity.likelihood}
                            onValueChange={(value: "Low" | "Medium" | "High") => updateOpportunity(index, "likelihood", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={opportunity.potentialBenefit}
                            onValueChange={(value: "Low" | "Medium" | "High") => updateOpportunity(index, "potentialBenefit", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={opportunity.valueChainStage}
                            onValueChange={(value: "Upstream" | "Own operations" | "Downstream") => updateOpportunity(index, "valueChainStage", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upstream">Upstream</SelectItem>
                              <SelectItem value="Own operations">Own operations</SelectItem>
                              <SelectItem value="Downstream">Downstream</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={opportunity.timeHorizon}
                            onValueChange={(value: "Short-term" | "Medium-term" | "Long-term") => updateOpportunity(index, "timeHorizon", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Short-term">Short-term</SelectItem>
                              <SelectItem value="Medium-term">Medium-term</SelectItem>
                              <SelectItem value="Long-term">Long-term</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <Button onClick={addOpportunity} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Opportunity
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}