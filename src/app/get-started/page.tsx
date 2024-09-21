'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowLeft, ArrowRight, Check, Info, Leaf, Users, Scale } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from '@supabase/supabase-js'
import { useUser } from '@supabase/auth-helpers-react'
import { getCurrentUser } from '@/hooks/useAuth'
import { useSupabase } from '@/components/supabase/provider'
import { withAuth } from '@/components/withAuth'
import { Input } from "@/components/ui/input"


// Assuming you have environment variables set up for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

interface Topic {
  id: number
  title: string
  esg: string
}

interface Disclosure {
  id: number
  description: string
  reference: string
}

interface DataPoint {
  id: number
  name: string
  dataType: string
  dr: string
  disclosure_reference: string
}


export default function GetStarted() {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    "Learn about ESRS",
    "Company Structure",
    "Materiality Assessment",
    "Finish Setup"
  ]

  const handleNext = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0))
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="bg-background shadow-lg rounded-lg p-6 sm:p-8 lg:p-10">
          <div className="flex justify-between items-center mb-8">
            <Link href="/dashboard" passHref>
              <Button
                variant="outline"
                className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <ModeToggle />
          </div>

          <h1 className="text-4xl font-bold mb-8 text-center">Get Started with Vera</h1>
        
          <ProgressBar steps={steps} currentStep={currentStep} />
        
          <div className="mt-12">
            <h2 className="text-3xl font-semibold mb-8 text-center text-gray-900 dark:text-gray-100">{steps[currentStep]}</h2>
            {currentStep === 0 && <LearnAboutESRS />}
            {currentStep === 1 && <CompanyStructure />}
            {currentStep === 2 && <MaterialityAssessment />}
            {currentStep === 3 && <FinishSetup />}
          </div>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={handleBack}
              variant="outline"
              className="px-8 py-4 text-lg"
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Back
            </Button>
            <Button 
              onClick={handleNext}
              className="px-8 py-4 text-lg"
              disabled={currentStep === steps.length - 1}
            >
              {currentStep === steps.length - 1 ? (
                <>Finish <Check className="ml-2 h-5 w-5" /></>
              ) : (
                <>Next <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ steps, currentStep }: { steps: string[], currentStep: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-4">
        {steps.map((step, index) => (
          <div key={step} className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
              index <= currentStep ? 'bg-blue-600 dark:bg-blue-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <span className="mt-2 text-sm text-center">{step}</span>
          </div>
        ))}
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
        <div 
          className="h-2 bg-blue-600 dark:bg-blue-400 rounded-full absolute top-0 left-0 transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

function LearnAboutESRS() {
  const esrsData = [
    {
      title: "Environmental",
      icon: <Leaf className="text-green-500 text-3xl mb-2" />,
      standards: ["Climate change", "Pollution", "Water & marine resources", "Biodiversity & ecosystems", "Resource use & circular economy"],
    },
    {
      title: "Social",
      icon: <Users className="text-blue-500 text-3xl mb-2" />,
      standards: ["Own workforce", "Workers in the value chain", "Affected communities", "Consumers & end-users"],
    },
    {
      title: "Governance",
      icon: <Scale className="text-purple-500 text-3xl mb-2" />,
      standards: ["Business conduct", "Governance, risk management & internal control", "Strategy & business model"],
    },
  ]

  return (
    <div className="space-y-8">
      <Alert className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200 text-lg font-semibold">What are ESRS?</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          ESRS (European Sustainability Reporting Standards) are a set of mandatory reporting requirements introduced by the European Union. They aim to standardize how companies report on their environmental, social, and governance (ESG) impacts, risks, and opportunities.
        </AlertDescription>
      </Alert>

      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">ESRS cover three main areas:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {esrsData.map((category, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex flex-col items-center">
                  {category.icon}
                  <CardTitle className="text-xl font-semibold">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  {category.standards.map((standard, idx) => (
                    <li key={idx}>{standard}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key points about ESRS</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Applicable to large EU companies and non-EU companies with significant EU presence</li>
            <li>Aims to improve transparency and comparability of sustainability information</li>
            <li>Helps investors and stakeholders make informed decisions</li>
            <li>Encourages companies to integrate sustainability into their business strategies</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function CompanyStructure() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Structure</CardTitle>
        <CardDescription>Enter your company details and subsidiaries</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">Company structure form would go here.</p>
      </CardContent>
    </Card>
  )
}

function MaterialityAssessment() {
  const { supabase } = useSupabase()
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [disclosures, setDisclosures] = useState<Disclosure[]>([])
  const [selectedDisclosure, setSelectedDisclosure] = useState<Disclosure | null>(null)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [esgFilter, setEsgFilter] = useState({ e: false, s: false, g: false })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [firstname, setFirstname] = useState<string>('')
  const [lastname, setLastname] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [company, setCompany] = useState<string>('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  const user = useUser()

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setFirstname(data.firstname || '')
        setLastname(data.lastname || '')
        setEmail(data.email)
        setCompany(data.company || '')
        setCurrentUserId(user.id)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Error loading user data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [esgFilter])

  const fetchTopics = async () => {
    if (!supabase) {
      setError("Supabase client is not available")
      return
    }

    try {
      let query = supabase.from('topics').select('*').order('id', { ascending: true })

      if (esgFilter.e) query = query.eq('esg', 'Environmental')
      if (esgFilter.s) query = query.eq('esg', 'Social')
      if (esgFilter.g) query = query.eq('esg', 'Governance') 

      const { data, error: fetchError } = await query


      if (fetchError) throw fetchError

      setTopics(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching topics:', err)
      setError('Failed to fetch topics')
    }
  }

  const fetchDisclosures = async (topic: Topic) => {
    if (!supabase) {
      setError("Supabase client is not available")
      return
    }

    // Check if the input topic has a value, otherwise return
    if (!topic) return;

    try {
      const { data: disclosuresData, error: disclosuresError } = await supabase
        .from('disclosures')
        .select('*')
        .eq('topic', topic.title)
        .order('reference', { ascending: true });
  
      if (disclosuresError) {
        console.error('Error fetching disclosures:', disclosuresError)
        setError(disclosuresError.message)
        return
      }
  
      setDisclosures(disclosuresData || [])
  
      // Fetch all datapoints for the topic at once
      const { data: dataPointsData, error: dataPointsError } = await supabase
        .from('data_points')
        .select('*')
        .in('dr', disclosuresData.map(d => d.reference))
        .order('id', { ascending: true })
  
      if (dataPointsError) {
        console.error('Error fetching datapoints:', dataPointsError)
        setError(dataPointsError.message)
        return
      }
  
      setDataPoints(dataPointsData || [])
      setError(null)
    } catch (err) {
      console.error('Error in retrieving disclosures and datapoints:', err)
      setError('Failed to fetch disclosures and datapoints')
    }
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setSelectedDisclosure(null)
    setDataPoints([])
    fetchDisclosures(topic)
  }

  const handleDisclosureSelect = async (disclosure: Disclosure) => {
    setSelectedDisclosure(disclosure)
    
    if (!supabase) {
      setError("Supabase client is not available")
      return
    }

    try {
      const { data: dataPointsData, error: dataPointsError } = await supabase
        .from('data_points')
        .select('*')
        .eq('dr', disclosure.reference)
        .order('id', { ascending: true });

      if (dataPointsError) {
        console.error('Error fetching datapoints:', dataPointsError);
        setError(dataPointsError.message);
        return;
      }

      setDataPoints(dataPointsData || []);
    } catch (err) {
      console.error('Error in retrieving datapoints:', err);
      setError('Failed to fetch datapoints');
    }
  }


  const toggleEsgFilter = (category: 'e' | 's' | 'g') => {
    setEsgFilter(prev => ({ ...prev, [category]: !prev[category] }))
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <p>Loading user data...</p>
      ) : (
        <>
          <div className="flex space-x-4">
            <Button onClick={() => toggleEsgFilter('e')} variant={esgFilter.e ? "default" : "outline"}>Environmental</Button>
            <Button onClick={() => toggleEsgFilter('s')} variant={esgFilter.s ? "default" : "outline"}>Social</Button>
            <Button onClick={() => toggleEsgFilter('g')} variant={esgFilter.g ? "default" : "outline"}>Governance</Button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="grid grid-cols-3 gap-6">
            <TopicsList topics={topics} selectedTopic={selectedTopic} onTopicSelect={handleTopicSelect} company={company} userId={currentUserId} />
            <DisclosuresList 
              disclosures={disclosures} 
              selectedDisclosure={selectedDisclosure} 
              onDisclosureSelect={handleDisclosureSelect}
              selectedTopic={selectedTopic}
              company={company}
              userId={currentUserId}
            />
            <DataPointsList 
              selectedTopic={selectedTopic}
              selectedDisclosure={selectedDisclosure} 
              dataPoints={dataPoints} 
              company={company}
              currentUserId={currentUserId}
            />
          </div>
        </>
      )}
    </div>
  )
}

interface TopicsListProps {
  topics: Topic[]
  selectedTopic: Topic | null
  onTopicSelect: (topic: Topic) => void
  company: string
  userId: string | null
}

function TopicsList({ topics, selectedTopic, onTopicSelect, company, userId }: TopicsListProps) {
  const [materialityAssessments, setMaterialityAssessments] = useState<Record<number, string>>({})
  const [reasonings, setReasonings] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchTopicMaterialityAssessments()
  }, [topics, company])

  const fetchTopicMaterialityAssessments = async () => {
    if (!company) return

    try {
      const { data, error } = await supabase
        .from('topic_materiality_assessments')
        .select('topic, materiality, reasoning')
        .eq('company', company)

      if (error) throw error

      const newMaterialityAssessments: Record<number, string> = {}
      const newReasonings: Record<number, string> = {}

      data.forEach(assessment => {
        const topic = topics.find(t => t.title === assessment.topic)
        if (topic) {
          newMaterialityAssessments[topic.id] = assessment.materiality
          newReasonings[topic.id] = assessment.reasoning || ''
        }
      })

      setMaterialityAssessments(newMaterialityAssessments)
      setReasonings(newReasonings)
    } catch (error) {
      console.error('Error fetching topic materiality assessments:', error)
      setError('Failed to fetch topic materiality assessments')
    }
  }

  const handleMaterialityChange = async (topicId: number, materiality: string) => {
    setMaterialityAssessments(prev => ({ ...prev, [topicId]: materiality }))
    await updateTopicMateriality(topicId, materiality, reasonings[topicId] || '')
  }

  const handleReasoningChange = (topicId: number, reasoning: string) => {
    setReasonings(prev => ({ ...prev, [topicId]: reasoning }))
  }

  const updateTopicMateriality = async (topicId: number, materiality: string, reasoning: string) => {
    if (!company || !userId) {
      setError('User data not available. Please try again.')
      return
    }

    const topic = topics.find(t => t.id === topicId)
    if (!topic) {
      console.error('Topic not found')
      return
    }

    try {
      // Check if a row with the same company and topic exists
      const { data: existingData, error: existingError } = await supabase
        .from('topic_materiality_assessments')
        .select('*')
        .eq('company', company)
        .eq('topic', topic.title);

      if (existingError) {
        console.error('Error querying existing row:', existingError.message);
        setError(existingError.message)
        return
      }

      if (existingData.length > 0) {
        const existingRow = existingData[0];

        // Check if the materiality and reasoning are the same as in the existing row
        if (existingRow.materiality === materiality && existingRow.reasoning === reasoning) {
          console.log('Values are the same, no update needed');
          return
        }

        // If values are different, update the row
        const { error: updateError } = await supabase
          .from('topic_materiality_assessments')
          .update({ 
            materiality: materiality, 
            reasoning: reasoning, 
            updated_by: userId, 
            updated_at: new Date().toISOString() 
          })
          .eq('company', company)
          .eq('topic', topic.title);

        if (updateError) {
          console.error('Error updating row:', updateError.message);
          setError(updateError.message)
          return
        }

        console.log('Row updated successfully');
      } else {
        // If no row exists, insert a new one
        const { error: insertError } = await supabase
          .from('topic_materiality_assessments')
          .insert([{ 
            company, 
            topic: topic.title, 
            materiality: materiality, 
            reasoning: reasoning, 
            updated_by: userId, 
            updated_at: new Date().toISOString(), 
            created_at: new Date().toISOString() 
          }]);

        if (insertError) {
          console.error('Error inserting row:', insertError.message);
          setError(insertError.message)
          return
        }

        console.log('Row inserted successfully');
      }

      setError(null)
    } catch (error) {
      console.error('Error updating topic materiality assessment:', error)
      setError('An unexpected error occurred')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topics</CardTitle>
        <CardDescription>Select a topic to view its disclosures and assess materiality</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <ScrollArea className="h-[calc(100vh-200px)]">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`p-3 rounded-lg cursor-pointer mb-4 ${
                selectedTopic?.id === topic.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div onClick={() => onTopicSelect(topic)}>
                <p className="font-medium">{topic.title}</p>
                <Badge>{topic.esg}</Badge>
              </div>
              <Select 
                onValueChange={(value) => handleMaterialityChange(topic.id, value)}
                value={materialityAssessments[topic.id] || ''}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select materiality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Material">Material</SelectItem>
                  <SelectItem value="Not Material">Not Material</SelectItem>
                </SelectContent>
              </Select>
              <Input
                className="mt-2"
                placeholder="Enter reasoning"
                value={reasonings[topic.id] || ''}
                onChange={(e) => handleReasoningChange(topic.id, e.target.value)}
                onBlur={() => updateTopicMateriality(topic.id, materialityAssessments[topic.id] || '', reasonings[topic.id] || '')}
              />
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface DisclosuresListProps {
  disclosures: Disclosure[]
  selectedDisclosure: Disclosure | null
  onDisclosureSelect: (disclosure: Disclosure) => void
  selectedTopic: Topic | null
  company: string
  userId: string | null
}

function DisclosuresList({ disclosures, selectedDisclosure, onDisclosureSelect, selectedTopic, company, userId }: DisclosuresListProps) {
  const [materialityAssessments, setMaterialityAssessments] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchDisclosureMaterialityAssessments()
  }, [disclosures, company, selectedTopic])

  const fetchDisclosureMaterialityAssessments = async () => {
    if (!company || !selectedTopic) return

    try {
      const { data, error } = await supabase
        .from('disclosure_materiality_assessments')
        .select('reference, materiality')
        .eq('company', company)
        .eq('topic', selectedTopic.title)

      if (error) throw error

      const newMaterialityAssessments: Record<number, string> = {}

      data.forEach(assessment => {
        const disclosure = disclosures.find(d => d.reference === assessment.reference)
        if (disclosure) {
          newMaterialityAssessments[disclosure.id] = assessment.materiality
        }
      })

      setMaterialityAssessments(newMaterialityAssessments)
    } catch (error) {
      console.error('Error fetching disclosure materiality assessments:', error)
      setError('Failed to fetch disclosure materiality assessments')
    }
  }

  const handleMaterialityChange = async (disclosureId: number, materiality: string) => {
    console.log('Company:', company);
    console.log('User ID:', userId);
    console.log('Selected Topic:', selectedTopic);

    if (!company || !userId || !selectedTopic) {
      setError('User data or selected topic not available. Please try again.')
      return
    }

    setMaterialityAssessments(prev => ({ ...prev, [disclosureId]: materiality }))

    const disclosure = disclosures.find(d => d.id === disclosureId)
    if (!disclosure) {
      console.error('Disclosure not found')
      return
    }

    try {
      // Check if a row with the same company and ref already exists in disclosure_materiality_assessments
      const { data: existingData, error: existingError } = await supabase
        .from('disclosure_materiality_assessments')
        .select('*')
        .eq('company', company)
        .eq('reference', disclosure.reference);

      if (existingError) {
        console.error('Error querying existing row:', existingError.message);
        setError(existingError.message)
        return
      }

      if (existingData.length > 0) {
        // If a row exists, update it
        const { error: updateError } = await supabase
          .from('disclosure_materiality_assessments')
          .update({
            topic: selectedTopic.title,
            materiality,
            updated_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('company', company)
          .eq('reference', disclosure.reference);

        if (updateError) {
          console.error('Error updating row:', updateError.message);
          setError(updateError.message)
          return
        }

        console.log('Row updated successfully');
      } else {
        // If no row exists, insert a new one
        const { error: insertError } = await supabase
          .from('disclosure_materiality_assessments')
          .insert([
            {
              company,
              topic: selectedTopic.title,
              materiality,
              reference: disclosure.reference,
              updated_by: userId,
              updated_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error('Error inserting row:', insertError.message);
          setError(insertError.message)
          return
        }

        console.log('Row inserted successfully');
      }

      setError(null)
    } catch (error) {
      console.error('Error updating materiality assessment:', error)
      setError('An unexpected error occurred')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disclosures</CardTitle>
        <CardDescription>Select a disclosure to view its data points and assess materiality</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <ScrollArea className="h-[calc(100vh-200px)]">
          {disclosures.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No disclosures available for this topic. Please select a topic or check the database.</p>
          ) : (
            disclosures.map((disclosure) => (
              <div
                key={disclosure.id}
                className={`p-3 rounded-lg cursor-pointer mb-4 ${
                  selectedDisclosure?.id === disclosure.id 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div onClick={() => onDisclosureSelect(disclosure)}>
                  <p className="font-medium">{disclosure.description}</p>
                  <Badge>{disclosure.reference}</Badge>
                </div>
                <Select 
                  onValueChange={(value) => handleMaterialityChange(disclosure.id, value)}
                  value={materialityAssessments[disclosure.id] || ''}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select materiality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Not Material">Not Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface DataPointsListProps {
  selectedTopic: Topic | null
  selectedDisclosure: Disclosure | null
  dataPoints: DataPoint[]
  company: string
  currentUserId: string | null
}

function DataPointsList({ selectedTopic, selectedDisclosure, dataPoints, company, currentUserId }: DataPointsListProps) {
  const [materialityAssessments, setMaterialityAssessments] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchDataPointMaterialityAssessments()
  }, [dataPoints, company, selectedTopic, selectedDisclosure])

  const fetchDataPointMaterialityAssessments = async () => {
    if (!company || !selectedTopic || !selectedDisclosure) return

    try {
      const { data, error } = await supabase
        .from('datapoint_materiality_assessments')
        .select('datapoint_id, materiality')
        .eq('company', company)
        .eq('topic', selectedTopic.title)
        .eq('disclosure_reference', selectedDisclosure.reference)

      if (error) throw error

      const newMaterialityAssessments: Record<number, string> = {}

      data.forEach(assessment => {
        newMaterialityAssessments[assessment.datapoint_id] = assessment.materiality
      })

      setMaterialityAssessments(newMaterialityAssessments)
    } catch (error) {
      console.error('Error fetching datapoint materiality assessments:', error)
      setError('Failed to fetch datapoint materiality assessments')
    }
  }

  const handleMaterialityChange = async (dataPointId: number, materiality: string) => {
    if (!company || !currentUserId || !selectedTopic) {
      setError('User data or selected topic not available. Please try again.')
      return
    }

    setMaterialityAssessments(prev => ({ ...prev, [dataPointId]: materiality }))

    const dataPoint = dataPoints.find(dp => dp.id === dataPointId)
    if (!dataPoint) {
      console.error('Data point not found')
      return
    }

    try {
      // Check if a row with the same company and ref already exists in datapoint_materiality_assessments
      const { data: existingData, error: existingError } = await supabase
        .from('datapoint_materiality_assessments')
        .select('*')
        .eq('company', company)
        .eq('disclosure_reference', dataPoint.dr)
        .eq('datapoint_id', dataPointId);

      if (existingError) {
        console.error('Error querying existing row:', existingError.message);
        setError(existingError.message)
        return
      }

      if (existingData.length > 0) {
        // If a row exists, update it
        const { error: updateError } = await supabase
          .from('datapoint_materiality_assessments')
          .update({
            topic: selectedTopic.title,
            materiality,
            updated_by: currentUserId,
            updated_at: new Date().toISOString(),
          })
          .eq('company', company)
          .eq('disclosure_reference', dataPoint.dr)
          .eq('datapoint_id', dataPointId);

        if (updateError) {
          console.error('Error updating row:', updateError.message);
          setError(updateError.message)
          return
        }

        console.log('Row updated successfully');
      } else {
        // If no row exists, insert a new one
        const { error: insertError } = await supabase
          .from('datapoint_materiality_assessments')
          .insert([
            {
              company: company,
              topic: selectedTopic.title,
              materiality,
              disclosure_reference: dataPoint.dr,
              datapoint_id: dataPointId,
              updated_by: currentUserId,
              updated_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error('Error inserting row:', insertError.message);
          setError(insertError.message)
          return
        }

        console.log('Row inserted successfully');
      }

      setError(null)
    } catch (error) {
      console.error('Error updating materiality assessment:', error)
      setError('An unexpected error occurred')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Points</CardTitle>
        <CardDescription>Review and assess data points</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <ScrollArea className="h-[calc(100vh-200px)]">
          {!selectedDisclosure ? (
            <p className="text-gray-500 dark:text-gray-400">Please select a disclosure to view its data points</p>
          ) : dataPoints.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No data points available for this disclosure.</p>
          ) : (
            dataPoints.map((dataPoint) => (
              <div key={dataPoint.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
                <p className="font-medium">{dataPoint.name}</p>
                <Badge>{dataPoint.dataType}</Badge>
                <Select 
                  onValueChange={(value) => handleMaterialityChange(dataPoint.id, value)}
                  value={materialityAssessments[dataPoint.id] || ''}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select materiality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Not Material">Not Material</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function FinishSetup() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finish Setup</CardTitle>
        <CardDescription>Review and confirm your setup</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">Setup summary and confirmation would go here.</p>
      </CardContent>
    </Card>
  )
}

