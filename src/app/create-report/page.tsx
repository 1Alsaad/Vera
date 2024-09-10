'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Database } from '@/types/supabase';
import * as XLSX from 'xlsx';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

type Topic = Database['public']['Tables']['topics']['Row'];
type ReportingData = Record<string, any[]>;

const categories = [
  'I. General Information',
  'II. Environmental Information',
  'III. Social Information',
  'IV. Governance Information'
];

const CreateReportPage = () => {
  const [reportData, setReportData] = useState<ReportingData>({});
  const [topics, setTopics] = useState<Topic[]>([]);
  const [materialTopics, setMaterialTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchReportingData();
  }, []);

  const getUserProfileWithRetry = async (maxRetries: number, delay: number) => {
    let retries = 0;
    while (retries < maxRetries) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profile && profile.company) {
          return { profile };
        }
      }
      retries++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error("User profile is not loaded.");
  };

  const fetchReportingData = async () => {
    try {
      const currentUser = await getUserProfileWithRetry(10, 500);
      const company = currentUser.profile.company;
      const materiality = "Material";

      // Fetch all topics and order them by id
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('id', { ascending: true });

      if (topicsError) throw new Error(`Error fetching topics: ${topicsError.message}`);
      if (!topicsData || topicsData.length === 0) throw new Error('No topics found');

      setTopics(topicsData);

      const reportData: ReportingData = {};
      const materialTopicsList: string[] = [];

      for (const topic of topicsData) {
        // Step 1: Look up in the table "topic_materiality_assessments"
        const { data: topicMaterialityData, error: topicMaterialityError } = await supabase
          .from('topic_materiality_assessments')
          .select('*')
          .eq('company', company)
          .eq('materiality', materiality)
          .eq('topic', topic.title);

        if (topicMaterialityError) throw new Error(`Error fetching topic_materiality_assessments: ${topicMaterialityError.message}`);
        if (!topicMaterialityData || topicMaterialityData.length === 0) continue;

        materialTopicsList.push(topic.title || '');

        // Step 2: Look up in the table "datapoint_materiality_assessments"
        const { data: datapointData, error: datapointError } = await supabase
          .from('datapoint_materiality_assessments')
          .select('datapoint_id')
          .eq('company', company)
          .eq('materiality', materiality)
          .eq('topic', topic.title);

        if (datapointError) throw new Error(`Error fetching datapoint_materiality_assessments: ${datapointError.message}`);
        
        if (!datapointData || datapointData.length === 0) {
          reportData[topic.title || ''] = [];
          continue;
        }

        const datapointIds = datapointData.map(record => record.datapoint_id);

        // Step 3: Look up "datapoint_id" in the table "tasks"
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('id')
          .in('datapoint', datapointIds)
          .eq('company', company);

        if (taskError) throw new Error(`Error fetching tasks: ${taskError.message}`);
        
        if (!taskData || taskData.length === 0) {
          reportData[topic.title || ''] = [];
          continue;
        }

        const taskIds = taskData.map(record => record.id);

        // Step 4: Look up "task_id" in the table "reporting_data"
        const { data: reportingData, error: reportingDataError } = await supabase
          .from('reporting_data')
          .select('*, disclosures(*), data_points(*)')
          .in('task_id', taskIds)
          .eq('company', company);

        if (reportingDataError) throw new Error(`Error fetching reporting data: ${reportingDataError.message}`);
        
        reportData[topic.title || ''] = reportingData || [];
      }

      setReportData(reportData);
      setMaterialTopics(materialTopicsList);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchReportingData function:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const currentUser = await getUserProfileWithRetry(10, 500);
      const company = currentUser.profile.company;

      // Fetch data from the 'reporting_data' table
      const fetchData = async () => {
        const { data, error } = await supabase
          .from('reporting_data')
          .select('esrs, disclosure, value, status')
          .eq('company', company);
          
        if (error) {
          console.error('Error fetching data:', error);
          throw error;
        }

        return data || [];
      };

      // Fetch reference value for a given disclosure from the 'disclosures' table
      const fetchReference = async (disclosure: number) => {
        const { data, error } = await supabase
          .from('disclosures')
          .select('reference')
          .eq('id', disclosure)
          .single();

        if (error) {
          console.error('Error fetching reference:', error);
          return null;
        }

        return data ? data.reference : null;
      };

      const data = await fetchData();

      if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
      }

      // Fetch references for each disclosure value and update the data array
      for (let row of data) {
        const reference = await fetchReference(row.disclosure);
        if (reference) {
          row.disclosure = reference;
        }
      }

      // Sort data by 'disclosure'
      data.sort((a, b) => (a.disclosure > b.disclosure ? 1 : -1));

      // Map data to a simple structure for the Excel sheet
      const rows = data.map(row => ({
        esrs: row.esrs,
        dr: row.disclosure,
        value: row.value,
        status: row.status
      }));

      // Create a worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

      // Add headers
      XLSX.utils.sheet_add_aoa(worksheet, [["ESRS", "DR", "Value", "Status"]], { origin: "A1" });

      // Set column widths
      worksheet["!cols"] = [
        { wch: 10 }, // width for ESRS
        { wch: 20 }, // width for dr
        { wch: 10 }, // width for value
        { wch: 10 }  // width for status
      ];

      // Create an XLSX file as a Blob
      const workbookOut = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([workbookOut], { type: 'application/octet-stream' });

      // Create a link element and trigger a download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Report.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      // You might want to show an error message to the user here
    }
  };

  const getCategoryForESG = (esg: string | null) => {
    if (!esg) return categories[0];
    const firstWord = esg.split(' ')[0];
    switch (firstWord) {
      case 'General': return categories[0];
      case 'Environmental': return categories[1];
      case 'Social': return categories[2];
      case 'Governance': return categories[3];
      default: return categories[0];
    }
  };

  const organizeDataByCategory = () => {
    const organizedData: Record<string, Record<string, any[]>> = {};
    categories.forEach(category => {
      organizedData[category] = {};
    });

    topics.forEach((topic) => {
      if (reportData[topic.title || '']) {
        const category = getCategoryForESG(topic.esg);
        organizedData[category][topic.title || ''] = reportData[topic.title || ''];
      }
    });

    return organizedData;
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-border">
        <div className="p-6">
          <Link href="/">
            <Button variant="ghost" className="mb-6 p-0 hover:bg-transparent">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <h2 className="font-semibold mb-4 text-xl">Contents</h2>
          <Button className="w-full mb-6" onClick={exportToExcel}>
            Export Report
          </Button>
          <nav className="space-y-2">
            {categories.map((category, index) => (
              <Button 
                key={index} 
                variant={selectedCategory === category ? "default" : "ghost"}
                className="w-full justify-between"
                onClick={() => setSelectedCategory(category)}
              >
                <span>{category}</span>
                <ChevronRight className="w-5 h-5" />
              </Button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10 overflow-auto">
        <ScrollArea className="h-full">
          {loading ? (
            <p>Loading report data...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : selectedCategory ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">{selectedCategory}</h2>
              {Object.entries(organizeDataByCategory()[selectedCategory]).map(([topic, data], index) => (
                <section key={index}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
                    {topic}
                    <ChevronDown className="w-6 h-6" />
                  </h3>
                  <div className="space-y-4">
                    {data.length > 0 ? (
                      data.map((item: any, itemIndex: number) => (
                        <Card key={itemIndex}>
                          <CardContent className="p-6">
                            <h4 className="font-semibold mb-2 text-lg">{item.disclosures?.reference || item.data_points?.name}</h4>
                            <p className="text-muted-foreground">{item.value || item.disclosures?.description || item.data_points?.paragraph}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-6">
                          <p className="text-muted-foreground">No data available for this material topic.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p>Select a category from the sidebar to view the report data.</p>
          )}
        </ScrollArea>
      </main>
    </div>
  );
};

export default CreateReportPage;