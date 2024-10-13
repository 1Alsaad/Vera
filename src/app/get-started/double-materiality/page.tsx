"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "@/contexts/ThemeContext"
import StakeholderIdentification from "./steps/StakeholderIdentification"
import RelevantSustainabilityMatters from "./steps/RelevantSustainabilityMatters"
import ImpactsRisksOpportunities from "./steps/ImpactsRisksOpportunities"
import AssessImpacts from "./steps/AssessImpacts"
import AssessFinancialOpportunitiesRisks from "./steps/AssessFinancialOpportunitiesRisks"
import MaterialityOverview from "./steps/MaterialityOverview"
import StrategicImplications from "./steps/StrategicImplications"

export default function DoubleAssessmentTemplate() {
  const [step, setStep] = useState(0)
  const { isDarkMode } = useTheme()

  const steps = [
    {
      title: "1. Identify and Engage Stakeholders",
      description: "Map stakeholders and plan engagement",
      content: <StakeholderIdentification />,
    },
    {
      title: "2. Draw Up a List of Potentially Relevant Sustainability Matters",
      description: "Identify relevant ESRS and entity-specific topics",
      content: <RelevantSustainabilityMatters />,
    },
    {
      title: "3. Define Impacts, Risks, and Opportunities",
      description: "Assess impacts, risks, and opportunities for each potentially material topic",
      content: <ImpactsRisksOpportunities />,
    },
    {
      title: "4. Assess Impacts",
      description: "Quantify the impacts and calculate overall impact materiality scores",
      content: <AssessImpacts />,
    },
    {
      title: "5. Assess Financial Opportunities and Risks",
      description: "Quantify the likelihood and magnitude of financial effects for each topic",
      content: <AssessFinancialOpportunitiesRisks />,
    },
    {
      title: "6. Materiality Overview",
      description: "Review the consolidated materiality assessment results",
      content: <MaterialityOverview />,
    },
    {
      title: "7. Strategic Implications",
      description: "Plan actions and set targets for material topics",
      content: <StrategicImplications />,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground p-4">
      <Card className="flex-grow w-full max-w-[1800px] mx-auto bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Double Materiality Assessment Template</CardTitle>
          <CardDescription>Complete each step to conduct your assessment</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={step.toString()} onValueChange={(value) => setStep(parseInt(value))} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-7 mb-2 bg-muted">
              {steps.map((s, index) => (
                <TabsTrigger 
                  key={index} 
                  value={index.toString()} 
                  disabled={index > step}
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            {steps.map((s, index) => (
              <TabsContent key={index} value={index.toString()} className="flex-grow data-[state=active]:flex flex-col">
                <Card className="flex flex-col flex-grow border-0 shadow-none bg-card text-card-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle>{s.title}</CardTitle>
                    <CardDescription>{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow p-0">
                    <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md">
                      <div className="p-4 w-full">
                        {s.content}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(Math.max(0, step - 1))}
                      disabled={step === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
                      disabled={step === steps.length - 1}
                    >
                      {step === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}