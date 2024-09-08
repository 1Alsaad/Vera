"use client"

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar } from 'react-chartjs-2'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, X } from 'lucide-react'

const DisclosurePage = () => {
    const params = useParams()
    const disclosureId = params?.disclosureId as string
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    // Placeholder data for demonstration
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Data',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: 'hsl(var(--primary))',
            },
        ],
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <aside className={`w-[500px] border-l bg-background transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold">Chat</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {disclosureId ? (
                            <p>Chat content for Disclosure {disclosureId}</p>
                        ) : (
                            <p className="text-muted-foreground">Pick a disclosure to show chat</p>
                        )}
                    </div>
                    <div className="p-4 border-t">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full p-2 border rounded"
                            disabled={!disclosureId}
                        />
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 space-y-8">
                <h1 className="text-2xl font-bold">Disclosure {disclosureId}</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Details about the disclosure go here.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Visualization</CardTitle>
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
                                        },
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Item 1</TableCell>
                                    <TableCell>Value 1</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Item 2</TableCell>
                                    <TableCell>Value 2</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                    <Button variant="default">
                        Primary Action
                    </Button>
                    <Button variant="outline" onClick={() => setIsSidebarOpen(true)}>
                        Open Chat
                    </Button>
                </div>
            </main>
        </div>
    )
}

export default DisclosurePage