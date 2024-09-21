'use client';

import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../../components/Header';

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  scale: string[];
}

interface Topic {
    id: number;
    name: string;
    scale: number;
    scope: number;
    irremediableCharacter: number;
    likelihood: number;
    financialLikelihood: number;
    financialMagnitude: number;
    justification: string;
  }

const ScoreInput: React.FC<ScoreInputProps> = ({ label, value, onChange, scale }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex space-x-1">
      {scale.map((item, index) => (
        <button
          key={index}
          onClick={() => onChange(index)}
          className={`px-2 py-1 text-xs rounded-full transition-colors duration-200 ${
            value === index
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  </div>
);

const MatrixChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Impact Materiality" 
          domain={[0, 100]}
          label={{ value: 'Impact Materiality', position: 'bottom', offset: 40 }}
          tick={{ fill: '#4A5568' }}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="Financial Materiality" 
          domain={[0, 100]}
          label={{ value: 'Financial Materiality', angle: -90, position: 'left', offset: 40 }}
          tick={{ fill: '#4A5568' }}
        />
        <ZAxis type="number" dataKey="z" range={[60, 400]} name="Score" />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          content={({ payload }) => {
            if (payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white p-4 shadow-lg rounded-lg border">
                  <p className="font-bold">{data.name}</p>
                  <p>Impact Materiality: {(data.x / 20).toFixed(2)}</p>
                  <p>Financial Materiality: {(data.y / 20).toFixed(2)}</p>
                  <p className={data.isMaterial ? 'text-green-600' : 'text-red-600'}>
                    {data.isMaterial ? 'Material' : 'Not Material'}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Scatter name="Environmental" data={data.filter(d => d.category === 'Environmental')} fill="#00A86B" />
        <Scatter name="Social" data={data.filter(d => d.category === 'Social')} fill="#FFA500" />
        <Scatter name="Governance" data={data.filter(d => d.category === 'Governance')} fill="#FF4500" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

const MaterialityMatrix = () => {
  const [topics, setTopics] = useState([
    { 
      id: 1, 
      name: 'E1-1 Climate Change Mitigation',
      scale: 0,
      scope: 0,
      irremediableCharacter: 0,
      likelihood: 0,
      financialLikelihood: 0,
      financialMagnitude: 0,
      justification: ''
    },
  ]);

  const impactScale = ['None', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const likelihoodScale = ['None', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const financialMagnitudeScale = ['Insignificant', 'Low', 'Medium', 'High', 'Very High'];

  const handleScoreChange = (id: number, type: string, value: number | string) => {
    setTopics(topics.map(topic => 
      topic.id === id ? { ...topic, [type]: value } : topic
    ));
  };

  const addTopic = () => {
    const newId = Math.max(...topics.map(t => t.id)) + 1;
    setTopics([...topics, { 
      id: newId, 
      name: `New Topic ${newId}`, 
      scale: 0,
      scope: 0,
      irremediableCharacter: 0,
      likelihood: 0,
      financialLikelihood: 0,
      financialMagnitude: 0,
      justification: ''
    }]);
  };

  const calculateImpactMateriality = (topic: Topic) => {
    const severityScore = Math.max(topic.scale, topic.scope, topic.irremediableCharacter);
    return Math.max(severityScore, (severityScore + topic.likelihood) / 2);
  };

  const calculateFinancialMateriality = (topic: Topic) => {
    return (topic.financialLikelihood + topic.financialMagnitude) / 2;
  };

  const determineMateriarlity = (topic: Topic) => {
    const impactScore = calculateImpactMateriality(topic);
    const financialScore = calculateFinancialMateriality(topic);
    const impactThreshold = 3;
    const financialThreshold = 3;
    return (impactScore >= impactThreshold || financialScore >= financialThreshold) ? "Material" : "Not Material";
  };

  const chartData = topics.map(topic => ({
    name: topic.name,
    x: calculateImpactMateriality(topic) * 20, // Scale to 0-100
    y: calculateFinancialMateriality(topic) * 20, // Scale to 0-100
    z: (calculateImpactMateriality(topic) + calculateFinancialMateriality(topic)) * 20,
    category: topic.name.startsWith('E') ? 'Environmental' : topic.name.startsWith('S') ? 'Social' : 'Governance',
    isMaterial: determineMateriarlity(topic) === "Material"
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800">Double Materiality Assessment</h2>
            <p className="mt-2 text-gray-600">Assess the impact and financial materiality of various topics.</p>
          </div>
          <div className="p-6">
            <div className="flex justify-end mb-6">
              <button 
                onClick={addTopic}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Add New Topic
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {topics.map((topic) => (
                  <div key={topic.id} className="bg-white border rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                      <h3 className="text-xl font-semibold text-gray-800">{topic.name}</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-lg font-medium mb-3 text-gray-700">Impact Materiality Assessment:</h4>
                          <ScoreInput 
                            label="Scale"
                            value={topic.scale}
                            onChange={(value: number) => handleScoreChange(topic.id, 'scale', value)}
                            scale={impactScale}
                          />
                          <ScoreInput 
                            label="Scope"
                            value={topic.scope}
                            onChange={(value: number) => handleScoreChange(topic.id, 'scope', value)}
                            scale={impactScale}
                          />
                          <ScoreInput 
                            label="Irremediable Character"
                            value={topic.irremediableCharacter}
                            onChange={(value: number) => handleScoreChange(topic.id, 'irremediableCharacter', value)}
                            scale={impactScale}
                          />
                          <ScoreInput 
                            label="Likelihood (For potential impacts)"
                            value={topic.likelihood}
                            onChange={(value: number) => handleScoreChange(topic.id, 'likelihood', value)}
                            scale={likelihoodScale}
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-3 text-gray-700">Financial Materiality Assessment:</h4>
                          <ScoreInput 
                            label="Likelihood of Financial Effects"
                            value={topic.financialLikelihood}
                            onChange={(value: number) => handleScoreChange(topic.id, 'financialLikelihood', value)}
                            scale={likelihoodScale}
                          />
                          <ScoreInput 
                            label="Magnitude of Financial Effects"
                            value={topic.financialMagnitude}
                            onChange={(value: number) => handleScoreChange(topic.id, 'financialMagnitude', value)}
                            scale={financialMagnitudeScale}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Justification</label>
                        <textarea
                          value={topic.justification}
                          onChange={(e) => handleScoreChange(topic.id, 'justification', e.target.value)}
                          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                          rows={3}
                        ></textarea>
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold">Materiality Determination: 
                          <span className={`ml-2 ${determineMateriarlity(topic) === 'Material' ? 'text-green-600' : 'text-red-600'}`}>
                            {determineMateriarlity(topic)}
                          </span>
                        </p>
                        <p>Impact Materiality Score: {calculateImpactMateriality(topic).toFixed(2)}</p>
                        <p>Financial Materiality Score: {calculateFinancialMateriality(topic).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-[calc(100vh-16rem)] sticky top-8">
                <MatrixChart data={chartData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MaterialityMatrix;