const axios = require('axios');

const searchVideos = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: 'Query required' });
        }

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q,
                key: process.env.YOUTUBE_API_KEY,
                type: 'video',
                maxResults: 10
            }
        });

        const results = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high.url
        }));

        res.json(results);
    } catch (err) {
        console.error('YouTube search error:', err.message);
        res.status(500).json({ message: 'YouTube search failed' });
    }
};

module.exports = { searchVideos };
