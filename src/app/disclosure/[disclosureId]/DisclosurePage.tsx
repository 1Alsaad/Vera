"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar } from 'react-chartjs-2'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, Edit, Save } from 'lucide-react'

const DisclosurePage = () => {
    const params = useParams()
    const { disclosureId } = params

    // Placeholder data for demonstration
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Data',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: '#4F46E5',
            },
        ],
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#DDEBFF] dark:bg-gray-900 text-[#1F2937] dark:text-gray-100">
            <aside className="w-64 border-r border-black dark:border-white bg-transparent p-4 hidden md:block">
                {/* Sidebar content */}
                <nav className="space-y-3">
                    <a href="#" className="flex items-center text-[#4F46E5] dark:text-[#818CF8] hover:underline">
                        <ChevronRight className="w-5 h-5 mr-2" />
                        Dashboard
                    </a>
                    {/* Add more navigation items */}
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#DDEBFF] dark:bg-gray-900">
                <h1 className="text-2xl font-bold font-poppins">Disclosure {disclosureId}</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-transparent border border-black dark:border-white rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-poppins">Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-manrope text-base">Details about the disclosure go here.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-transparent border border-black dark:border-white rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-poppins">Data Visualization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top' as const,
                                        },
                                        title: {
                                            display: true,
                                            text: 'Disclosure Data',
                                            font: {
                                                family: 'Poppins',
                                                size: 16
                                            }
                                        },
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-transparent border border-black dark:border-white rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-poppins">Detailed Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-poppins">Category</TableHead>
                                    <TableHead className="font-poppins">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-manrope">Item 1</TableCell>
                                    <TableCell className="font-manrope">Value 1</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-manrope">Item 2</TableCell>
                                    <TableCell className="font-manrope">Value 2</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                    <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Primary Action
                    </Button>
                    <Button 
                        className="border-indigo-600 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900"
                    >
                        Secondary Action
                    </Button>
                </div>
            </main>
        </div>
    )
}

export default DisclosurePage