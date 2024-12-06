const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected successfully'))
// .catch(err => console.error('MongoDB connection error:', err));

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
    
    // Upsert user interests
    const userInterest = await UserInterest.findOneAndUpdate(
      { userId },
      { 
        interests, 
        channelPreferences 
      },
      { 
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true 
      }
    );

    res.status(200).json(userInterest);
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
    
    // Retrieve user interests
    const userInterest = await UserInterest.findOne({ userId });
    
    if (!userInterest) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter videos based on user interests
    const filteredVideos = videoList.filter(video => {
      const titleMatch = userInterest.interests.some(interest => 
        video.title.toLowerCase().includes(interest.toLowerCase())
      );
      
      const descriptionMatch = userInterest.interests.some(interest => 
        video.description.toLowerCase().includes(interest.toLowerCase())
      );

      return titleMatch || descriptionMatch;
    });

    res.status(200).json({
      original: videoList.length,
      filtered: filteredVideos.length,
      videos: filteredVideos
    });
  } catch (error) {
    res.status(500).json({ message: 'Error filtering videos', error });
  }
});

app.use('/api', router);

router.get('/youtube', (req, res) => {
  console.log(req.params);
  res.send('Hello World');
})
router.post('/youtube', (req, res) => {
  console.log(req.body);
  res.send('Hello World');
})

// YouTube API Integration
async function fetchYouTubeVideos(channelId, apiKey) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        channelId: channelId,
        maxResults: 50,
        key: apiKey
      }
    });

    return response.data.items.map(item => ({
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      videoId: item.id.videoId
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;