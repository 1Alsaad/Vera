"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "../components/ui/button"
import { Bar } from 'react-chartjs-2'
import { ChevronRight, Edit, Info, ArrowRight } from 'lucide-react'

const TopicPage = () => {
    const params = useParams()
    const router = useRouter()
    const { topicId } = params

    // Placeholder data for demonstration
    const chartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: 'Progress',
                data: [30, 50, 70, 90],
                backgroundColor: '#4F46E5',
            },
        ],
    }

    // Placeholder milestones data
    const milestones = [
        { id: 1, title: "Milestone 1", status: "In Progress", dueDate: "2023-12-31" },
        { id: 2, title: "Milestone 2", status: "Completed", dueDate: "2023-06-30" },
        { id: 3, title: "Milestone 3", status: "Planned", dueDate: "2024-03-31" },
    ]

    const handleMilestoneClick = (milestoneId: number) => {
        console.log(`Navigating to milestone ${milestoneId}`);
        router.push(`/milestone/${milestoneId}`);
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <aside className="w-64 border-r border-black dark:border-white bg-transparent p-4 hidden md:block">
                <nav className="space-y-3">
                    <a href="#" className="flex items-center text-[#4F46E5] dark:text-[#818CF8] hover:underline">
                        <ChevronRight className="w-5 h-5 mr-2" />
                        All Topics
                    </a>
                    {/* Add more navigation items */}
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 space-y-8">
                <h1 className="text-2xl font-bold font-poppins">Topic: {topicId}</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-transparent border border-black dark:border-white rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-poppins">Topic Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-manrope text-base">This topic covers important sustainability aspects...</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-transparent border border-black dark:border-white rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-poppins">Progress Tracking</CardTitle>
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
                                            text: 'Topic Progress',
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

                <section>
                    <h2 className="text-xl font-bold font-poppins mb-4">Milestones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {milestones.map((milestone) => (
                            <Button
                                key={milestone.id}
                                variant="outline"
                                className="p-0 h-auto w-full"
                                onClick={() => handleMilestoneClick(milestone.id)}
                            >
                                <Card 
                                    className="w-full bg-transparent border border-black dark:border-white rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                >
                                    <CardHeader>
                                        <CardTitle className="text-lg font-poppins flex justify-between items-center">
                                            {milestone.title}
                                            <ArrowRight className="w-5 h-5" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-manrope text-sm mb-2">Due: {milestone.dueDate}</p>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                            milestone.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {milestone.status}
                                        </span>
                                    </CardContent>
                                </Card>
                            </Button>
                        ))}
                    </div>
                </section>

                <div className="flex justify-end space-x-4">
                    <Button 
                        variant="outline" 
                        className="border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white dark:border-[#818CF8] dark:text-[#818CF8] dark:hover:bg-[#818CF8] dark:hover:text-[#1F2937] transition-colors duration-200"
                    >
                        <Info className="w-5 h-5 mr-2" />
                        More Info
                    </Button>
                    <Button 
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white dark:bg-[#818CF8] dark:hover:bg-[#6366F1] transition-colors duration-200"
                    >
                        <Edit className="w-5 h-5 mr-2" />
                        Edit Topic
                    </Button>
                </div>
            </main>
        </div>
    )
}

export default TopicPage