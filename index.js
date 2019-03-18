const config = require('./config.json');
const j = require('request').jar();
const request = require('request').defaults({
  timeout: 10000,
  jar: j,
});
const log = require('./logger.js');
const fs = require('fs');
const moment = require('moment');

const proxyList = [];
const dates = [];
const dayName = [];
const hasShowtime = [];
const zip = config.zip
let movieLink = config.movieLink
let webhook = formatWH(config.webhook)

function formatProxy(proxy) { // ty hunter
    if (proxy && ['localhost', ''].indexOf(proxy) < 0) {
        proxy = proxy.replace(' ', '_');
        const proxySplit = proxy.split(':');
        if (proxySplit.length > 3)
            return "http://" + proxySplit[2] + ":" + proxySplit[3] + "@" + proxySplit[0] + ":" + proxySplit[1];
        else
            return "http://" + proxySplit[0] + ":" + proxySplit[1];
    }
    else
        return undefined;
}
function main() {
    const proxyInput = fs.readFileSync('proxies.txt').toString().split('\n'); // more of hunter's code
    const proxyList = [];
    for (let p = 0; p < proxyInput.length; p++) {
        proxyInput[p] = proxyInput[p].replace('\r', '').replace('\n', '');
        if (proxyInput[p] != '')
            proxyList.push(proxyInput[p]);
    }
    log('Found ' + proxyList.length + ' proxies.', 'success')
    log('---------------------------------------------------', 'log')
    log('------------Fandango Monitor made by:--------------', 'log')
    log('------------Discord: @cactus jack#0001-------------', 'log')
    log('------------Twitter: @stroworld--------------------', 'log')
    log('---------------------------------------------------', 'log')
    if (movieLink.includes('/movie-overview')) {
        getMovieDetails()
    } else {
        if (movieLink.charAt(movieLink.length-1) === '/') {
            movieLink = movieLink + 'movie-overview'
            getMovieDetails()
        } else {
            movieLink = movieLink + '/movie-overview'
            getMovieDetails()
        }
    }
}
function formatWH(url) {
    if (url.includes('/slack') && url.includes('discordapp')) {
      return url
    }
    if (url.includes('discordapp')) {
      return url + '/slack'
    }
    if (url.includes('slack.com')) {
      return url
    }
    return ''
}
function getMovieDetails() {
    fs.writeFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Getting movie details...` + '\n', 'utf-8')
    log('Getting movie details...', 'log')
    request({
        url: movieLink,
        method: 'GET',
        headers: {
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9'
        },
        gzip: true,
        json: false,
        proxy: formatProxy(proxyList[Math.floor(Math.random() * proxyList.length)])
    }, function (e, r, b) {
        if (e) {
            log('Request error getting movie details...', 'error')
            setTimeout(function () {
                getMovieDetails()
            }, config.retryDelay)
            return;
        }
        if (r.statusCode === 200) {
            let movieImage = 'https:' + b.split('<img class="movie-details__movie-img visual-thumb" src="')[1].split('"')[0];
            let movieTitle = b.split('<meta property="twitter:title" content="')[1].split('"')[0];
            monitor(movieImage, movieTitle)
        } else {
            log('Error getting movie details...', 'error')
            setTimeout(function () {
                getMovieDetails()
            }, config.retryDelay)
            return;
        }
    });
}

function monitor(movieImage, movieTitle) {
    const movLink = movieLink.split('https://www.fandango.com/')[1].split('/')[0];
    log('Retrieving movie times...', 'log')
    fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Retrieving movie times...` + '\n', 'utf-8')
    request({
        url: `https://www.fandango.com/napi/movieCalendar/${movLink}?isdesktop=true&zip=${zip}`,
        method: 'GET',
        headers: {
            'accept': '*/*',
            'x-requested-with': 'XMLHttpRequest',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'referer': movieLink
        },
        gzip: true,
        json: true,
        proxy: formatProxy(proxyList[Math.floor(Math.random() * proxyList.length)])
    }, function (e, r, b) {
        if (e) {
            log('Request error retrieving movie times...', 'error')
            fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [ERR] Request error retrieving movie times...` + '\n', 'utf-8')
            setTimeout(function () {
                monitor(movieImage, movieTitle)
            }, config.retryDelay)
            return;
        }
        if (r.statusCode === 200) {
            if (b.error !== null) {
                fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] ` + JSON.stringify(b) + '\n', 'utf-8')
                log('Unable to retrieve movie info...', 'log')
                log('Tickets are not available...', 'log')
                fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Unable to retrieve movie info...` + '\n', 'utf-8')
                fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Tickets are not available...` + '\n', 'utf-8')
                setTimeout(function () {
                    monitor(movieImage, movieTitle)
                }, config.retryDelay)
                return;
            } else {
                fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Movie times available...` + '\n', 'utf-8')
                for (var i = 0; i < b.movieCalendar.calendar.length; i++) {
                    if (b.movieCalendar.calendar[i].hasShowtime) {
                        dates.push(b.movieCalendar.calendar[i].full)
                        dayName.push(b.movieCalendar.calendar[i].dayNameShort)
                        hasShowtime.push(b.movieCalendar.calendar[i].hasShowtime)
                        log('Movie times available...', 'log')
                        fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Movie times available...` + '\n', 'utf-8')
                    } else {
                        log('Movie times unavailable...', 'error')
                        fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [ERR] Movie times unavailable...` + '\n', 'utf-8')
                    }
                }
                let movieLink = 'https://www.fandango.com' + b.movieCalendar.showTimesUrl
                let webhookFormat = ''
                for (var i = 0; i < dates.length; i++) {
                    webhookFormat += 'Date: ' + dates[i] + ' | ' + 'Day Name: ' + dayName[i] + ' | ' + 'Has Showtime: ' + hasShowtime[i] + '\n' // discord formatting
                }
                const message = { 
                    username: 'Fandango Monitor',
                    attachments: [
                        {
                            title: movieTitle + ' ' + 'Tickets Available!',
                            color: '#8A29FE',
                            title_link: movieLink,
                            fields: [
                            { title: 'Zip Code', value: zip, short: true},
                            { title: 'Dates', value: webhookFormat, short: true}],
                            thumb_url: movieImage,
                            footer: 'Fandango Monitor | @cactus jack#0001 | @stroworId',
                            ts: Math.floor(Date.now() / 1000),
                            footer_icon: 'https://hypebeast.com/wp-content/blogs.dir/6/files/2018/08/travis-scott-astroworld-tour-dates-tickets-1.jpg'
                        }
                    ]
                }
                request({
                    url: webhook,
                    json: true,
                    method: 'POST',
                    body: message
                }, function (e) {
                    if (e) {
                        setTimeout(function () {
                            log('Request error sending webhook...', 'error')
                            monitor(movieImage, movieTitle)
                        }, 2500)
                        return;
                    }
                    fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Sent webhook...` + '\n', 'utf-8')
                    log('Sent webhook...', 'success')
                });
            }
        } else {
            fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [ERR] Error retrieving movie times...` + '\n', 'utf-8')
            log('Error retrieving movie times...', 'error')
            setTimeout(function () {
                monitor(movieImage, movieTitle)
            }, config.retryDelay)
            return;
        }
    });
}
main()