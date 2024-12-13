import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import ExtensionCode from '../controllers/ExtensionCode';
import { backendUrl } from '../environment.js';

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
	],
};

const UserInterestSelector = () => {
	const [selectedInterests, setSelectedInterests] = useState({});
	const [userId, setUserId] = useState('');
	const [jsCode, setJsCode] = useState();
	const [otherInterests, setOtherInterests] = useState([]);
	const [searchInput, setSearchInput] = useState('');

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

			let userIdref = userId || generateUserId();
			const response = await axios.post(`${backendUrl}/api/interests`, {
				userId: userIdref,
				interests: flatInterests
			});

			setJsCode(ExtensionCode(userIdref));
			alert('Interests saved successfully!');

			setTimeout(() => {
				window.scrollTo(0, 400);
			}, 1000);
		} catch (error) {
			console.error('Error saving interests:', error);
			alert('Failed to save interests');
		}
	};

	const searchOtherInterests = async () => {
		if(searchInput.trim() === '') {
			setOtherInterests([]);
			return;
		}
		try {
			const response = await axios.get(`${backendUrl}/api/search-interests`, {
				params: {
					query: searchInput.trim()
				}
			});

			console.log('Response from backend:', response.data);
			setOtherInterests(response.data);
		} catch (error) {
			console.error('Error searching for other interests:', error);
			alert('Failed to search for other interests');
		}
	};

	let handleButton = (e) => {
		e.target.style.backgroundColor = '#E5E7EB';
		e.target.style.cursor = 'not-allowed';
		e.target.disabled = true;
		setTimeout(() => {
			e.target.style.backgroundColor = '';
			e.target.style.cursor = 'pointer';
			e.target.disabled = false;
		}, 5000);
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
				<div className="flex items-center text-black">
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
				<div className="mb-4">
					<h3 className="text-xl font-medium mb-2">Other Interests</h3>
					<div className='p-2 flex items-center w-1/2 h-10 mb-2'>
						<input
							type="text"
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							className="flex-grow p-2 border rounded mr-2 text-black"
							placeholder="Search for other interests"
						/>
						<button
							onClick={(e) => {
								searchOtherInterests();
								setSearchInput('');
								handleButton(e);
							}}
							className="bg-blue-500 text-white px-4 py-2 rounded"
						>
							Search
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{otherInterests.map(interest => (
							<button
								key={interest}
								onClick={() => toggleInterest('Other', interest)}
								className={`
                    px-3 py-1 rounded-full text-sm 
                    ${(selectedInterests['Other'] || []).includes(interest)
											? 'bg-blue-500 text-white'
											: 'bg-gray-200 text-gray-700'}
                  `}
							>
								{interest}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Save Interests Button */}
			<button
				onClick={(e) => {
					handleButton(e);
					saveInterests();
				}}
				className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
			>
				Save My Interests
			</button>

			{jsCode && 
			<div className="mt-6 p-4 bg-gray-100 rounded">
				<div className="flex justify-between align-center">
					<h3 className="font-bold text-black">JavaScript Code Block:</h3>
					<p className="text-sm text-gray-600">
						Copy and use this code in Tempermonkey Extension.<br />
						Please read the documentation before proceeding.
					</p>
					<button
						onClick={() => {
							navigator.clipboard.writeText(jsCode)
							const summaryEl = document.createElement('div');
							summaryEl.innerHTML = `Copied code to clipboard.`;
							summaryEl.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #16A34A; padding: 10px; z-index: 1000; border-radius: 5px; color: white;';
							document.body.appendChild(summaryEl);

							// Remove summary after 5 seconds
							setTimeout(() => summaryEl.remove(), 3000);
						}}
						className="bg-blue-500 text-white px-4 py-2 rounded"
					>
						Copy Code
					</button>
				</div>
				<SyntaxHighlighter
					language="javascript"
					style={dracula}
					customStyle={{
						padding: "1rem",
						borderRadius: "8px",
						backgroundColor: "#282a36",
					}}
				>
					{jsCode}
				</SyntaxHighlighter>
			</div>
			}
		</div>
	);
};

export default UserInterestSelector;
