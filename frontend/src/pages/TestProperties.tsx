import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mexican-real-estate-ai.onrender.com/api';

const TestProperties: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching from:', `${API_URL}/properties`);
        const response = await axios.get(`${API_URL}/properties?limit=5`);
        console.log('Raw response:', response);
        console.log('Response data:', response.data);
        console.log('Properties:', response.data?.data?.properties);
        setData(response.data);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Properties Test</h1>
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-bold">Response Structure:</h2>
        <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
      </div>
      
      {data?.data?.properties && (
        <div>
          <h2 className="font-bold mb-2">Properties Array Check:</h2>
          <p>Is Array: {Array.isArray(data.data.properties) ? 'Yes' : 'No'}</p>
          <p>Length: {data.data.properties.length}</p>
          <p>Can slice: {typeof data.data.properties.slice === 'function' ? 'Yes' : 'No'}</p>
          
          <h2 className="font-bold mt-4 mb-2">Sliced Properties (first 2):</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(data.data.properties.slice(0, 2), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestProperties;