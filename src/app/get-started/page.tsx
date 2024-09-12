'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { FaArrowLeft, FaLeaf, FaUsers, FaBalanceScale, FaInfoCircle, FaPlus, FaTrash, FaArrowRight, FaChevronDown, FaChevronRight, FaCheck } from 'react-icons/fa';
import { AlertCircle } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { withAuth } from '../../components/withAuth';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function MaterialityAssessment({ setCurrentStep, steps, setMaterialityResults }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>>, steps: string[], setMaterialityResults: React.Dispatch<React.SetStateAction<any>> }) {
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [selectedDisclosure, setSelectedDisclosure] = useState<any>(null);
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();

  useEffect(() => {
    fetchTopicsAndDisclosures();
  }, []);

  const fetchTopicsAndDisclosures = async () => {
    try {
      setLoading(true);
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id, title, esg');

      if (topicsError) throw topicsError;

      // Fetch disclosures
      const { data: disclosuresData, error: disclosuresError } = await supabase
        .from('disclosures')
        .select('id, "description", topic, reference');

      if (disclosuresError) throw disclosuresError;

      // Organize data
      const organizedTopics = topicsData.map((topic: any) => ({
        ...topic,
        disclosures: disclosuresData.filter((disclosure: any) => disclosure.topic === topic.title)
      }));

      setTopics(organizedTopics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics and disclosures:', error);
      setError('Failed to load topics and disclosures. Please try again.');
      setLoading(false);
    }
  };

  const fetchDataPoints = async (reference: string) => {
    try {
      const { data, error } = await supabase
        .from('data_points')
        .select('id, esrs, dr, paragraph, related_ar, name, data_type, may_[v]')
        .eq('dr', reference);

      if (error) throw error;

      setDataPoints(data);
    } catch (error) {
      console.error('Error fetching data points:', error);
      setDataPoints([]);
    }
  };

  const handleTopicSelect = (topic: any) => {
    setSelectedTopic(topic);
    setSelectedDisclosure(null);
    setDataPoints([]);
  };

  const handleDisclosureSelect = async (disclosure: any) => {
    setSelectedDisclosure(disclosure);
    if (disclosure.reference) {
      await fetchDataPoints(disclosure.reference);
    }
  };

  const handleMaterialityChange = async (disclosure: any, materiality: string) => {
    if (!user?.id || !selectedTopic) return;

    const company = user.user_metadata?.company;
    const updatedBy = user.id;

    if (!company) {
      setError('Company information not found. Please update your profile.');
      return;
    }

    try {
      const { error } = await supabase
        .from('disclosure_materiality_assessments')
        .upsert({
          company,
          topic: selectedTopic.title,
          materiality,
          reference: disclosure.reference,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'company,reference' });

      if (error) throw error;

      // Update local state
      setSelectedTopic((prevTopic: any) => ({
        ...prevTopic,
        disclosures: prevTopic.disclosures.map((d: any) =>
          d.id === disclosure.id ? { ...d, materiality } : d
        )
      }));

      // Refresh the topics to update the UI
      await fetchTopicsAndDisclosures();

    } catch (error) {
      console.error('Error saving disclosure materiality:', error);
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
            Assess the materiality of each topic, disclosure, and data point for your company's sustainability reporting.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopicsList topics={topics} selectedTopic={selectedTopic} onTopicSelect={handleTopicSelect} />
        <DisclosuresList 
          selectedTopic={selectedTopic} 
          selectedDisclosure={selectedDisclosure} 
          onDisclosureSelect={handleDisclosureSelect}
          onMaterialityChange={handleMaterialityChange}
        />
        <DataPointsList selectedDisclosure={selectedDisclosure} dataPoints={dataPoints} />
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

function TopicsList({ topics, selectedTopic, onTopicSelect }: { topics: any[], selectedTopic: any, onTopicSelect: (topic: any) => void }) {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200">Topics</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">Select a topic to view its disclosures</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh] pr-4">
          {Object.entries(groupTopicsByESG(topics)).reverse().map(([esg, topicsInGroup]) => (
            <div key={esg} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{esg}</h3>
              <div className="space-y-2">
                {topicsInGroup.sort((a, b) => a.id - b.id).map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTopic?.id === topic.id 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => onTopicSelect(topic)}
                  >
                    <p className="text-sm font-medium">{topic.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function DisclosuresList({ selectedTopic, selectedDisclosure, onDisclosureSelect, onMaterialityChange }: { selectedTopic: any, selectedDisclosure: any, onDisclosureSelect: (disclosure: any) => void, onMaterialityChange: (disclosure: any, materiality: string) => void }) {
  if (!selectedTopic) return <Card className="bg-white dark:bg-gray-800"><CardContent>Please select a topic first</CardContent></Card>;

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200">Disclosures for {selectedTopic.title}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">Assess the materiality of each disclosure</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {selectedTopic.disclosures.sort((a: any, b: any) => a.id - b.id).map((disclosure: any) => (
              <div
                key={disclosure.id}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  selectedDisclosure?.id === disclosure.id 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <p className="font-medium mb-2">{disclosure.description}</p>
                {disclosure.reference && (
                  <Badge variant="secondary" className="mb-2">{disclosure.reference}</Badge>
                )}
                <Select
                  value={disclosure.materiality || 'To assign'}
                  onValueChange={(value) => onMaterialityChange(disclosure, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select materiality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To assign">To assign</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Not Material">Not Material</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="mt-2 w-full" onClick={() => onDisclosureSelect(disclosure)}>
                  View Data Points
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function DataPointsList({ selectedDisclosure, dataPoints }: { selectedDisclosure: any, dataPoints: any[] }) {
  if (!selectedDisclosure) return <Card className="bg-white dark:bg-gray-800"><CardContent>Please select a disclosure to view its data points</CardContent></Card>;

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200">Data Points for {selectedDisclosure.description}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">Review and assess data points</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          {dataPoints.length > 0 ? (
            <div className="space-y-4">
              {dataPoints.sort((a, b) => a.id - b.id).map((dataPoint) => (
                <div key={dataPoint.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium mb-2">{dataPoint.name}</p>
                  <Select
                    value={dataPoint.materiality || 'To assign'}
                    onValueChange={(value) => {
                      console.log(`Updating dataPoint ${dataPoint.id} materiality to ${value}`);
                      // Implement the update logic here
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select materiality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="To assign">To assign</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Not Material">Not Material</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No data points available for this disclosure.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function groupTopicsByESG(topics: any[]) {
  const groupedTopics: { [key: string]: any[] } = {};
  topics.forEach(topic => {
    if (!groupedTopics[topic.esg]) {
      groupedTopics[topic.esg] = [];
    }
    groupedTopics[topic.esg].push(topic);
  });
  
  // Sort the topics within each ESG category alphabetically
  Object.keys(groupedTopics).forEach(esg => {
    groupedTopics[esg].sort((a, b) => a.title.localeCompare(b.title));
  });
  
  return groupedTopics;
}

function FinishSetup({ setCurrentStep, steps, companyData, subsidiaries, materialityResults }: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>,
  steps: string[],
  companyData: any,
  subsidiaries: any[],
  materialityResults: any
}) {
  return (
    <div className="mb-8">
      <div className="bg-blue-100 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
        <h3 className="flex items-center text-xl font-semibold text-blue-700 mb-3">
          <FaInfoCircle className="mr-3" /> Review and Finish Setup
        </h3>
        <p className="text-base text-blue-800">
          Review your company structure, subsidiaries, and materiality assessment results before finishing the setup.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Company Structure</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p><strong>Company Name:</strong> {companyData.name}</p>
            <p><strong>Legal Form:</strong> {companyData.legalForm}</p>
            <p><strong>Headquarters:</strong> {companyData.headquartersLocation}</p>
            <p><strong>Operating Countries:</strong> {companyData.operatingCountries}</p>
            <p><strong>Primary Sector:</strong> {companyData.primarySector}</p>
            <p><strong>Employee Count:</strong> {companyData.employeeCount}</p>
            <p><strong>Annual Revenue:</strong> {companyData.annualRevenue}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Subsidiaries</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subsidiaries.map((sub, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h5 className="font-semibold mb-2">{sub.name}</h5>
                <p className="text-base mb-1"><span className="font-medium">Country:</span> {sub.country}</p>
                <p className="text-base mb-1"><span className="font-medium">Industry:</span> {sub.industry}</p>
                <p className="text-base mb-2"><span className="font-medium">Ownership:</span> {sub.ownership}%</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Materiality Assessment Results</h2>
          <div className="space-y-6">
            {Object.entries(materialityResults).map(([esg, topics]: [string, any]) => (
              <div key={esg} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3">{esg}</h3>
                {topics.map((topic: any) => (
                  <div key={topic.id} className="mb-2">
                    <p><strong>{topic.title}:</strong> {topic.materiality}</p>
                    {topic.reason && <p className="text-base text-gray-600">Reason: {topic.reason}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-between mt-8">
        <Button 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          variant="outline"
          className="px-6 py-3 text-lg"
        >
          <FaArrowLeft className="mr-2" /> Back
        </Button>
        <Button 
          onClick={() => {/* Handle finish setup */}}
          className="px-6 py-3 text-lg"
        >
          Finish Setup <FaCheck className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default withAuth(GetStarted);