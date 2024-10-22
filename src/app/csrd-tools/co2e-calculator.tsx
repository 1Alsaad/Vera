'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CO2eCalculator = () => {
  const [scope1, setScope1] = useState({
    stationaryCombustion: {
      naturalGas: { value: 0, unit: 'm3' },
      diesel: { value: 0, unit: 'L' },
      fuelOil: { value: 0, unit: 'L' },
      propane: { value: 0, unit: 'L' },
      coal: { value: 0, unit: 'kg' },
      wood: { value: 0, unit: 'kg' },
      biogas: { value: 0, unit: 'm3' },
    },
    mobileCombustion: {
      gasoline: { value: 0, unit: 'L' },
      diesel: { value: 0, unit: 'L' },
      propane: { value: 0, unit: 'L' },
      biodiesel: { value: 0, unit: 'L' },
      ethanol: { value: 0, unit: 'L' },
      cng: { value: 0, unit: 'm3' },
      lng: { value: 0, unit: 'L' },
    },
    processEmissions: {
      cement: { value: 0, unit: 'kg' },
      steel: { value: 0, unit: 'kg' },
      ammonia: { value: 0, unit: 'kg' },
      nitricAcid: { value: 0, unit: 'kg' },
      adipicAcid: { value: 0, unit: 'kg' },
      urea: { value: 0, unit: 'kg' },
      lime: { value: 0, unit: 'kg' },
      carbonates: { value: 0, unit: 'kg' },
    },
    fugitiveEmissions: {
      refrigerants: {
        r22: { value: 0, unit: 'kg' },
        r134a: { value: 0, unit: 'kg' },
        r404a: { value: 0, unit: 'kg' },
        r410a: { value: 0, unit: 'kg' },
        r507: { value: 0, unit: 'kg' },
      },
      fireSuppressants: {
        co2: { value: 0, unit: 'kg' },
        halon1301: { value: 0, unit: 'kg' },
      },
      sf6: { value: 0, unit: 'kg' },
      n2o: { value: 0, unit: 'kg' },
    },
  });

  const [scope2, setScope2] = useState({
    electricity: { value: 0, unit: 'kWh' },
    steam: { value: 0, unit: 'kg' },
    heating: { value: 0, unit: 'kWh' },
    cooling: { value: 0, unit: 'kWh' },
  });

  const [scope3, setScope3] = useState({
    businessTravel: { value: 0, unit: 'km' },
    employeeCommuting: { value: 0, unit: 'km' },
    wasteGeneration: { value: 0, unit: 'kg' },
    purchasedGoods: { value: 0, unit: 'units' },
    transportation: { value: 0, unit: 'km' },
    investments: { value: 0, unit: 'USD' },
  });

  const calculateTotalEmissions = () => {
    // This is a simplified calculation. In a real-world scenario, you'd need to use proper emission factors for each source.
    const scope1Total = Object.values(scope1).reduce((total, category) => {
      return total + Object.values(category).reduce((categoryTotal, subcategory) => {
        if (typeof subcategory === 'object' && 'value' in subcategory) {
          return categoryTotal + subcategory.value;
        }
        return categoryTotal + Object.values(subcategory).reduce((subTotal, item) => subTotal + item.value, 0);
      }, 0);
    }, 0);

    const scope2Total = 
      scope2.electricity.value * 0.5 + 
      scope2.steam.value * 0.2 +
      scope2.heating.value * 0.3 +
      scope2.cooling.value * 0.4;

    const scope3Total = 
      scope3.businessTravel.value * 0.2 + 
      scope3.employeeCommuting.value * 0.1 + 
      scope3.wasteGeneration.value * 0.3 + 
      scope3.purchasedGoods.value * 0.5 +
      scope3.transportation.value * 0.15 +
      scope3.investments.value * 0.01;

    return {
      scope1: scope1Total,
      scope2: scope2Total,
      scope3: scope3Total,
      total: scope1Total + scope2Total + scope3Total
    };
  };

  const emissions = calculateTotalEmissions();

  const renderInputs = (scope: any, setScope: React.Dispatch<React.SetStateAction<any>>, path: string[] = []) => {
    return Object.entries(scope).map(([key, value]: [string, any]) => {
      const currentPath = [...path, key];
      if (typeof value === 'object' && !('value' in value)) {
        return (
          <Accordion type="single" collapsible className="mb-4" key={key}>
            <AccordionItem value={key}>
              <AccordionTrigger>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</AccordionTrigger>
              <AccordionContent>
                {renderInputs(value, setScope, currentPath)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      }
      return (
        <div key={currentPath.join('.')} className="mb-4">
          <Label htmlFor={currentPath.join('.')} className="mb-2 block">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Label>
          <div className="flex space-x-2">
            <Input
              id={currentPath.join('.')}
              type="number"
              value={value.value}
              onChange={(e) => {
                const newScope = { ...scope };
                let current = newScope;
                for (let i = 0; i < currentPath.length - 1; i++) {
                  current = current[currentPath[i]];
                }
                current[currentPath[currentPath.length - 1]] = { 
                  ...current[currentPath[currentPath.length - 1]], 
                  value: parseFloat(e.target.value) || 0 
                };
                setScope(newScope);
              }}
              className="flex-grow"
            />
            <Select
              value={value.unit}
              onValueChange={(newUnit) => {
                const newScope = { ...scope };
                let current = newScope;
                for (let i = 0; i < currentPath.length - 1; i++) {
                  current = current[currentPath[i]];
                }
                current[currentPath[currentPath.length - 1]] = { 
                  ...current[currentPath[currentPath.length - 1]], 
                  unit: newUnit 
                };
                setScope(newScope);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue>{value.unit}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={value.unit}>{value.unit}</SelectItem>
                {/* Add more units as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">CO2e Calculator</h1>

      <Tabs defaultValue="scope1" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scope1">Scope 1</TabsTrigger>
          <TabsTrigger value="scope2">Scope 2</TabsTrigger>
          <TabsTrigger value="scope3">Scope 3</TabsTrigger>
        </TabsList>
        <TabsContent value="scope1">
          <Card>
            <CardHeader>
              <CardTitle>Scope 1 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              {renderInputs(scope1, setScope1)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scope2">
          <Card>
            <CardHeader>
              <CardTitle>Scope 2 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              {renderInputs(scope2, setScope2)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scope3">
          <Card>
            <CardHeader>
              <CardTitle>Scope 3 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              {renderInputs(scope3, setScope3)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Total Emissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Scope 1: {emissions.scope1.toFixed(2)} kg CO2e</Label>
              <Progress value={(emissions.scope1 / emissions.total) * 100} className="mt-2" />
            </div>
            <div>
              <Label>Scope 2: {emissions.scope2.toFixed(2)} kg CO2e</Label>
              <Progress value={(emissions.scope2 / emissions.total) * 100} className="mt-2" />
            </div>
            <div>
              <Label>Scope 3: {emissions.scope3.toFixed(2)} kg CO2e</Label>
              <Progress value={(emissions.scope3 / emissions.total) * 100} className="mt-2" />
            </div>
            <div className="pt-4 border-t">
              <Label className="text-lg font-bold">Total: {emissions.total.toFixed(2)} kg CO2e</Label>
              <Slider
                value={[emissions.total]}
                max={Math.max(emissions.total, 1000)}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CO2eCalculator;