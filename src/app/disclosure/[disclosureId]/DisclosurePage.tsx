import React from 'react';

interface DisclosurePageProps {
    data: any[]; // Assuming data is an array, adjust if needed
}

function DisclosurePage({ data }: DisclosurePageProps) {
    const renderDataPoint = (datapoint: any) => {
        // Rendering logic for other types
        // Replace this with your actual rendering logic
        return <div>{JSON.stringify(datapoint)}</div>;
    };

    return (
        <div>
            {data.map((datapoint, index) => (
                <div key={index}>
                    {renderDataPoint(datapoint)}
                </div>
            ))}
        </div>
    );
}

export default DisclosurePage;