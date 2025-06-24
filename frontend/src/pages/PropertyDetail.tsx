import React from 'react';
import { useParams } from 'react-router-dom';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Property Detail - ID: {id}</h1>
        <p className="text-gray-600 mt-4">Property detail page coming soon...</p>
      </div>
    </div>
  );
};

export default PropertyDetail;