'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { FaArrowLeft, FaLeaf, FaUsers, FaBalanceScale, FaInfoCircle, FaPlus, FaTrash, FaArrowRight, FaChevronDown, FaChevronRight, FaCheck } from 'react-icons/fa';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { withAuth } from '../../components/withAuth';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Database } from '@/types/supabase';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";


function GetStarted() {

  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [companyData, setCompanyData] = useState({});
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [materialityResults, setMaterialityResults] = useState({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "Learn about ESRS",
    "Company Structure",
    "Materiality Assessment",
    "Finish Setup"
  ];

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchCurrentUser();
      }
    }

    checkAuth();
  }, [router]);

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setError('Error fetching user profile');
      } else if (data) {
        setCurrentUser({ ...user, profile: data });
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8 lg:p-10">
          <div className="flex justify-between items-center mb-8">
            <Link href="/dashboard" passHref>
              <Button
                variant="outline"
                className="flex items-center text-[#1F2937] dark:text-gray-100 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition duration-200"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <ModeToggle />
          </div>

          <h1 className="text-4xl font-bold mb-8 text-center text-[#1F2937] dark:text-gray-100">Get Started with Vera</h1>
        
          <ProgressBar steps={steps} currentStep={currentStep} />
        
          <div className="mt-12">
            <h2 className="text-3xl font-semibold mb-8 text-center text-[#1F2937] dark:text-gray-100">{steps[currentStep]}</h2>
            {currentStep === 0 && <LearnAboutESRS setCurrentStep={setCurrentStep} />}
            {currentStep === 1 && <CompanyStructure setCurrentStep={setCurrentStep} steps={steps} setCompanyData={setCompanyData} setSubsidiaries={setSubsidiaries} />}
            {currentStep === 2 && <MaterialityAssessment setCurrentStep={setCurrentStep} steps={steps} setMaterialityResults={setMaterialityResults} />}
            {currentStep === 3 && <FinishSetup setCurrentStep={setCurrentStep} steps={steps} companyData={companyData} subsidiaries={subsidiaries} materialityResults={materialityResults} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ steps, currentStep }: { steps: string[], currentStep: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-4">
        {steps.map((step, index) => (
          <div key={step} className={`flex flex-col items-center ${index <= currentStep ? 'text-[#020B19]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              index <= currentStep ? 'bg-[#020B19] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="mt-2 text-sm text-center">{step}</span>
          </div>
        ))}
      </div>
      <div className="w-full h-1 bg-gray-200 relative">
        <div 
          className="h-1 bg-[#020B19] absolute top-0 left-0 transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

function LearnAboutESRS({ setCurrentStep }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
  const esrsData = [
    {
      title: "Environmental",
      icon: <FaLeaf className="text-green-500 text-2xl mb-1" />,
      standards: ["Climate change", "Pollution", "Water & marine resources", "Biodiversity & ecosystems", "Resource use & circular economy"],
    },
    {
      title: "Social",
      icon: <FaUsers className="text-blue-500 text-2xl mb-1" />,
      standards: ["Own workforce", "Workers in the value chain", "Affected communities", "Consumers & end-users"],
    },
    {
      title: "Governance",
      icon: <FaBalanceScale className="text-purple-500 text-2xl mb-1" />,
      standards: ["Business conduct", "Governance, risk management & internal control", "Strategy & business model"],
    },
  ];

  return (
    <div className="mb-12"> {/* Increased bottom margin */}
      <div className="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 p-6 mb-10 rounded-r-lg"> {/* Increased bottom margin */}
        <h3 className="flex items-center text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-4"> {/* Increased font size and margin */}
          <FaInfoCircle className="mr-3" /> What are ESRS?
        </h3>
        <p className="text-lg text-blue-800 dark:text-blue-200"> {/* Increased font size */}
          ESRS (European Sustainability Reporting Standards) are a set of mandatory reporting requirements introduced by the European Union. They aim to standardize how companies report on their environmental, social, and governance (ESG) impacts, risks, and opportunities.
        </p>
      </div>
      <p className="mb-8 text-xl">ESRS cover three main areas:</p> {/* Increased font size and margin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12"> {/* Increased gap and margin */}
        {esrsData.map((category, index) => (
          <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center mb-4">
              {category.icon}
              <h3 className="text-xl font-semibold mt-2">{category.title}</h3>
            </div>
            <ul className="list-disc pl-6 text-base space-y-2">
              {category.standards.map((standard, idx) => (
                <li key={idx}>{standard}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-base text-gray-600 dark:text-gray-300 mb-8">
        <p className="mb-3">Key points about ESRS:</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>Applicable to large EU companies and non-EU companies with significant EU presence</li>
          <li>Aims to improve transparency and comparability of sustainability information</li>
          <li>Helps investors and stakeholders make informed decisions</li>
          <li>Encourages companies to integrate sustainability into their business strategies</li>
        </ul>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => setCurrentStep(prev => prev + 1)}
          className="px-8 py-4 text-lg"
        >
          Next <FaArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

function CompanyStructure({ setCurrentStep, steps, setCompanyData, setSubsidiaries }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>>, steps: string[], setCompanyData: React.Dispatch<React.SetStateAction<any>>, setSubsidiaries: React.Dispatch<React.SetStateAction<any[]>> }) {
  const [company, setCompany] = useState({
    name: '',
    legalForm: '',
    headquartersLocation: '',
    operatingCountries: '',
    primarySector: '',
    employeeCount: '',
    annualRevenue: '',
  });
  const [localSubsidiaries, setLocalSubsidiaries] = useState([{ name: '', country: '', industry: '', ownership: '' }]);
  const [newSubsidiary, setNewSubsidiary] = useState({ name: '', country: '', industry: '', ownership: '' });
  const [showAlert, setShowAlert] = useState(false);

  const countries = ["United States", "United Kingdom", "Germany", "France", "Spain", "Italy", "Other"];
  const industries = ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Energy", "Other"];

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleNewSubsidiaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'ownership') {
      const ownershipValue = Math.max(0, parseInt(value) || 0);
      setNewSubsidiary({ ...newSubsidiary, [name]: ownershipValue.toString() });
    } else {
      setNewSubsidiary({ ...newSubsidiary, [name]: value });
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const addSubsidiary = () => {
    if (newSubsidiary.name && newSubsidiary.country && newSubsidiary.industry && newSubsidiary.ownership) {
      setLocalSubsidiaries([...localSubsidiaries, newSubsidiary]);
      setNewSubsidiary({ name: '', country: '', industry: '', ownership: '' });
    } else {
      setShowAlert(true);
    }
  };

  const removeSubsidiary = (index: number) => {
    setLocalSubsidiaries(localSubsidiaries.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setCompanyData(company);
    setSubsidiaries(localSubsidiaries);
  }, [company, localSubsidiaries, setCompanyData, setSubsidiaries]);

  return (
    <div className="mb-8 relative">
      {showAlert && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
          <Alert className="bg-white dark:bg-gray-800 shadow-lg border border-red-500">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Please fill all fields before adding a subsidiary.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
        <h3 className="flex items-center text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">
          <FaInfoCircle className="mr-3" /> Company Structure Information
        </h3>
        <p className="text-base text-blue-800 dark:text-blue-200">
          Please provide information about your company and its subsidiaries. This data is crucial for ESRS/CSRD reporting.
        </p>
      </div>

      <form className="space-y-8">
        <div>
          <h4 className="text-xl font-semibold mb-4">Parent Company Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['name', 'legalForm', 'headquartersLocation', 'operatingCountries', 'primarySector', 'employeeCount', 'annualRevenue'].map((field) => (
              <input
                key={field}
                type={field === 'employeeCount' || field === 'annualRevenue' ? 'number' : 'text'}
                name={field}
                value={company[field as keyof typeof company]}
                onChange={handleCompanyChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4">Add New Subsidiary</h4>
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                value={newSubsidiary.name}
                onChange={handleNewSubsidiaryChange}
                placeholder="Subsidiary Name"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
              <select
                name="country"
                value={newSubsidiary.country}
                onChange={handleNewSubsidiaryChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <select
                name="industry"
                value={newSubsidiary.industry}
                onChange={handleNewSubsidiaryChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              <input
                type="number"
                name="ownership"
                value={newSubsidiary.ownership}
                onChange={handleNewSubsidiaryChange}
                placeholder="Ownership %"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                min="0"
                max="100"
                required
              />
            </div>
            <Button
              type="button"
              onClick={addSubsidiary}
              className="w-full mt-6 p-3 text-lg"
            >
              <FaPlus className="mr-2" /> Add Subsidiary
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4">Subsidiaries</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {localSubsidiaries.map((sub, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <h5 className="font-semibold text-lg mb-3">{sub.name}</h5>
                <p className="text-base mb-2"><span className="font-medium">Country:</span> {sub.country}</p>
                <p className="text-base mb-2"><span className="font-medium">Industry:</span> {sub.industry}</p>
                <p className="text-base mb-3"><span className="font-medium">Ownership:</span> {sub.ownership}%</p>
                <Button
                  type="button"
                  onClick={() => removeSubsidiary(index)}
                  variant="destructive"
                  className="w-full"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </form>

      <div className="flex justify-between mt-8">
        <Button 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          variant="outline"
          className="px-8 py-4 text-lg"
        >
          <FaArrowLeft className="mr-2" /> Back
        </Button>
        <Button 
          onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
          className="px-6 py-3 text-lg"
        >
          Next <FaArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

type MaterialityStatus = Database['public']['Enums']['materiality_status'];

function MaterialityAssessment({ setCurrentStep, steps, setMaterialityResults }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>>, steps: string[], setMaterialityResults: React.Dispatch<React.SetStateAction<any>> }) {
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();

  useEffect(() => {
    fetchTopicsAndAssessments();
  }, []);

  const fetchTopicsAndAssessments = async () => {
    try {
      setLoading(true);
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id, title, esg');

      if (topicsError) throw topicsError;

      // Fetch existing assessments for the company
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('topic_materiality_assessments')
        .select('*')
        .eq('company', user?.user_metadata?.company);

      if (assessmentsError) throw assessmentsError;

      // Merge topics with existing assessments
      const mergedTopics = topicsData.map((topic: any) => {
        const assessment = assessmentsData.find((a: any) => a.topic === topic.title);
        return {
          ...topic,
          materiality: assessment?.materiality || 'To Assess',
          reasoning: assessment?.reasoning || '',
        };
      });

      setTopics(mergedTopics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics and assessments:', error);
      setError('Failed to load topics and assessments. Please try again.');
      setLoading(false);
    }
  };

  const handleMaterialityChange = async (topic: string, materiality: MaterialityStatus, reasoning: string) => {
    if (!user?.id) return;

    const company = user.user_metadata?.company;
    const updatedBy = user.id;

    if (!company) {
      setError('Company information not found. Please update your profile.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('topic_materiality_assessments')
        .upsert({
          company,
          topic,
          materiality,
          reasoning,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'company,topic',
          returning: 'minimal'
        });

      if (error) throw error;

      // Update local state
      setTopics((prevTopics) => 
        prevTopics.map((t) => 
          t.title === topic ? { ...t, materiality, reasoning } : t
        )
      );

      console.log('Assessment updated successfully');
    } catch (error) {
      console.error('Error updating assessment:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="mb-8">
      <Card className="mb-8 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-semibold text-gray-800 dark:text-gray-200">
            <FaInfoCircle className="mr-3 text-blue-600 dark:text-blue-400" /> Materiality Assessment
          </CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-400">
            Assess the materiality of each topic for your company's sustainability reporting.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <TopicsList 
          topics={topics} 
          onMaterialityChange={handleMaterialityChange}
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between mt-8">
        <Button 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          variant="outline"
          className="px-6 py-3 text-lg"
        >
          <FaArrowLeft className="mr-2" /> Back
        </Button>
        <Button 
          onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
          className="px-6 py-3 text-lg"
        >
          Next <FaArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

function TopicsList({ topics, onMaterialityChange }: { 
  topics: any[], 
  onMaterialityChange: (topic: string, materiality: MaterialityStatus, reasoning: string) => void 
}) {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200">Topics</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">Assess the materiality of each topic</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh] pr-4">
          {Object.entries(groupTopicsByESG(topics)).map(([esg, topicsInGroup]) => (
            <div key={esg} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{esg}</h3>
              <div className="space-y-4">
                {topicsInGroup.map((topic) => (
                  <TopicAssessment 
                    key={topic.id} 
                    topic={topic} 
                    onMaterialityChange={onMaterialityChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TopicAssessment({ topic, onMaterialityChange }: {
  topic: any,
  onMaterialityChange: (topic: string, materiality: MaterialityStatus, reasoning: string) => void
}) {
  const [materiality, setMateriality] = useState<MaterialityStatus>(topic.materiality);
  const [reasoning, setReasoning] = useState(topic.reasoning);

  const handleMaterialityChange = (value: MaterialityStatus) => {
    setMateriality(value);
    onMaterialityChange(topic.title, value, reasoning);
  };

  const handleReasoningChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReasoning(e.target.value);
    onMaterialityChange(topic.title, materiality, e.target.value);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="font-medium mb-2">{topic.title}</p>
      <Select
        value={materiality}
        onValueChange={handleMaterialityChange}
      >
        <SelectTrigger className="w-full mb-2">
          <SelectValue placeholder="Select materiality" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="To Assess">To Assess</SelectItem>
          <SelectItem value="Material">Material</SelectItem>
          <SelectItem value="Not Material">Not Material</SelectItem>
        </SelectContent>
      </Select>
      <textarea
        className="w-full p-2 border rounded-md mb-2"
        placeholder="Reasoning"
        value={reasoning}
        onChange={handleReasoningChange}
      />
    </div>
  );
}
