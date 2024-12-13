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

    async function updateUserInterests() {
      try {
        let prompt = `Generate 50+ (or more) specific and relevant words associated with the following interests:  ${interests.join(',')}  

Respond with a concise, comma-separated list of words, avoiding any additional text or formatting.  

Exclude generic terms or phrases that could fit multiple categories, such as: 'project ideas', 'beginner', 'intermediate', 'advanced', 'tips and tricks', 'best practices', 'troubleshooting', 'case studies', 'examples', 'step by step', 'for beginners', 'easy', 'simple', 'complex', 'challenges', 'effects'.  

Focus on unique, context-specific terms that are directly tied to the provided interests. For example:  
- If the interest is **music**, return words like (make sure to include the following words also): 'melody', 'rhythm', 'song', 'songs', 'instrumentation', 'guitar', 'chorus', 'symphony'.  
- If the interest is **programming**, return words like (make sure to include the following words also): 'coding', 'javascript', 'python', 'react', 'c++', 'algorithm', 'debugging'.  
- If the interest is **AI**, return words like (make sure to include the following words also): 'ai', 'deep learning', 'machine learning', 'artificial intelligence', 'neural networks', 'data science', 'natural language processing'.  

Only include words that are highly relevant and commonly used in the context of the given interest to ensure alignment with related YouTube video titles.`;  

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const recommendations = await model.generateContent(prompt);

        let response = recommendations.response.candidates[0].content.parts[0].text;
        response = response.split(',');
        if (response.length > 0 && response[response.length - 1].includes('\n')) {
          response[response.length - 1] = response[response.length - 1].replace('\n', '');
        }
        // save responce in lower case with pre interests
        response = response.map(interest => interest.toLowerCase().trim());
        response = response.concat(interests.map(interest => interest.toLowerCase()));

        user.interests = response;
        user.channelPreferences = channelPreferences;
        await user.save();
      } catch (error) {
        console.error(error);
      }
    }
    updateUserInterests();
    res.status(200).json({ message: "success" }); // Return success message
  } catch (error) {
    console.log(error);
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

    let filteredVideos = videoList.map(video => {
      for (let interest of user.interests) {
        if (video.title.toLowerCase().split(' ').includes(interest)) {
          console.log(video.title.toLowerCase() + "   -->   " + interest);
          return true;
        }
      }

      return false;
    });

    res.status(200).json({ array: filteredVideos });
  } catch (error) {
    res.status(500).json({ message: 'Error searching interests', error });
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