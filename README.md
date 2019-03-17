# fandango-monitor

Monitor for [Fandango](http://fandango.com/), specifically for when movie tickets become available.

### How it works:

- Put the link to any movie that has no showtimes available yet in the config file.  Example: Avengers Endgame as of March 17, 2019 found [here](https://www.fandango.com/avengers-endgame-215871/movie-overview)
- Runnning the script and will send a notification to the webhook you saved in the config file when tickets become available for your specified movie, as long as you have the script running.
- The notification will include a range of upcoming showtimes for your specified movie.
- Supports Slack and Discord webhooks for methods of notifications, more information can be found under the setup section below.
- Fandango Monitor logs its processes in both your terminal/console and the log.txt file.

Example of a successful webhook:
![webhookexample](https://i.imgur.com/T0fix4U.png)

### Installation

Fandango Monitor requires [Node.js](http://nodejs.org/) and [npm](http://npmjs.com/).  You must have both of these installed to run the script.

### Setup:

Edit config.json with your movie link, Discord or Slack webhook, and zip code.  The default retry delay is 5000 ms.  

See how to create a Slack webhook [here](https://api.slack.com/incoming-webhooks).

See how to create a Discord webhook [here](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks).

```sh
$ git clone https://github.com/astroworId/fandango-monitor.git
$ cd fandango-monitor
$ npm install
$ node index.js
```

### Issues?

DM [me](https://twitter.com/astroworId) on Twitter or Discord @cactus jack#0001.

### Proxies?

Not needed, but are supported if you want to add them.  Paste them into the proxies.txt file in one of the formats below.

```
ip:port
ip:port:user:pass
```

### Who

Readme stolen from <a href="http://petersoboyejo.com/">@dzt</a> and <a href="http://github.com/Novaaaaa/">JM</a>, altered for my project needs.

## License

```
The MIT License (MIT)

Copyright (c) 2019 cactus jack <http://twitter.com/astroworId/>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
