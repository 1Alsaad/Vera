'use client'

import React, { useState } from 'react';
import { Upload, Link, ChevronDown, MoreVertical, X, FileText, AlertTriangle } from 'lucide-react';

export default function Component() {
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([
    { name: 'human_rights_policy_statement_january_2024_0.pdf', url: 'airbus.com/ai...tement_january_2024_0.pdf' },
  ]);
  const [analyses, setAnalyses] = useState([
    { name: 'Gap Analysis S1 own workforce', status: 'In Progress', createdAt: '2 hours ago' },
  ]);
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocuments([...documents, { name: file.name, url: URL.createObjectURL(file) }]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const esrsTopics = [
    { value: 'general', label: 'General Disclosures — General Disclosures', description: "Covers overarching governance structures, strategy formulation, and materiality assessment related to sustainability topics, providing a foundation for the specific topical disclosures." },
    { value: 'e1', label: 'E1 — Climate change', description: "Covers disclosure requirements related to greenhouse gas (GHG) emissions, climate change mitigation, adaptation policies, and climate-related risks and opportunities." },
    { value: 'e2', label: 'E2 — Pollution', description: "Addresses pollution prevention, reduction measures, emissions to air, water, and soil, as well as hazardous substances." },
    { value: 'e3', label: 'E3 — Water and marine resources', description: "Involves the management and conservation of water resources, marine ecosystems, and addressing water-related risks." },
    { value: 'e4', label: 'E4 — Biodiversity and ecosystems', description: "Focuses on the preservation of biodiversity, ecosystems, and the management of natural habitats and species." },
    { value: 'e5', label: 'E5 — Resource use and circular economy', description: "Covers the efficient use of resources, waste management, recycling, and circular economy practices." },
    { value: 's1', label: 'S1 — Own workforce', description: "Concerns the company's own employees, including human rights, fair labor practices, working conditions, diversity, health and safety, and development opportunities." },
    { value: 's2', label: 'S2 — Workers in the value chain', description: "Focuses on workers in the company's value chain, including fair labor practices, working conditions, and human rights." },
    { value: 's3', label: 'S3 — Affected communities', description: "Addresses the impact of the company's operations on local communities, including social and economic effects." },
    { value: 's4', label: 'S4 — Consumers and end-users', description: "Involves the impact on consumers and end-users, including product safety, information, and consumer rights." },
    { value: 'g1', label: 'G1 — Business conduct', description: "Covers ethical business practices, anti-corruption measures, transparency, and governance structures." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <header className="mb-8">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-indigo-800">briink</h1>
            <div className="text-sm breadcrumbs">
              <ul className="flex space-x-2">
                <li><a href="#" className="text-gray-500 hover:text-indigo-600">Home</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600">ESRS screener</a></li>
                <li className="text-gray-900">Gap Analysis</li>
              </ul>
            </div>
          </div>
          <div className="relative">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600">
              <span>Personal</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </nav>
      </header>

      <main className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">ESRS Gap Analysis <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-2">BETA</span></h2>
          <div className="flex space-x-4">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-full ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Overview</button>
            <button onClick={() => setActiveTab('new')} className={`px-4 py-2 rounded-full ${activeTab === 'new' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>New Analysis</button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Analyses</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Created At</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((analysis, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{analysis.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            {analysis.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{analysis.createdAt}</td>
                        <td className="py-3 px-4">
                          <button className="text-indigo-600 hover:text-indigo-800">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Documents</h3>
              <ul className="space-y-2">
                {documents.map((doc, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-red-500" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                    <button onClick={() => removeDocument(index)} className="text-gray-400 hover:text-gray-600">
                      <X size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">New Gap Analysis</h3>
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-600 mb-2">1. Select Documents</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-12 h-12 text-gray-400" />
                    <span className="text-indigo-600 font-medium">Upload documents</span>
                  </div>
                </label>
                <p className="text-sm text-gray-500 mt-2">or drag'n drop documents here</p>
                <button className="mt-4 flex items-center justify-center space-x-2 text-indigo-600 hover:text-indigo-800">
                  <Link size={16} />
                  <span>Enter webpage or file URL</span>
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-600 mb-2">2. Select ESRS Topic</h4>
              <div className="space-y-4 mt-4">
                {esrsTopics.map((topic) => (
                  <div key={topic.value} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id={topic.value}
                      name="esrsTopic"
                      value={topic.value}
                      checked={selectedTopic === topic.value}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="mt-1"
                    />
                    <label htmlFor={topic.value} className="flex-1">
                      <span className="font-medium text-gray-700">{topic.label}</span>
                      <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                Start Analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}