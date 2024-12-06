(function() {
    const BACKEND_API_URL = 'http://localhost:5000/api/youtube';

    function sendDataToBackend() {
        try {
            const titleElement = document.querySelector('h1.ytd-watch-metadata');
            const videoTitle = titleElement ? titleElement.textContent.trim() : '';

            const viewCountElement = document.querySelector('.ytd-watch-metadata .view-count');
            const viewCount = viewCountElement ? viewCountElement.textContent.trim() : '';

            const channelElement = document.querySelector('ytd-channel-name a');
            const channelName = channelElement ? channelElement.textContent.trim() : '';

            const payload = {
                videoTitle,
                viewCount,
                channelName,
                timestamp: new Date().toISOString()
            };

            fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log('Data successfully sent to backend');
            })
            .catch(error => {
                console.error('Error sending data to backend:', error);
            });
        } catch (error) {
            console.error('Error in sendDataToBackend:', error);
        }
    }

    function setupMutationObserver() {
        const targetNode = document.body;
        const config = { 
            childList: true, 
            subtree: true 
        };

        let lastUrl = window.location.href;
        const observer = new MutationObserver((mutationsList, observer) => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                
                setTimeout(() => {
                    sendDataToBackend();
                }, 1000);
            }
        });

        observer.observe(targetNode, config);
    }

    function init() {
        sendDataToBackend();
        setupMutationObserver();
    }

    init();
})();