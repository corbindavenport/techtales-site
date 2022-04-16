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

function loadEpisodes(rssFeed) {
    var defaultPlayerURL = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/EPISODEID&color=%23444&inverse=true&show_user=true';
    var container = document.getElementById('episode-list');
    var episodes = rssFeed.querySelectorAll('item');
    episodes.forEach(function (episode) {
        var card = document.createElement('div');
        card.classList.add('card', 'mt-3');
        card.setAttribute('role', 'button');
        card.dataset.episodeId = episode.querySelector('guid').innerHTML.split('/')[1];
        card.dataset.episodeUrl = episode.querySelector('item link').innerHTML;
        // Create card
        card.innerHTML = `
        <div class="row g-0">
            <div class="col-4 col-md-2">
                <img loading="lazy" src="` + episode.querySelector('*[href*="artworks"]').getAttribute('href') + `" class="img-fluid rounded-start" alt="Episode artwork">
            </div>
            <div class="col-8 col-md-10">
                <div class="card-body">
                    <h5 class="card-title">` + episode.querySelector('title').innerHTML + `</h5>
                    <p class="card-text">` + episode.querySelector('description').innerHTML.split('\n')[0] + `</p>
                </div>
            </div>
        </div>
        `;
        // Change episode when card is clicked
        card.addEventListener('click', async function() {
            var playerSrc = defaultPlayerURL.replace('EPISODEID', this.dataset.episodeId) + '&auto_play=true';
            document.getElementById('player').setAttribute('src', playerSrc);
            document.body.dataset.activeEpisodeUrl = this.dataset.episodeUrl;
        })
        // Add card to container
        container.appendChild(card);
    })
    // Set player to most recent episode
    var recentEpisodeId = rssFeed.querySelector('guid').innerHTML.split('/')[1];
    document.getElementById('player').setAttribute('src', defaultPlayerURL.replace('EPISODEID', recentEpisodeId));
    document.body.dataset.activeEpisodeUrl = rssFeed.querySelector('item link').innerHTML;
    // Add event listener for Reddit button
    document.getElementById('reddit-btn').addEventListener('click', function() {
        episodeLink = encodeURIComponent(document.body.dataset.activeEpisodeUrl)
        window.open('https://www.reddit.com/search/?q=subreddit%3ATechTalesPodcast%20url%3A' + episodeLink + '&sort=new', '_blank')
    })
    // Remove loader icon
    document.getElementById('episode-loading-indicator').style.display = 'none';
}

function loadLatestEpisode(rssFeed) {
    // Update contents of latest episode card
    var latestEpisode = rssFeed.querySelector('item');
    var card = document.getElementById('latest-episode-card');
    console.log('Loaded episode details:', latestEpisode);
    card.querySelector('.card-title').innerText = latestEpisode.querySelector('title').innerHTML;
    card.querySelector('.card-text').innerText = latestEpisode.querySelector('description').innerHTML.split('\n')[0];
    card.querySelector('img').setAttribute('src', latestEpisode.querySelector('*[href*="artworks"]').getAttribute('href'));
    // Add click link for latest episode card
    card.addEventListener('click', function() {
        window.location = 'episodes.html'
    })
}

async function init() {
    var rssFeed = await loadRSS();
    // Initialize pages if the RSS feed loaded
    if (rssFeed) {
        if (document.getElementById('latest-episode-card')) {
            loadLatestEpisode(rssFeed);
        } else if (document.getElementById('episode-list')) {
            loadEpisodes(rssFeed);
        }
    }
}

init()