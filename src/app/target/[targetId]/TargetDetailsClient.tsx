'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Share, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database } from '@/types/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import dynamic from 'next/dynamic';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Target = Database['public']['Tables']['targets']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface TargetDetailsClientProps {
  target: Target;
  userId: string | undefined;
  milestones: Milestone[];
}

function TargetDetailsClient({ target, userId, milestones }: TargetDetailsClientProps) {
  const [ownerNames, setOwnerNames] = useState<Record<string, string>>({});
  const supabase = createClientComponentClient<Database>();
  const [showMilestones, setShowMilestones] = useState(true);
  const [showProjected, setShowProjected] = useState(true);

  const baselineValue = parseFloat(target.baseline_value);
  const targetValue = parseFloat(target.target_value);

  const chartData = [
    { x: target.baseline_year, y: baselineValue },
    { x: target.target_year, y: targetValue },
  ];

  const milestoneData = milestones.map(milestone => ({
    x: new Date(milestone.period_end).getFullYear(),
    y: baselineValue + (targetValue - baselineValue) * 
       ((new Date(milestone.period_end).getFullYear() - target.baseline_year) / 
        (target.target_year - target.baseline_year))
  }));

  const currentYear = new Date().getFullYear();
  const projectedValue = baselineValue + (targetValue - baselineValue) * 
                         ((currentYear - target.baseline_year) / 
                          (target.target_year - target.baseline_year));

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    stroke: {
      curve: 'straight',
      width: 2,
    },
    colors: ['#4e79a7', '#82ca9d', '#ff9900'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: '#4e79a7', opacity: 1 },
          { offset: 100, color: '#DDEBFF', opacity: 1 },
        ]
      }
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 2,
      labels: {
        formatter: (value) => Math.round(Number(value)).toString()
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => Math.round(value).toString()
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => Math.round(value).toString()
      }
    },
    grid: { show: false },
    legend: { show: false }
  };

  const series = [
    { name: "Target", data: chartData },
    ...(showMilestones ? [{ name: "Milestones", type: 'scatter', data: milestoneData }] : []),
    ...(showProjected ? [{ name: "Projected", data: [
      { x: target.baseline_year, y: baselineValue },
      { x: currentYear, y: projectedValue },
      { x: target.target_year, y: targetValue }
    ] }] : [])
  ];

  useEffect(() => {
    async function fetchOwnerNames() {
      const ownerIds = milestones.map(m => m.owner).filter(Boolean) as string[];
      if (ownerIds.length === 0) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, firstname, lastname')
        .in('id', ownerIds);

      if (error) {
        console.error('Error fetching owner names:', error);
      } else if (data) {
        const names: Record<string, string> = {};
        data.forEach(profile => {
          names[profile.id] = `${profile.firstname} ${profile.lastname}`.trim();
        });
        setOwnerNames(names);
      }
    }

    fetchOwnerNames();
  }, [milestones, supabase]);

  const currentValue = target.current_value || parseFloat(target.baseline_value);
  const reductionToDate = ((parseFloat(target.baseline_value) - currentValue) / parseFloat(target.baseline_value)) * 100;

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
            </Button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{target.target_name}</h1>
          <div className="space-x-2">
            <Button variant="outline">Edit</Button>
            <Button variant="outline">Delete</Button>
            <Button variant="outline">Share</Button>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{target.datapoint}</p>
        <Badge variant="secondary" className="mb-6">In Progress</Badge>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Data Point</h3>
              <p>{target.datapoint}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Target Type</h3>
              <p>{target.target_type}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Baseline</h3>
              <p>{target.baseline_value} ({target.baseline_year})</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Target</h3>
              <p>{target.target_value} ({target.target_year})</p>
            </CardContent>
          </Card>
            </div>

        <h2 className="text-xl font-semibold mb-4">Milestones</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{new Date(milestone.period_end).getFullYear()} {milestone.required ? '(required)' : ''}</h3>
                <p className="text-sm text-gray-600">Owner: {ownerNames[milestone.owner || ''] || 'Unassigned'}</p>
                <p className="text-sm text-gray-600">Due: {milestone.period_end}</p>
                <Badge variant={milestone.status === 'In Progress' ? 'secondary' : 'outline'} className="mt-2">
                  {milestone.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mb-6">
              <Plus className="mr-2 h-4 w-4" /> Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Milestone</DialogTitle>
            </DialogHeader>
            {/* Add form for new milestone here */}
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Progress Chart</h2>
            <div className="flex space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-milestones"
                  checked={showMilestones}
                  onCheckedChange={setShowMilestones}
                />
                <Label htmlFor="show-milestones">Show Milestones</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-projected"
                  checked={showProjected}
                  onCheckedChange={setShowProjected}
                />
                <Label htmlFor="show-projected">Show Projected</Label>
              </div>
            </div>
            <Chart options={options} series={series} type="line" height={350} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Current Emissions</h3>
                    <p className="text-2xl font-bold">{currentValue} tons</p>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Update</Button>
        </div>
            </div>
                <p className={reductionToDate > 0 ? "text-green-500 mt-2" : "text-red-500 mt-2"}>
                  {reductionToDate > 0 ? <TrendingUp className="inline mr-1" /> : <TrendingDown className="inline mr-1" />}
                  {Math.abs(reductionToDate).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold">Reduction to Date</h3>
                <p className="text-2xl font-bold">{reductionToDate.toFixed(2)}%</p>
                <p className="text-green-500 mt-2">
                  <TrendingUp className="inline mr-1" />
                  {reductionToDate.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
            </div>
  );
}

export default TargetDetailsClient;