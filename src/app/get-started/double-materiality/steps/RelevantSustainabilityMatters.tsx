"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Search } from "lucide-react"
import { Label } from "@/components/ui/label"

interface EsrsTopic {
  id: number
  name: string
  standard: string
  status: "To Be Assessed" | "Potentially Material" | "Not Material"
  priority: "Low" | "Medium" | "High"
  selected: boolean
}

interface EntitySpecificTopic {
  id: number
  name: string
  description: string
  status: "To Be Assessed" | "Potentially Material" | "Not Material"
  priority: "Low" | "Medium" | "High"
  justification: string
}

const initialEsrsTopics: EsrsTopic[] = [
  { id: 1, name: "Climate change mitigation", standard: "E1", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 2, name: "Climate change adaptation", standard: "E1", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 3, name: "Water and marine resources", standard: "E2", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 4, name: "Biodiversity and ecosystems", standard: "E4", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 5, name: "Resource use and circular economy", standard: "E5", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 6, name: "Own workforce", standard: "S1", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 7, name: "Workers in the value chain", standard: "S2", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 8, name: "Affected communities", standard: "S3", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 9, name: "Consumers and end-users", standard: "S4", status: "To Be Assessed", priority: "Medium", selected: false },
  { id: 10, name: "Business conduct", standard: "G1", status: "To Be Assessed", priority: "Medium", selected: false },
]

export default function RelevantSustainabilityMatters() {
  const [esrsTopics, setEsrsTopics] = useState<EsrsTopic[]>(initialEsrsTopics)
  const [entitySpecificTopics, setEntitySpecificTopics] = useState<EntitySpecificTopic[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStandard, setFilterStandard] = useState("All")

  const handleStatusChange = (id: number, newStatus: EsrsTopic['status']) => {
    setEsrsTopics(esrsTopics.map(topic => 
      topic.id === id ? { ...topic, status: newStatus } : topic
    ))
  }

  const handlePriorityChange = (id: number, newPriority: EsrsTopic['priority']) => {
    setEsrsTopics(esrsTopics.map(topic => 
      topic.id === id ? { ...topic, priority: newPriority } : topic
    ))
  }

  const handleTopicSelection = (id: number, isChecked: boolean) => {
    setEsrsTopics(esrsTopics.map(topic => 
      topic.id === id ? { ...topic, selected: isChecked } : topic
    ))
  }

  const addEntitySpecificTopic = () => {
    const newTopic: EntitySpecificTopic = {
      id: Date.now(),
      name: "",
      description: "",
      status: "To Be Assessed",
      priority: "Medium",
      justification: ""
    }
    setEntitySpecificTopics([...entitySpecificTopics, newTopic])
  }

  const updateEntitySpecificTopic = (id: number, field: keyof EntitySpecificTopic, value: string) => {
    setEntitySpecificTopics(entitySpecificTopics.map(topic => 
      topic.id === id ? { ...topic, [field]: value } : topic
    ))
  }

  const filteredEsrsTopics = esrsTopics.filter(topic => 
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStandard === "All" || topic.standard === filterStandard)
  )

  return (
    <div className="space-y-4 w-full">
      <Tabs defaultValue="esrs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="esrs">ESRS Topics Library</TabsTrigger>
          <TabsTrigger value="entity-specific">Entity-Specific Topics</TabsTrigger>
        </TabsList>
        <TabsContent value="esrs">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>ESRS Topics Library</CardTitle>
              <CardDescription>Review and prioritize sustainability matters from ESRS 1, Appendix B</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterStandard} onValueChange={setFilterStandard}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Standards</SelectItem>
                      <SelectItem value="E1">E1</SelectItem>
                      <SelectItem value="E2">E2</SelectItem>
                      <SelectItem value="E4">E4</SelectItem>
                      <SelectItem value="E5">E5</SelectItem>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                      <SelectItem value="S4">S4</SelectItem>
                      <SelectItem value="G1">G1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ScrollArea className="h-[600px] w-full rounded-md border">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Topic</TableHead>
                        <TableHead>Standard</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Select</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEsrsTopics.map((topic) => (
                        <TableRow key={topic.id}>
                          <TableCell className="font-medium">{topic.name}</TableCell>
                          <TableCell>{topic.standard}</TableCell>
                          <TableCell>
                            <Select
                              value={topic.status}
                              onValueChange={(value: EsrsTopic['status']) => handleStatusChange(topic.id, value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="To Be Assessed">To Be Assessed</SelectItem>
                                <SelectItem value="Potentially Material">Potentially Material</SelectItem>
                                <SelectItem value="Not Material">Not Material</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={topic.priority}
                              onValueChange={(value: EsrsTopic['priority']) => handlePriorityChange(topic.id, value)}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Checkbox
                              checked={topic.selected}
                              onCheckedChange={(checked) => handleTopicSelection(topic.id, checked as boolean)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="entity-specific">
          <Card>
            <CardHeader>
              <CardTitle>Entity-Specific Sustainability Matters</CardTitle>
              <CardDescription>
                Identify additional sustainability matters relevant to your specific circumstances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={addEntitySpecificTopic}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Entity-Specific Topic
                </Button>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {entitySpecificTopics.map((topic) => (
                    <Card key={topic.id} className="mb-4">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`topic-name-${topic.id}`}>Topic Name</Label>
                            <Input
                              id={`topic-name-${topic.id}`}
                              value={topic.name}
                              onChange={(e) => updateEntitySpecificTopic(topic.id, "name", e.target.value)}
                              placeholder="Enter topic name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`topic-description-${topic.id}`}>Description</Label>
                            <Textarea
                              id={`topic-description-${topic.id}`}
                              value={topic.description}
                              onChange={(e) => updateEntitySpecificTopic(topic.id, "description", e.target.value)}
                              placeholder="Describe the topic"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`topic-status-${topic.id}`}>Status</Label>
                            <Select
                              value={topic.status}
                              onValueChange={(value: EntitySpecificTopic['status']) => updateEntitySpecificTopic(topic.id, "status", value)}
                            >
                              <SelectTrigger id={`topic-status-${topic.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="To Be Assessed">To Be Assessed</SelectItem>
                                <SelectItem value="Potentially Material">Potentially Material</SelectItem>
                                <SelectItem value="Not Material">Not Material</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`topic-priority-${topic.id}`}>Priority</Label>
                            <Select
                              value={topic.priority}
                              onValueChange={(value: EntitySpecificTopic['priority']) => updateEntitySpecificTopic(topic.id, "priority", value)}
                            >
                              <SelectTrigger id={`topic-priority-${topic.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`topic-justification-${topic.id}`}>Justification</Label>
                            <Textarea
                              id={`topic-justification-${topic.id}`}
                              value={topic.justification}
                              onChange={(e) => updateEntitySpecificTopic(topic.id, "justification", e.target.value)}
                              placeholder="Explain why this topic is relevant to your company"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}