# fandango-monitor

Monitor for [Fandango](http://fandango.com/), specifically for when movie tickets become available.

### How it works:

- Put the link to any movie that has no showtimes available yet in the config file.  Example: Avengers Endgame as of March 17, 2019.
- Then, run the script and it will send a notification to the webhook you saved in the config file when tickets become available as long as you have the script running.
- Notification will include a range of upcoming dates of showtimes for the specified movie.
- Supports Slack and Discord webhooks, more information can be found under setup.
- Script logs it's processes in both your terminal/console and the log.txt file.

Example of a successful webhook:
![image](https://i.imgur.com/T0fix4U.png)

### Installation

Fandango Monitor requires [Node.js](http://nodejs.org/) and [npm](http://npmjs.com/).  You must have both of these installed to run the script.

### Setup:

Edit config.json with your movie link, Discord or Slack webhook, and zip code.  The default retry delay is 5000 ms.  

See how to create a Slack webhook [here](https://api.slack.com/incoming-webhooks).

See how to create Discord webhook [here](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks).

```sh
$ git clone https://github.com/astroworId/fandango-monitor.git
$ cd fandango-monitor
$ npm install
$ node index.js
```

### Issues?

DM [me](https://twitter.com/astroworId) on Twitter or on Discord @cactus jack#0001.

### Proxies?

Not needed, but are supported if you want to add them, paste them in the following format into the the proxies.txt file.

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
