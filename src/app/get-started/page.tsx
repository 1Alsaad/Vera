'use client';

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaLeaf, FaUsers, FaBalanceScale, FaInfoCircle, FaPlus, FaTrash, FaArrowRight, FaChevronDown, FaChevronRight, FaCheck } from 'react-icons/fa';
import { AlertCircle } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { createClient } from '@supabase/supabase-js';
import { withAuth } from '../../components/withAuth';

// Initialize Supabase client (you might want to move this to a separate file)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default withAuth(GetStarted);

function GetStarted() {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyData, setCompanyData] = useState({});
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [materialityResults, setMaterialityResults] = useState({});
  const steps = [
    "Learn about ESRS",
    "Company Structure",
    "Materiality Assessment",
    "Finish Setup"
  ];

  return (
    <div className="min-h-screen bg-[#DDEBFF]">
      <main className="p-4 sm:p-6">
        <Link href="/" className="flex items-center text-blue-600 mb-4 text-sm">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-4">Get Started with Vera</h1>
        
        <ProgressBar steps={steps} currentStep={currentStep} />
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">{steps[currentStep]}</h2>
          {currentStep === 0 && <LearnAboutESRS setCurrentStep={setCurrentStep} />}
          {currentStep === 1 && <CompanyStructure setCurrentStep={setCurrentStep} steps={steps} setCompanyData={setCompanyData} setSubsidiaries={setSubsidiaries} />}
          {currentStep === 2 && <MaterialityAssessment setCurrentStep={setCurrentStep} steps={steps} setMaterialityResults={setMaterialityResults} />}
          {currentStep === 3 && <FinishSetup setCurrentStep={setCurrentStep} steps={steps} companyData={companyData} subsidiaries={subsidiaries} materialityResults={materialityResults} />}
        </div>
      </main>
    </div>
  );
}

function ProgressBar({ steps, currentStep }: { steps: string[], currentStep: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-3/4 mb-2">
        {steps.map((step, index) => (
          <div key={step} className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="mt-1 text-xs text-center">{step}</span>
          </div>
        ))}
      </div>
      <div className="w-3/4 h-0.5 bg-gray-200 relative">
        <div 
          className="h-0.5 bg-blue-600 absolute top-0 left-0 transition-all duration-300 ease-in-out"
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
    <div className="mb-6">
      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
        <h3 className="flex items-center text-lg font-semibold text-blue-700 mb-2">
          <FaInfoCircle className="mr-2" /> What are ESRS?
        </h3>
        <p className="text-sm text-blue-800">
          ESRS (European Sustainability Reporting Standards) are a set of mandatory reporting requirements introduced by the European Union. They aim to standardize how companies report on their environmental, social, and governance (ESG) impacts, risks, and opportunities.
        </p>
      </div>
      <p className="mb-3 text-sm">ESRS cover three main areas:</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {esrsData.map((category, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col items-center mb-2">
              {category.icon}
              <h3 className="text-lg font-semibold">{category.title}</h3>
            </div>
            <ul className="list-disc pl-4 text-sm">
              {category.standards.map((standard, idx) => (
                <li key={idx} className="mb-0.5">{standard}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Key points about ESRS:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Applicable to large EU companies and non-EU companies with significant EU presence</li>
          <li>Aims to improve transparency and comparability of sustainability information</li>
          <li>Helps investors and stakeholders make informed decisions</li>
          <li>Encourages companies to integrate sustainability into their business strategies</li>
        </ul>
      </div>
      
      <div className="flex justify-end mt-6">
        <button 
          onClick={() => setCurrentStep(prev => prev + 1)}
          className="px-4 py-2 bg-transparent text-[#1a2b3c] rounded-full border border-[#71A1FC] hover:bg-blue-50 flex items-center"
        >
          Next <FaArrowRight className="ml-2" />
        </button>
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
    <div className="mb-6 relative">
      {showAlert && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
          <Alert className="bg-white shadow-lg border border-red-500">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Please fill all fields before adding a subsidiary.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
        <h3 className="flex items-center text-lg font-semibold text-blue-700 mb-2">
          <FaInfoCircle className="mr-2" /> Company Structure Information
        </h3>
        <p className="text-sm text-blue-800">
          Please provide information about your company and its subsidiaries. This data is crucial for ESRS/CSRD reporting.
        </p>
      </div>

      <form>
        <h4 className="text-lg font-semibold mb-2">Parent Company Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {['name', 'legalForm', 'headquartersLocation', 'operatingCountries', 'primarySector', 'employeeCount', 'annualRevenue'].map((field) => (
            <input
              key={field}
              type={field === 'employeeCount' || field === 'annualRevenue' ? 'number' : 'text'}
              name={field}
              value={company[field as keyof typeof company]}
              onChange={handleCompanyChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              className="p-2 border border-[#71A1FC] rounded bg-transparent text-[#1a2b3c] placeholder-gray-400"
            />
          ))}
        </div>

        <h4 className="text-lg font-semibold mb-2">Add New Subsidiary</h4>
        <div className="bg-transparent p-4 rounded-lg border border-[#71A1FC] mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={newSubsidiary.name}
              onChange={handleNewSubsidiaryChange}
              placeholder="Subsidiary Name"
              className="p-2 border border-[#71A1FC] rounded bg-transparent text-[#1a2b3c] placeholder-gray-400"
              required
            />
            <select
              name="country"
              value={newSubsidiary.country}
              onChange={handleNewSubsidiaryChange}
              className="p-2 border border-[#71A1FC] rounded bg-transparent text-[#1a2b3c]"
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
              className="p-2 border border-[#71A1FC] rounded bg-transparent text-[#1a2b3c]"
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
              className="p-2 border border-[#71A1FC] rounded bg-transparent text-[#1a2b3c] placeholder-gray-400"
              min="0"
              max="100"
              required
            />
          </div>
          <button
            type="button"
            onClick={addSubsidiary}
            className="w-full p-2 bg-transparent text-[#1a2b3c] rounded-full border border-[#71A1FC] hover:bg-blue-50 flex items-center justify-center mt-4"
          >
            <FaPlus className="mr-2" /> Add Subsidiary
          </button>
        </div>

        <h4 className="text-lg font-semibold mb-2">Subsidiaries</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {localSubsidiaries.map((sub, index) => (
            <div key={index} className="bg-transparent p-4 rounded-lg border border-[#71A1FC]">
              <h5 className="font-semibold mb-2">{sub.name}</h5>
              <p className="text-sm mb-1"><span className="font-medium">Country:</span> {sub.country}</p>
              <p className="text-sm mb-1"><span className="font-medium">Industry:</span> {sub.industry}</p>
              <p className="text-sm mb-2"><span className="font-medium">Ownership:</span> {sub.ownership}%</p>
              <button
                type="button"
                onClick={() => removeSubsidiary(index)}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </form>

      <div className="flex justify-between mt-6">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          className="px-4 py-2 bg-transparent text-[#1a2b3c] rounded-full border border-[#71A1FC] hover:bg-blue-50 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <button 
          onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
          className="px-4 py-2 bg-transparent text-[#1a2b3c] rounded-full border border-[#71A1FC] hover:bg-blue-50 flex items-center"
        >
          Next <FaArrowRight className="ml-2" />
        </button>
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
  const [showDisclosures, setShowDisclosures] = useState(false);
  const [showDataPoints, setShowDataPoints] = useState(false);

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
    setShowDisclosures(false);
    setShowDataPoints(false);
  };

  const handleDisclosureSelect = async (disclosure: any) => {
    setSelectedDisclosure(disclosure);
    setShowDataPoints(false);
    
    if (disclosure.reference) {
      try {
        const { data, error } = await supabase
          .from('data_points')
          .select('id, name')
          .eq('dr', disclosure.reference);

        if (error) throw error;

        console.log('Fetched data points:', data);
        setDataPoints(data);
        setShowDataPoints(true);
      } catch (error) {
        console.error('Error fetching data points:', error);
        setDataPoints([]);
      }
    } else {
      setDataPoints([]);
    }
  };

  const updateMateriality = (level: 'topic' | 'disclosure' | 'datapoint', id: number, value: string) => {
    if (level === 'topic') {
      setTopics(topics.map(t => t.id === id ? { ...t, materiality: value } : t));
      setSelectedTopic((prev: any | null) => prev && prev.id === id ? { ...prev, materiality: value } : prev);
    } else if (level === 'disclosure' && selectedTopic) {
      const updatedTopics = topics.map(t => {
        if (t.id === selectedTopic.id) {
          return {
            ...t,
            disclosures: t.disclosures.map((d: any) => d.id === id ? { ...d, materiality: value } : d)
          };
        }
        return t;
      });
      setTopics(updatedTopics);
      setSelectedTopic((prev: typeof selectedTopic) => ({
        ...prev,
        disclosures: prev.disclosures.map((d: any) => d.id === id ? { ...d, materiality: value } : d)
      }));
    } else if (level === 'datapoint') {
      setDataPoints(dataPoints.map(dp => dp.id === id ? { ...dp, materiality: value } : dp));
    }
  };

  const updateTopicReason = (id: number, reason: string) => {
    setTopics(topics.map(t => t.id === id ? { ...t, reason } : t));
    setSelectedTopic((prev: any | null) => prev && prev.id === id ? { ...prev, reason } : prev);
  };

  const handleProceedToDisclosures = () => {
    setShowDisclosures(true);
  };

  const handleBackToTopic = () => {
    setShowDisclosures(false);
    setShowDataPoints(false);
    setSelectedDisclosure(null);
  };

  const handleBackToDisclosures = () => {
    setShowDataPoints(false);
  };

  useEffect(() => {
    const materialityResults = topics.reduce((acc: any, topic: any) => {
      acc[topic.esg] = acc[topic.esg] || [];
      acc[topic.esg].push({
        id: topic.id,
        title: topic.title,
        materiality: topic.materiality,
        reason: topic.reason,
        disclosures: topic.disclosures.map((d: any) => ({
          id: d.id,
          description: d.Description,
          materiality: d.materiality
        }))
      });
      return acc;
    }, {});
    setMaterialityResults(materialityResults);
  }, [topics, setMaterialityResults]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="mb-6">
      <div className="bg-blue-100 bg-opacity-50 border-l-4 border-[#71A1FC] p-4 mb-6 rounded-r-lg">
        <h3 className="flex items-center text-lg font-semibold text-[#1a2b3c] mb-2">
          <FaInfoCircle className="mr-2 text-[#71A1FC]" /> Materiality Assessment
        </h3>
        <p className="text-sm text-[#1a2b3c]">
          Assess the materiality of each topic, disclosure, and data point for your company&apos;s sustainability reporting.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Topics Section */}
        <div className="w-full lg:w-1/3">
          <h2 className="text-xl font-semibold mb-3 text-[#1a2b3c]">Topics</h2>
          <div className="space-y-4">
            {Object.entries(groupTopicsByESG(topics)).reverse().map(([esg, topicsInGroup]) => (
              <div key={esg} className="mb-4">
                <h3 className="text-lg font-medium text-[#1a2b3c] mb-2">{esg}</h3>
                <div className="space-y-2">
                  {topicsInGroup.map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedTopic?.id === topic.id 
                          ? 'bg-[#71A1FC] bg-opacity-10 border-[#71A1FC] border-2' 
                          : 'bg-transparent border border-[#71A1FC] hover:bg-[#71A1FC] hover:bg-opacity-5'
                      }`}
                      onClick={() => handleTopicSelect(topic)}
                    >
                      <h4 className="font-medium text-[#1a2b3c]">{topic.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Details and Disclosures Section */}
        <div className="w-full lg:w-2/3">
          {selectedTopic && (
            <div>
              {!showDisclosures ? (
                <div className="bg-transparent border border-[#71A1FC] p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 text-[#1a2b3c]">Assess materiality for this topic</h3>
                  <p className="text-sm text-[#1a2b3c] opacity-70 mb-2">
                    Based on your materiality assessment, is this topic material to your company?
                  </p>
                  <select 
                    value={selectedTopic.materiality || 'To assign'}
                    onChange={(e) => updateMateriality('topic', selectedTopic.id, e.target.value)}
                    className="w-full p-2 border border-[#71A1FC] rounded mb-4 bg-transparent text-[#1a2b3c]"
                  >
                    <option value="To assign">To assign</option>
                    <option value="Material">Material</option>
                    <option value="Not Material">Not Material</option>
                  </select>

                  <h3 className="font-medium mb-2 text-[#1a2b3c]">Reasoning for choice?</h3>
                  <p className="text-sm text-[#1a2b3c] opacity-70 mb-2">
                    Provide a reasoning for why the topic is material or not. If such reasoning is already documented elsewhere (e.g in an uploaded materiality assessment), please write a short note referring to this document.
                  </p>
                  <textarea
                    placeholder="Enter your reasoning here..."
                    value={selectedTopic.reason || ''}
                    onChange={(e) => updateTopicReason(selectedTopic.id, e.target.value)}
                    className="w-full p-2 border border-[#71A1FC] rounded mb-4 h-24 bg-transparent text-[#1a2b3c]"
                  />

                  <h3 className="font-medium mb-2 text-[#1a2b3c]">Review and assess what is material for your company</h3>
                  <p className="text-sm text-[#1a2b3c] opacity-70 mb-4">
                    Review and assess what is material for your company.
                  </p>

                  <button
                    onClick={handleProceedToDisclosures}
                    className="px-4 py-2 bg-[#71A1FC] text-white rounded-full hover:bg-opacity-90 flex items-center transition-colors duration-200"
                  >
                    Proceed to Disclosures <FaArrowRight className="ml-2" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <button
                      onClick={handleBackToTopic}
                      className="px-4 py-2 bg-transparent text-[#1a2b3c] rounded-full border border-[#71A1FC] hover:bg-[#71A1FC] hover:bg-opacity-10 flex items-center transition-colors duration-200"
                    >
                      <FaArrowLeft className="mr-2" /> Back to Topic
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {selectedTopic.disclosures.map((disclosure: any) => (
                      <div
                        key={disclosure.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedDisclosure?.id === disclosure.id 
                            ? 'bg-[#71A1FC] bg-opacity-10 border-[#71A1FC] border-2' 
                            : 'bg-transparent border border-[#71A1FC] hover:bg-[#71A1FC] hover:bg-opacity-5'
                        }`}
                        onClick={() => handleDisclosureSelect(disclosure)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-[#1a2b3c]">{disclosure.description}</span>
                          {disclosure.reference && (
                            <span className="px-2 py-1 bg-[#71A1FC] bg-opacity-20 text-[#1a2b3c] text-xs rounded-full">
                              {disclosure.reference}
                            </span>
                          )}
                        </div>
                        <select 
                          value={disclosure.materiality || 'To assign'}
                          onChange={(e) => updateMateriality('disclosure', disclosure.id, e.target.value)}
                          className="w-full p-2 border border-[#71A1FC] rounded bg-transparent text-[#1a2b3c]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="To assign">To assign</option>
                          <option value="Material">Material</option>
                          <option value="Not Material">Not Material</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Data Points Section */}
      {showDataPoints && selectedDisclosure && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3 text-[#1a2b3c]">Data Points for {selectedDisclosure.description}</h2>
          {dataPoints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataPoints.map((dataPoint) => (
                <div key={dataPoint.id} className="p-3 bg-transparent border border-[#71A1FC] rounded-lg">
                  <p className="text-[#1a2b3c]"><strong>Name:</strong> {dataPoint.name}</p>
                  <select 
                    value={dataPoint.materiality || 'To assign'}
                    onChange={(e) => updateMateriality('datapoint', dataPoint.id, e.target.value)}
                    className="w-full mt-2 p-2 border border-[#71A1FC] rounded bg-transparent text-[#1a2b3c]"
                  >
                    <option value="To assign">To assign</option>
                    <option value="Material">Material</option>
                    <option value="Not Material">Not Material</option>
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#1a2b3c]">No data points available for this disclosure.</p>
          )}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          className="px-4 py-2 bg-transparent text-[#1a2b3c] rounded-full border border-[#71A1FC] hover:bg-[#71A1FC] hover:bg-opacity-10 flex items-center transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <button 
          onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
          className="px-4 py-2 bg-[#71A1FC] text-white rounded-full hover:bg-opacity-90 flex items-center transition-colors duration-200"
        >
          Next <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
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
    <div className="mb-6">
      <div className="bg-blue-100 bg-opacity-50 border-l-4 border-[#71A1FC] p-4 mb-6 rounded-r-lg">
        <h3 className="flex items-center text-lg font-semibold text-[#1a2b3c] mb-2">
          <FaInfoCircle className="mr-2 text-[#71A1FC]" /> Review and Finish Setup
        </h3>
        <p className="text-sm text-[#1a2b3c]">
          Review your company structure, subsidiaries, and materiality assessment results before finishing the setup.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-[#1a2b3c]">Company Structure</h2>
          <div className="bg-transparent border border-[#71A1FC] p-4 rounded-lg">
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
          <h2 className="text-xl font-semibold mb-3 text-[#1a2b3c]">Subsidiaries</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subsidiaries.map((sub, index) => (
              <div key={index} className="bg-transparent p-4 rounded-lg border border-[#71A1FC]">
                <h5 className="font-semibold mb-2">{sub.name}</h5>
                <p className="text-sm mb-1"><span className="font-medium">Country:</span> {sub.country}</p>
                <p className="text-sm mb-1"><span className="font-medium">Industry:</span> {sub.industry}</p>
                <p className="text-sm mb-2"><span className="font-medium">Ownership:</span> {sub.ownership}%</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[#1a2b3c]">Materiality Assessment Results</h2>
          <div className="space-y-4">
            {Object.entries(materialityResults).map(([esg, topics]: [string, any]) => (
              <div key={esg} className="bg-transparent border border-[#71A1FC] p-4 rounded-lg">
                <h3 className="text-lg font-medium text-[#1a2b3c] mb-2">{esg}</h3>
                {topics.map((topic: any) => (
                  <div key={topic.id} className="mb-2">
                    <p><strong>{topic.title}:</strong> {topic.materiality}</p>
                    {topic.reason && <p className="text-sm text-gray-600">Reason: {topic.reason}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-between mt-6">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          className="px-4 py-2 bg-transparent text-[#1a2b3c] rounded-full border border-[#71A1FC] hover:bg-[#71A1FC] hover:bg-opacity-10 flex items-center transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <button 
          onClick={() => {/* Handle finish setup */}}
          className="px-4 py-2 bg-[#71A1FC] text-white rounded-full hover:bg-opacity-90 flex items-center transition-colors duration-200"
        >
          Finish Setup <FaCheck className="ml-2" />
        </button>
      </div>
    </div>
  );
}