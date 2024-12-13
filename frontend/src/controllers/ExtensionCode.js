import { backendUrl } from '../environment.js';

export default function ExtensionCode(userId) {
    return (`// ==UserScript==
// @name         YouTube Content Personalization
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Track YouTube video data and manipulate it
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    const BACKEND_API_URL = '${backendUrl}/api/filter-videos';

    function sendDataToBackend(videoHtml) {
        if(!videoHtml.length || videoHtml.length === 0) {
            return;
        }
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
                userId: '${userId}',
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
                })
                .catch(error => {
                    if(error.message && error.message.includes('Failed to fetch')) {
                        videoHtml.forEach((video) => { 
                            video.style.display = 'inline-block';
                            video.checked = true;
                        });
                    }
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
    }

    function init() {
        setInterval(callBackendFunction, 3000);
        setupMutationObserver();
    }

    init();
})();`);
}