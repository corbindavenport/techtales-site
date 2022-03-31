async function loadRSS() {
    var response = await fetch('https://techtalesshow.com/mirror.rss');

    if (response.ok) {
        var text = await response.text();
        var parser = new DOMParser();
        var rss = parser.parseFromString(text, 'application/xml');
        return rss;
    } else {
        console.log("HTTP-Error: " + response.status);
        return null;
    }
}

async function init() {
    var rssFeed = await loadRSS();
    if (rssFeed) {
        // Add latest episode to home page
        if (document.getElementById('latest-episode-card')) {
            var latestEpisode = rssFeed.querySelector('item');
            var card = document.getElementById('latest-episode-card');
            console.log('Loaded episode details:', latestEpisode);
            // Set data
            card.querySelector('.card-title').innerText = latestEpisode.querySelector('title').innerHTML;
            card.querySelector('.card-text').innerText = latestEpisode.querySelector('description').innerHTML.split('\n')[0];
            card.querySelector('img').setAttribute('src', latestEpisode.querySelector('*[href*="artworks"]').getAttribute('href'));
        }
    }
}

init()