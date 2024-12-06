function bookmarklet() {
    // Configuration - Replace with your actual backend URL and user token
    const API_ENDPOINT = 'http://localhost:5000/api/filter-videos';
    const USER_TOKEN = 'your_user_token_here';

    // Function to extract video information from the current page
    function extractVideoInfo() {
        const videos = Array.from(document.querySelectorAll('ytd-video-renderer, ytd-compact-video-renderer'))
            .map(videoEl => {
                const titleEl = videoEl.querySelector('#video-title');
                const title = titleEl ? titleEl.textContent.trim() : '';
                
                const channelEl = videoEl.querySelector('#channel-name');
                const channelName = channelEl ? channelEl.textContent.trim() : '';
                
                return {
                    title,
                    description: channelName, // Using channel name as description for simplicity 
                    channelId: videoEl.querySelector('a[href^="/channel/"]')?.getAttribute('href')?.replace('/channel/', '') || '' // channelId = ch
                };
            });
        return videos;
    }

    // Function to filter videos
    async function filterVideos() {
        try {
            const videoList = extractVideoInfo();
            
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: USER_TOKEN,
                    videoList
                })
            });

            const { filtered, videos: filteredVideos } = await response.json();

            // Hide uninteresting videos
            const allVideos = document.querySelectorAll('ytd-video-renderer, ytd-compact-video-renderer');
            allVideos.forEach(videoEl => {
                const titleEl = videoEl.querySelector('#video-title');
                const title = titleEl ? titleEl.textContent.trim() : '';
                
                const isInteresting = filteredVideos.some(vid => 
                    vid.title.toLowerCase() === title.toLowerCase()
                );

                videoEl.style.display = isInteresting ? '' : 'none';
            });

            // Optional: Add a filter summary
            const summaryEl = document.createElement('div');
            summaryEl.innerHTML = `Filtered out ${allVideos.length - filtered} videos based on your interests.`;
            summaryEl.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #f0f0f0; padding: 10px; z-index: 1000; border-radius: 5px;';
            document.body.appendChild(summaryEl);

            // Remove summary after 5 seconds
            setTimeout(() => summaryEl.remove(), 5000);

        } catch (error) {
            console.error('Video filtering error:', error);
            alert('Failed to filter videos. Please check your connection and user token.');
        }
    }

    // Run the filter
    filterVideos();
}