"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { PlusCircle, Search } from "lucide-react"

interface MaterialTopic {
  id: number
  name: string
  score: number
}

interface Policy {
  id: number
  name: string
  topics: string[]
}

interface Target {
  description: string
  date: string
}

interface Action {
  description: string
  owner: string
  dueDate: string
  status: string
}

// Mock data for material topics
const materialTopics: MaterialTopic[] = [
  { id: 1, name: "Climate Change", score: 38 },
  { id: 2, name: "Pollution", score: 27 },
  { id: 3, name: "Own Workforce", score: 18 },
  { id: 4, name: "Tax Policy", score: 20 },
]

// Mock data for existing policies
const existingPolicies: Policy[] = [
  { id: 1, name: "Environmental Policy", topics: ["Climate Change", "Pollution"] },
  { id: 2, name: "Human Resources Policy", topics: ["Own Workforce"] },
  { id: 3, name: "Tax Compliance Policy", topics: ["Tax Policy"] },
]

export default function StrategicImplications() {
  const [selectedTopic, setSelectedTopic] = useState<MaterialTopic>(materialTopics[0])
  const [linkedPolicies, setLinkedPolicies] = useState<Record<number, number[]>>({})
  const [targets, setTargets] = useState<Record<number, Target[]>>({})
  const [actions, setActions] = useState<Record<number, Action[]>>({})

  const handleLinkPolicy = (topicId: number, policyId: number) => {
    setLinkedPolicies(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), policyId]
    }))
  }

  const handleAddTarget = (topicId: number, target: Target) => {
    setTargets(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), target]
    }))
  }

  const handleAddAction = (topicId: number, action: Action) => {
    setActions(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), action]
    }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Strategic Implications</CardTitle>
        <CardDescription>Plan actions and set targets for material topics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex space-x-4">
            <div className="w-1/3">
              <Label htmlFor="topic-select">Select Material Topic</Label>
              <Select value={selectedTopic.id.toString()} onValueChange={(value) => setSelectedTopic(materialTopics.find(t => t.id.toString() === value) || materialTopics[0])}>
                <SelectTrigger id="topic-select">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {materialTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id.toString()}>{topic.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-2/3">
              <Label>Materiality Score</Label>
              <Input value={selectedTopic.score} readOnly />
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="policies">
              <AccordionTrigger>Linked Policies</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search policies..." />
                  </div>
                  <ScrollArea className="h-[200px] w-full rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy Name</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {existingPolicies.map((policy) => (
                          <TableRow key={policy.id}>
                            <TableCell>{policy.name}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLinkPolicy(selectedTopic.id, policy.id)}
                                disabled={(linkedPolicies[selectedTopic.id] || []).includes(policy.id)}
                              >
                                {(linkedPolicies[selectedTopic.id] || []).includes(policy.id) ? "Linked" : "Link"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Policy
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Policy</DialogTitle>
                        <DialogDescription>
                          Create a new policy related to this material topic.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="policy-name" className="text-right">
                            Name
                          </Label>
                          <Input id="policy-name" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="policy-description" className="text-right">
                            Description
                          </Label>
                          <Textarea id="policy-description" className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Policy</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="targets">
              <AccordionTrigger>Targets</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <ScrollArea className="h-[200px] w-full rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Target Description</TableHead>
                          <TableHead>Target Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(targets[selectedTopic.id] || []).map((target, index) => (
                          <TableRow key={index}>
                            <TableCell>{target.description}</TableCell>
                            <TableCell>{target.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Set New Target
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Set New Target</DialogTitle>
                        <DialogDescription>
                          Set a new target for this material topic.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="target-description" className="text-right">
                            Description
                          </Label>
                          <Textarea id="target-description" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="target-date" className="text-right">
                            Target Date
                          </Label>
                          <DatePicker />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={() => handleAddTarget(selectedTopic.id, { description: "New Target", date: "2024-12-31" })}>Set Target</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="actions">
              <AccordionTrigger>Actions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <ScrollArea className="h-[200px] w-full rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(actions[selectedTopic.id] || []).map((action, index) => (
                          <TableRow key={index}>
                            <TableCell>{action.description}</TableCell>
                            <TableCell>{action.owner}</TableCell>
                            <TableCell>{action.dueDate}</TableCell>
                            <TableCell>{action.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Define New Action
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Define New Action</DialogTitle>
                        <DialogDescription>
                          Define a new action for this material topic.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="action-description" className="text-right">
                            Description
                          </Label>
                          <Textarea id="action-description" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="action-owner" className="text-right">
                            Owner
                          </Label>
                          <Input id="action-owner" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="action-due-date" className="text-right">
                            Due Date
                          </Label>
                          <DatePicker />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={() => handleAddAction(selectedTopic.id, { description: "New Action", owner: "John Doe", dueDate: "2024-06-30", status: "Not Started" })}>Define Action</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  )
}