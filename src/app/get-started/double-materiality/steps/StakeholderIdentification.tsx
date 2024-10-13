"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle } from "lucide-react"
import { DatePickerDemo } from "@/components/ui/date-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Stakeholder {
  group: string
  category: "Affected Stakeholders" | "Users of Sustainability Statements"
  subCategory: string
  interest: "Low" | "Medium" | "High"
  influence: "Low" | "Medium" | "High"
  methods: string[]
  notes: string
}

interface EngagementPlan {
  stakeholderGroup: string
  objectives: string
  method: string
  keyQuestions: string
  timeline: Date | null
  resources: string
  supportingDocument?: File
}

const stakeholderCategories = {
  "Affected Stakeholders": [
    "Employees (ESRS S1)",
    "Workers in the value chain (ESRS S2)",
    "Affected communities (ESRS S3)",
    "Consumers & End-Users (ESRS S4)",
    "Suppliers (ESRS G1)"
  ],
  "Users of Sustainability Statements": [
    "Investors (current and potential)",
    "Lenders and other creditors",
    "Business partners",
    "Trade unions and social partners",
    "Civil society and non-governmental organizations",
    "Governments",
    "Analysts and academics"
  ]
}

const engagementMethods = [
  "Surveys (online, paper)",
  "Interviews (in-person, online, phone)",
  "Focus groups",
  "Workshops",
  "Town hall meetings",
  "One-on-one meetings",
  "Online platforms (forums, social media)",
  "Joint projects or initiatives"
]

export default function StakeholderIdentification() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [engagementPlans, setEngagementPlans] = useState<EngagementPlan[]>([])

  const addStakeholder = () => {
    setStakeholders([...stakeholders, {
      group: "",
      category: "Affected Stakeholders",
      subCategory: "",
      interest: "Medium",
      influence: "Medium",
      methods: [],
      notes: ""
    }])
  }

  const updateStakeholder = (index: number, field: keyof Stakeholder, value: any) => {
    const newStakeholders = [...stakeholders]
    newStakeholders[index] = { ...newStakeholders[index], [field]: value }
    setStakeholders(newStakeholders)
  }

  const addEngagementPlan = () => {
    setEngagementPlans([...engagementPlans, {
      stakeholderGroup: "",
      objectives: "",
      method: "",
      keyQuestions: "",
      timeline: null,
      resources: ""
    }])
  }

  const updateEngagementPlan = (index: number, field: keyof EngagementPlan, value: any) => {
    const newPlans = [...engagementPlans]
    newPlans[index] = { ...newPlans[index], [field]: value }
    setEngagementPlans(newPlans)
  }

  return (
    <Tabs defaultValue="mapping" className="w-full h-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="mapping">Stakeholder Mapping</TabsTrigger>
        <TabsTrigger value="engagement">Engagement Planning</TabsTrigger>
      </TabsList>
      <TabsContent value="mapping" className="h-[calc(100%-40px)]">
        <Card className="h-full w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Stakeholder Mapping</CardTitle>
            <CardDescription>
              Identify stakeholders affected by your company's operations or who use your sustainability information.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-100px)] overflow-auto">
            <div className="w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Stakeholder Group</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sub-Category</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Influence</TableHead>
                    <TableHead>Engagement Methods</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stakeholders.map((stakeholder, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={stakeholder.group}
                          onChange={(e) => updateStakeholder(index, "group", e.target.value)}
                          placeholder="e.g., Local Community"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={stakeholder.category}
                          onValueChange={(value: "Affected Stakeholders" | "Users of Sustainability Statements") => updateStakeholder(index, "category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Affected Stakeholders">Affected Stakeholders</SelectItem>
                            <SelectItem value="Users of Sustainability Statements">Users of Sustainability Statements</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={stakeholder.subCategory}
                          onValueChange={(value) => updateStakeholder(index, "subCategory", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {stakeholderCategories[stakeholder.category].map((subCat) => (
                              <SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={stakeholder.interest}
                          onValueChange={(value: "Low" | "Medium" | "High") => updateStakeholder(index, "interest", value)}
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
                          value={stakeholder.influence}
                          onValueChange={(value: "Low" | "Medium" | "High") => updateStakeholder(index, "influence", value)}
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
                          multiple
                          value={stakeholder.methods}
                          onValueChange={(value) => updateStakeholder(index, "methods", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select methods" />
                          </SelectTrigger>
                          <SelectContent>
                            {engagementMethods.map((method) => (
                              <SelectItem key={method} value={method}>{method}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={stakeholder.notes}
                          onChange={(e) => updateStakeholder(index, "notes", e.target.value)}
                          placeholder="Additional notes..."
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={addStakeholder} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Stakeholder
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="engagement" className="h-[calc(100%-40px)]">
        <Card className="h-full w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Stakeholder Engagement Planning</CardTitle>
            <CardDescription>
              Plan how you will engage with stakeholders to gather their input on material sustainability matters.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-100px)] overflow-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {engagementPlans.map((plan, index) => (
                <div key={index} className="space-y-4">
                  <Select
                    value={plan.stakeholderGroup || undefined}
                    onValueChange={(value) => updateEngagementPlan(index, "stakeholderGroup", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stakeholder group" />
                    </SelectTrigger>
                    <SelectContent>
                      {stakeholders.map((s) => (
                        s.group && (
                          <SelectItem key={s.group} value={s.group}>{s.group}</SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Engagement objectives"
                    value={plan.objectives}
                    onChange={(e) => updateEngagementPlan(index, "objectives", e.target.value)}
                  />
                  <Select
                    value={plan.method || undefined}
                    onValueChange={(value) => updateEngagementPlan(index, "method", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select engagement method" />
                    </SelectTrigger>
                    <SelectContent>
                      {engagementMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Key questions to ask"
                    value={plan.keyQuestions}
                    onChange={(e) => updateEngagementPlan(index, "keyQuestions", e.target.value)}
                  />
                  <div>
                    <Label>Timeline</Label>
                    <DatePickerDemo />
                  </div>
                  <Input
                    placeholder="Resources needed"
                    value={plan.resources}
                    onChange={(e) => updateEngagementPlan(index, "resources", e.target.value)}
                  />
                </div>
              ))}
            </div>
            <Button onClick={addEngagementPlan} className="mt-6">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Engagement Plan
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}