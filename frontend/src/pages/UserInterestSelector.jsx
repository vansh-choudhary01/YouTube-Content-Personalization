import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Categories and Subcategories
const CATEGORIES = {
  Technology: [
    'Web Development', 
    'Artificial Intelligence', 
    'Cybersecurity', 
    'Gadgets', 
    'Programming'
  ],
  Science: [
    'Astronomy', 
    'Biology', 
    'Physics', 
    'Environmental Science', 
    'Robotics'
  ],
  Entertainment: [
    'Movies', 
    'Music', 
    'Gaming', 
    'Comedy', 
    'Documentaries'
  ]
};

const UserInterestSelector = () => {
  const [selectedInterests, setSelectedInterests] = useState({});
  const [userId, setUserId] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');

  // Generate unique user ID
  const generateUserId = () => {
    const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(newUserId);
    return newUserId;
  };

  // Toggle interest selection
  const toggleInterest = (category, interest) => {
    setSelectedInterests(prev => {
      const currentInterests = prev[category] || [];
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter(item => item !== interest)
        : [...currentInterests, interest];
      
      return {
        ...prev,
        [category]: newInterests
      };
    });
  };

  // Save user interests
  const saveInterests = async () => {
    try {
      // Flatten interests
      const flatInterests = Object.values(selectedInterests).flat();
      
      const response = await axios.post('http://localhost:5000/api/interests', {
        userId: userId || generateUserId(),
        interests: flatInterests
      });

      // Generate a token (could be the user ID or a separate generated token)
      setGeneratedToken(response.data._id || userId);

      alert('Interests saved successfully!');
    } catch (error) {
      console.error('Error saving interests:', error);
      alert('Failed to save interests');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        YouTube Content Personalization
      </h1>

      {/* User ID Display */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">
          Your Unique User ID:
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={userId || ''}
            readOnly
            className="flex-grow p-2 border rounded mr-2"
            placeholder="Click Generate to create ID"
          />
          <button 
            onClick={generateUserId}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Generate ID
          </button>
        </div>
      </div>

      {/* Interest Selection */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          Select Your Interests
        </h2>
        {Object.entries(CATEGORIES).map(([category, interests]) => (
          <div key={category} className="mb-4">
            <h3 className="text-xl font-medium mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(category, interest)}
                  className={`
                    px-3 py-1 rounded-full text-sm 
                    ${(selectedInterests[category] || []).includes(interest) 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'}
                  `}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Interests Button */}
      <button 
        onClick={saveInterests}
        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
      >
        Save My Interests
      </button>

      {/* Generated Token Display */}
      {generatedToken && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Your Personalization Token:</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={generatedToken}
              readOnly
              className="flex-grow p-2 border rounded mr-2 bg-white"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(generatedToken)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Use this token in your YouTube content filter extension
          </p>
        </div>
      )}
    </div>
  );
};

export default UserInterestSelector;
