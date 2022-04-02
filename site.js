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
    var defaultPlayerURL = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/EPISODEID&color=%23ff5500&inverse=false&show_user=true';
    // Initialize pages if the RSS feed loaded
    if (rssFeed) {
        if (document.getElementById('latest-episode-card')) {
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
        } else if (document.getElementById('episode-list')) {
            // Episode page
            var container = document.getElementById('episode-list');
            var episodes = rssFeed.querySelectorAll('item');
            episodes.forEach(function (episode) {
                var card = document.createElement('div');
                card.classList.add('card', 'mt-3');
                card.setAttribute('role', 'button')
                card.dataset.episodeId = episode.querySelector('guid').innerHTML.split('/')[1];
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
                card.addEventListener('click', function() {
                    var playerSrc = defaultPlayerURL.replace('EPISODEID', this.dataset.episodeId) + '&auto_play=true'
                    document.getElementById('player').setAttribute('src', playerSrc)
                })
                // Add card to container
                container.appendChild(card);
            })
            // Set player to most recent episode
            var recentEpisodeId = rssFeed.querySelector('guid').innerHTML.split('/')[1];
            document.getElementById('player').setAttribute('src', defaultPlayerURL.replace('EPISODEID', recentEpisodeId))
            // Remove loader icon
            document.getElementById('episode-loading-indicator').style.display = 'none';
        }
    }
}

init()