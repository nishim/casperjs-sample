var casper_option = {
  verbose: true,
  logLevel: 'warning',
  waitTimeout: 3000,
  pageSettings: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20130404 Firefox/23.0"
  }
};

var require = patchRequire(require);
var initial_pos = { timestamp: Date.now(), coords: {latitude: 35.658570, longitude: 138.616298, accuracy: 10} };
var casper = require("casper").create(casper_option);
var geo = require('casperjs-geolocation')(casper, initial_pos);

var areas = require('areas.json');
var keywords = require('keywords.json');

// get wait msec.
var w = function(i, j) { return Math.floor(Math.random() * (j - i) + i) * 1000; };
var ws = function() { return w( 5, 10); };
var wl = function() { return w(60, 120); };

casper.start();
keywords.forEach(function(kv, ki, ka) {
  areas.forEach(function(v, i, a) {
  	casper.thenOpen("http://www.google.co.jp/", function() {
      this.echo('---- ' + v.area + ' / ' + kv + ' ----');
      this.fill('form[action="/search"]', {
        q: kv
      }, true);
      geo.setPos({latitude: v.lat, longitude: v.lon, accuracy: v.accuracy});
  		this.wait(ws());
      this.thenClick('#fbar #swml a[href="#"]');
      this.wait(ws());
    	this.waitForSelector('#pnnext', function() {
        var url = this.getCurrentUrl();
        this.thenClick("#pnnext").then(function() {
          this.waitFor(function() {
            return url !== this.getCurrentUrl();
          });
        });
      });
      this.wait(ws());
      this.waitForSelector('#pnprev', function() {
        var url = this.getCurrentUrl();
        this.thenClick("#pnprev").then(function() {
          this.waitFor(function() {
            return url !== this.getCurrentUrl();
          });
  	      this.capture("img/" + v.area + '_' + kv + ".png");
        });
    	});
  	});
    casper.wait(wl());
  });
});
casper.run();
