(function () {
    const BACKEND_API_URL = 'http://localhost:5000/api/filter-videos';

    function sendDataToBackend(videoHtml) {
        try {
            const videoList = videoHtml
                .map(videoEl => {
                    const titleEl = videoEl.querySelector('#video-title, .yt-core-attributed-string');
                    const title = titleEl ? titleEl.textContent.trim() : '';

                    const channelEl = videoEl.querySelector('#channel-name');
                    const channelName = channelEl ? channelEl.textContent.trim() : '';

                    return {
                        title,
                        channelName,
                    };
                })

            const payload = {
                videoList,
                userId: 'user_1'
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
                    return response.json();
                })
                .then(data => {
                    console.log('Response from backend:', data);
                    data.array.forEach((element, idx) => {
                        videoHtml[idx].style.display = element.includes('true') ? '' : 'none';
                        videoHtml[idx].checked = true;
                    });
                    console.log('Data successfully sent to backend');
                })
                .catch(error => {
                    videoHtml.forEach((video) => { 
                        video.style.display = 'inline-block';
                        video.checked = true;
                    });
                    console.error('Error sending data to backend:', error);
                });
        } catch (error) {
            console.error('Error in sendDataToBackend:', error);
        }
    }

    const callBackendFunction = () => {
        const videoHtml = Array.from(document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer'))
            .filter((video, idx) => video.style.display !== 'none' && !video.checked);
        videoHtml.forEach((video) => { video.style.display = 'none' });
        sendDataToBackend(videoHtml);
    };

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

                setTimeout(() => callBackendFunction(), 1000);
            }
        });

        observer.observe(targetNode, config);

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                callBackendFunction();
            }, 200);
        });
    }

    function init() {
        setTimeout(() => callBackendFunction(), 2000);
        setupMutationObserver();
    }

    init();
})();