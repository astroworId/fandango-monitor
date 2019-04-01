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
const TestDiscordWebhookArray = ['https://discordapp.com/api/webhooks/474604992779649045/he8Phsr14_Q59F66C9x44HGVF4Bx3Hhd3TB5V7yUYxg-cPT1x6040H1hmbujOtzLBqvd/slack', 'https://discordapp.com/api/webhooks/558073376078561299/i0-ET127MhI23XRO0D_XHG75wxuGRWLOdocGF-zvrjAOoLvkz87yWxM9Qrw7JC94sMIn/slack', 'https://discordapp.com/api/webhooks/558073392301998091/H5E2vcqQrqu7ez9f4httRKFF-xSgUJ3Iq-nOG8uPLkVjwymgjU2gRjxGN3gXphWB2kzy/slack', 'https://discordapp.com/api/webhooks/558073508232691712/i4ZoUyepgPkdAtEOIMkDnu50AWa2Kqt9ZMZDYu066asy8vN-mr2FQeNVWAtGCEmZWE9U/slack', 'https://discordapp.com/api/webhooks/558073599072927806/UcYq8mVGqyDSD7M8bSqAMqLNUhJBrCTWF2fVEiz9Tx2zpClc8SWodFmwgj6I4pdwn8wW/slack', 'https://discordapp.com/api/webhooks/560090235799732234/3uHA8JWzFy_3UhwxQtgPzZLtUBZDtUhcIWqk5W86gEtrVWnnHyDKpBMFPTRnuEZ6xCv8/slack', 'https://discordapp.com/api/webhooks/560090268276097045/FTTprhR2xy25_JWawjdTmHubES2sc5PTcU8Zl_u7CwITesIIIPSHJRefvWBXhhQW5c88/slack', 'https://discordapp.com/api/webhooks/560090321355145217/a8hLRnqAdvtkoP6QxAyqe5Jmj2kLqzipubpJQ7OBU5rk6KORoRyZRvR67aYM3MSKoKJm/slack']

String.prototype.splitLines = function () {
    return this.split(process.platform === 'win32' ? '\r\n' : '\n');
}
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
    if (movieLink.length === 0) {
        log('Please enter a movie...', 'error')
        return;
    }
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
        url: movieLink + `?timestamp=${parseInt(Date.now()/1000)}`,
        method: 'GET',
        headers: {
            'cache-control': 'max-age=0',
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
            let movieId = b.split('"content_id":"')[1].split('"')[0];
            
            monitor(movieImage, movieTitle, movieId)
        } else {
            log('Error getting movie details...', 'error')
            setTimeout(function () {
                getMovieDetails()
            }, config.retryDelay)
            return;
        }
    });
}

function monitor(movieImage, movieTitle, movieId) {
    const movLink = movieLink.split('https://www.fandango.com/')[1].split('/')[0];
    log('Retrieving movie times...', 'log')
    fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Retrieving movie times...` + '\n', 'utf-8')
    request({
        url: `https://www.fandango.com/napi/movieCalendar/${movLink}?isdesktop=true&zip=${zip}&timestamp=${parseInt(Date.now()/1000)}`,
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
                let startDate = b.movieCalendar.startDateFull
                for (var i = 0; i < 1; i++) {
                    if (b.movieCalendar.calendar[i].hasShowtime) {
                        dates.push(b.movieCalendar.calendar[i].full)
                        dayName.push(b.movieCalendar.calendar[i].dayNameShort)
                        hasShowtime.push(b.movieCalendar.calendar[i].hasShowtime)
                        let movieLink = 'https://www.fandango.com' + b.movieCalendar.showTimesUrl
                        log('Movie times available...', 'log')
                        request({
                            url: `https://www.fandango.com/napi/theaterShowtimeGroupings/${movieId}/${startDate}?zip=${zip}&timestamp=${parseInt(Date.now()/1000)}`,
                            method: 'GET',
                            headers: {
                                'accept': '*/*',
                                'x-requested-with': 'XMLHttpRequest',
                                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
                                'accept-encoding': 'gzip, deflate, br',
                                'accept-language': 'en-US,en;q=0.9',
                                'referer': 'https://www.fandango.com/' + movLink + `/movie-times`
                            },
                            gzip: true,
                            json: true,
                            proxy: formatProxy(proxyList[Math.floor(Math.random() * proxyList.length)])
                        }, function (e, r, b) {
                            if (e) {
                                log('Request error retrieving show times...', 'error')
                                fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [ERR] Request error retrieving movie times...` + '\n', 'utf-8')
                                setTimeout(function () {
                                    monitor(movieImage, movieTitle)
                                }, config.retryDelay)
                                return;
                            }
                            if (r.statusCode === 200) {
                                let ticketAvailability = []
                                let showTimes = []
                                let ticketLinks = []
                                let theaters = []
                                let theaterDistance = []
                                let listArray = []
                                let v = -1
                                for (var i = 0; i < 3; i++) { // just to get the 3 closest theaters
                                    v += 1
                                    theaters.push(b.theaterShowtimes.theaters[i].name)
                                    theaterDistance.push(b.theaterShowtimes.theaters[i].distance)
                                    listArray.push(b.theaterShowtimes.theaters[i])
                                    for (var q = 0; q < b.theaterShowtimes.theaters[i].variants.length; q++) {
                                        for (var m = 0; m < b.theaterShowtimes.theaters[i].variants[q].amenityGroups.length; m++) {
                                            for (var k = 0; k < b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes.length; k++) {
                                                if (b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes[k] !== undefined) {
                                                    if (b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes[k].type === 'available' && b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes[k].expired === false) {
                                                        ticketAvailability.push(b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes[k].type)
                                                        showTimes.push(b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes[k].date)
                                                        ticketLinks.push(b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes[k].wwwTicketingUrl)
                                                    } else if (b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes[k].type === 'restricted') {
                                                        fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] ickets not available yet...` + '\n', 'utf-8')
                                                        log('Tickets not available yet...', 'log')
                                                        setTimeout(function () {
                                                            monitor(movieImage, movieTitle)
                                                        }, config.retryDelay)
                                                        return;
                                                    } else if (b.theaterShowtimes.theaters[i].variants[q].amenityGroups[m].showtimes[k].expired === false) {
                                                        fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] All shows are in progress...` + '\n', 'utf-8')
                                                        log('All shows are in progress...', 'log')
                                                        setTimeout(function () {
                                                            monitor(movieImage, movieTitle)
                                                        }, config.retryDelay)
                                                        return;
                                                    }
                                                } else {
                                                    log('No showtimes found...', 'log')
                                                }
                                            }
                                        }
                                    }
                                let counter = 0
                                let webhookFormat = ''
                                let webhookFormat2 = ''
                                let webhookFormat3 = ''
                                let webhookFormat4 = ''
                                if (ticketAvailability.length < 10) {
                                    for (var n = 0; n < (parseInt(ticketAvailability.length/2)); n++) {
                                        webhookFormat += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                        counter++
                                    }
                                    if (ticketAvailability.length - counter > 4) {
                                        let difference = ticketAvailability.length - counter
                                        if (difference > 4) {
                                            for (var n = counter; n < difference; n++) {
                                                webhookFormat2 += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                                counter++
                                            }
                                            for (var n = counter; n < ticketAvailability.length; n++) {
                                                webhookFormat3 += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                                counter++
                                            }
                                        }
                                    }

                                } else if (ticketAvailability.length > 10 && ticketAvailability.length < 15) {
                                    for (var n = 0; n < (parseInt(ticketAvailability.length/3)); n++) {
                                        webhookFormat += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                        counter++
                                    }
                                    if (ticketAvailability.length - counter > 4) {
                                        let difference = ticketAvailability.length - counter
                                        if (difference > 4) {
                                            for (var n = counter; n < difference; n++) {
                                                webhookFormat2 += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                                counter++
                                            }
                                            for (var n = counter; n < ticketAvailability.length; n++) {
                                                webhookFormat3 += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                                counter++
                                            }
                                        }
                                    }
                                } else if (ticketAvailability.length > 15) {
                                    for (var n = 0; n < (parseInt(ticketAvailability.length/4)); n++) {
                                        webhookFormat += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                        counter++
                                    }
                                    if (ticketAvailability.length - counter > 4) {
                                        let difference = ticketAvailability.length - counter
                                        let difference2 = ticketAvailability.length - counter - counter
                                        if (difference > 4) {
                                            for (var n = counter; n < difference2; n++) {
                                                webhookFormat2 += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                                counter++
                                      
                                            }
                                            for (var n = counter; n < difference; n++) {
                                                webhookFormat3 += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                                counter++
                                            }
                                            for (var n = counter; n < ticketAvailability.length; n++) {
                                                webhookFormat4 += '**Date:** ' + moment().format('MM.DD.YYYY') + ' | ' + '**Showtimes:** ' + showTimes[n] + ' | ' + '**Status:** ' + ticketAvailability[n]+ ' | ' + '[' + '**Ticket Link**' + ']' + `(${ticketLinks[n]})` + '\n' // discord formatting
                                                counter++
                                            }
                                        }
                                    }
                                }
                                notify(movieTitle, movieLink, theaters, v, webhookFormat, webhookFormat2, webhookFormat3, webhookFormat4, movieImage)  
                            } 
                        } else {
                            fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [ERR] Error retrieving movie times...` + '\n', 'utf-8')
                            log('Error retrieving show times...', 'error')
                            setTimeout(function () {
                                monitor(movieImage, movieTitle)
                            }, config.retryDelay)
                            return;
                        }
                    });
                    fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Movie times available...` + '\n', 'utf-8')
                    } else {
                        log('Movie times unavailable...', 'error')
                        fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [ERR] Movie times unavailable...` + '\n', 'utf-8')
                    }
                }
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
function notify(movieTitle, movieLink, theaters, v, webhookFormat, webhookFormat2, webhookFormat3, webhookFormat4, movieImage) {

    const message = { 
        username: 'Fandango Monitor',
        attachments: [
            {
                title: movieTitle + ' ' + 'Tickets Available!',
                color: '#8A29FE',
                title_link: movieLink,
                fields: [
                { title: '__**Zip Code**__', value: zip, short: true},
                { title: '__**Theater:**__ ' + theaters[v], value: webhookFormat},
                { title: '__**Theater:**__ ' + theaters[v], value: webhookFormat2},
                { title: '__**Theater:**__ ' + theaters[v], value: webhookFormat3},
                { title: '__**Theater:**__ ' + theaters[v], value: webhookFormat4}],
                thumb_url: movieImage,
                footer: 'Fandango Monitor | @cactus jack#0001 | @stroworId',
                ts: Math.floor(Date.now() / 1000),
                footer_icon: 'https://hypebeast.com/wp-content/blogs.dir/6/files/2018/08/travis-scott-astroworld-tour-dates-tickets-1.jpg'
            }
        ]
    }
    
    request({
        url: TestDiscordWebhookArray[Math.floor(Math.random() * TestDiscordWebhookArray.length)],
        json: true,
        method: 'POST',
        body: message
    }, function (e) {
        if (e) {
            setTimeout(function () {
                log('Request error sending webhook...', 'error')
                notify(movieTitle, movieLink, theaters, webhookFormat)
            }, 2500)
            return;
        }
        fs.appendFileSync('log.txt', `[${moment().format('hh:mm:ss:SS')}] [LOG] Sent webhook...` + '\n', 'utf-8')
        log('Sent webhook...', 'success')
    });

}
main()