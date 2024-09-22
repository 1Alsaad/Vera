"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Leaf, Users, Building2, Briefcase } from 'lucide-react'

interface SurveyState {
  satisfaction: number;
  workLifeBalance: string;
  improvement: string[];
  recommendation: number;
  openFeedback: string;
}

const CorporatePulseSurveyComponent = () => {
  const [surveyData, setSurveyData] = useState<SurveyState>({
    satisfaction: 50,
    workLifeBalance: '',
    improvement: [],
    recommendation: 5,
    openFeedback: ''
  })

  const handleSliderChange = (value: number[]) => {
    setSurveyData(prev => ({ ...prev, satisfaction: value[0] }))
  }

  const handleRadioChange = (value: string) => {
    setSurveyData(prev => ({ ...prev, workLifeBalance: value }))
  }

  const handleCheckboxChange = (value: string) => {
    setSurveyData(prev => ({
      ...prev,
      improvement: prev.improvement.includes(value)
        ? prev.improvement.filter(item => item !== value)
        : [...prev.improvement, value]
    }))
  }

  const handleBubbleChange = (value: number) => {
    setSurveyData(prev => ({ ...prev, recommendation: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Survey responses:', surveyData)
    alert('Thank you for your feedback. Your responses have been recorded.')
  }

  const getSatisfactionLabel = (value: number) => {
    if (value < 20) return 'Very Dissatisfied'
    if (value < 40) return 'Dissatisfied'
    if (value < 60) return 'Neutral'
    if (value < 80) return 'Satisfied'
    return 'Very Satisfied'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <h1 className="text-2xl sm:text-3xl text-center font-bold">Corporate Sustainability Pulse Survey</h1>
        <p className="text-center text-primary-foreground/80 text-base mt-2">Your input is crucial for our sustainability initiatives</p>
      </div>
      <div className="flex-grow flex items-stretch p-4">
        <Card className="w-full flex flex-col">
          <CardContent className="flex-grow py-6">
            <form onSubmit={handleSubmit} className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <div className="space-y-6">
                  {/* First column */}
                  <div>
                    <Label htmlFor="satisfaction" className="text-lg font-medium mb-2 block">
                      How satisfied are you with our company's current sustainability efforts?
                    </Label>
                    <div className="mt-2">
                      <Slider
                        id="satisfaction"
                        min={0}
                        max={100}
                        step={1}
                        value={[surveyData.satisfaction]}
                        onValueChange={handleSliderChange}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Very Dissatisfied</span>
                        <span>Very Satisfied</span>
                      </div>
                      <div className="text-center mt-1 font-medium">
                        {getSatisfactionLabel(surveyData.satisfaction)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-medium mb-2 block">How would you describe your current work-life balance?</Label>
                    <RadioGroup className="mt-2 space-y-2" onValueChange={handleRadioChange}>
                      {['Poor', 'Fair', 'Good', 'Excellent'].map((option) => (
                        <div key={option} className="flex items-center">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option} className="ml-2">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-lg font-medium mb-2 block">Which areas should we prioritize for improvement? (Select all that apply)</Label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Environmental Impact', icon: Leaf },
                        { label: 'Social Responsibility', icon: Users },
                        { label: 'Corporate Governance', icon: Building2 },
                        { label: 'Employee Well-being', icon: Briefcase },
                      ].map(({ label, icon: Icon }) => (
                        <Label
                          key={label}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            surveyData.improvement.includes(label) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={label}
                            value={label}
                            onChange={() => handleCheckboxChange(label)}
                            className="sr-only"
                          />
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="text-sm">{label}</span>
                        </Label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex flex-col">
                  {/* Second column */}
                  <div>
                    <Label className="text-lg font-medium mb-2 block">How likely are you to recommend our company based on our sustainability practices?</Label>
                    <div className="flex justify-between mt-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <motion.div
                          key={value}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            type="button"
                            variant={surveyData.recommendation === value ? "default" : "outline"}
                            size="sm"
                            className={`rounded-full w-8 h-8 ${value === 0 || value === 10 ? 'sm:w-10 sm:h-10' : ''}`}
                            onClick={() => handleBubbleChange(value)}
                          >
                            {value}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Not at all likely</span>
                      <span>Extremely likely</span>
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col">
                    <Label htmlFor="openFeedback" className="text-lg font-medium mb-2 block">Do you have any additional feedback or suggestions for our sustainability initiatives?</Label>
                    <Textarea
                      id="openFeedback"
                      placeholder="Please share your thoughts here..."
                      value={surveyData.openFeedback}
                      onChange={(e) => setSurveyData(prev => ({ ...prev, openFeedback: e.target.value }))}
                      className="mt-2 flex-grow"
                    />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button onClick={handleSubmit} className="w-250px text-lg py-4" size="lg">
              Submit Survey
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default CorporatePulseSurveyComponent