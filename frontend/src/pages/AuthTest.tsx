import React, { useState } from 'react';
import { checkAuthConfig } from '../utils/debug';

const AuthTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  
  const runTests = async () => {
    const results: any[] = [];
    
    // Test 1: Check environment configuration
    const config = checkAuthConfig();
    results.push({
      test: 'Environment Configuration',
      status: 'info',
      details: config
    });
    
    // Test 2: Check API health
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const healthUrl = apiUrl.replace('/api', '/health');
      const response = await fetch(healthUrl);
      const data = await response.json();
      results.push({
        test: 'API Health Check',
        status: response.ok ? 'success' : 'error',
        details: data
      });
    } catch (error) {
      results.push({
        test: 'API Health Check',
        status: 'error',
        details: error
      });
    }
    
    // Test 3: Check Google OAuth endpoint
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const authUrl = `${apiUrl}/auth/google`;
      await fetch(authUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      results.push({
        test: 'Google OAuth Endpoint',
        status: 'info',
        details: `Endpoint URL: ${authUrl}`,
        note: 'This should redirect to Google OAuth when accessed directly'
      });
    } catch (error) {
      results.push({
        test: 'Google OAuth Endpoint',
        status: 'error',
        details: error
      });
    }
    
    setTestResults(results);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        <button
          onClick={runTests}
          className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Run Authentication Tests
        </button>
        
        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">{result.test}</h3>
                <pre className="text-sm overflow-auto bg-white p-2 rounded">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
                {result.note && (
                  <p className="text-sm text-gray-600 mt-2">{result.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Manual Test Links:</h2>
          <ul className="space-y-2">
            <li>
              <a
                href={checkAuthConfig().authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Direct Google OAuth Link (opens in new tab)
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="text-blue-600 hover:underline"
              >
                Back to Login Page
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;