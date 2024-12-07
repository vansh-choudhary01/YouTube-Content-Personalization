const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Interest Schema
const UserInterestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  interests: [{
    type: String
  }],
  channelPreferences: [{
    channelId: String,
    weight: {
      type: Number,
      default: 1.0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserInterest = mongoose.model('UserInterest', UserInterestSchema);

// Routes
const router = express.Router();

// Create/Update User Interests
router.post('/interests', async (req, res) => {
  try {
    const { userId, interests, channelPreferences } = req.body;

    let user = await UserInterest.findOne({ userId });
    if (!user) {
      user = new UserInterest({ userId });
    }

    user.interests = interests;
    user.channelPreferences = channelPreferences;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error saving interests', error });
  }
});

// Get User Interests
router.get('/interests/:userId', async (req, res) => {
  try {
    const userInterest = await UserInterest.findOne({ 
      userId: req.params.userId 
    });

    if (!userInterest) {
      return res.status(404).json({ message: 'User interests not found' });
    }

    res.status(200).json(userInterest);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving interests', error });
  }
});

// YouTube Content Filtering Endpoint
router.post('/filter-videos', async (req, res) => {
  try {
    const { userId, videoList } = req.body;

    const user = await UserInterest.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const prompt = `YouTube Content Personalization
    
    You are a YouTube content personalization assistant. 
    Your task is to recommend videos based on the user's interests.
    
    Here are the user's interests if interests is exists:
    ${user.interests.map(interest => `- ${interest}`).join('\n')}
      
    Here are the videos that you can recommend if videos is exists:
    ${videoList.map(video => `- ${video.title}`).join('\n')}
    
    respond with a comma separated list of video (true/false) values, where true indicates that the video should be recommended, and false indicates that it should not be recommended.
    For example: true,false,true,false,true
    don't include any other text in your response.
    if you confuse then respond with false,false,... interests.length times
    `;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const recommendations = await model.generateContent(prompt);

    let response = recommendations.response.candidates[0].content.parts[0].text;
    response = response.split(',');
    if (response.length > 0 && response[response.length - 1].includes('\n')) {
      response[response.length - 1] = response[response.length - 1].replace('\n', '');
    }
    console.log(response);
    if (response.length !== user.interests.length) {
      response = response.concat(
        Array(Math.max(user.interests.length - response.length, 0)).fill('false')
      );
    }

    res.status(200).json({ array: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error filtering videos', error });
  }
});

router.get('/search-interests', async (req, res) => {
  try {
    const { query } = req.query;

    const prompt = `Suggest some categories of interests that are related to the following query:
    ${query}
    respond with a comma separated list of interests, don't include any other text in your response.
    if you confuse then respond with a comma separated list of interests that are not related to the query.
    don't include any extra space except between the interest name if any interest name is more then one word then use space to separate the words then capitalize the first character of every word.
    `;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const recommendations = await model.generateContent(prompt);

    let response = recommendations.response.candidates[0].content.parts[0].text;
    response = response.split(',');
    if (response.length > 0 && response[response.length - 1].includes('\n')) {
      response[response.length - 1] = response[response.length - 1].replace('\n', '');
    }
    console.log(response);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error searching interests', error });
  }
});

app.use('/api', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;