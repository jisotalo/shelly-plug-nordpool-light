/**
 * @license
 * 
 * shelly-plug-nordpool-light
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-plug-nordpool-light
 * 
 * License: GNU Affero General Public License v3.0 
 */

/** Config name in KVS */
let C_CFG = "shelly-plug-nordpool-light";

/** How many errors with getting price until to have a break */
let C_ERRC = 3;

/** How long to wait after multiple errors (>= C_ERRC) before trying again (s) */
let C_ERRD = 120;

/** Default config to use if some/all of them are missing from KVS */
let C_DEF = {
  /** Group (country) to get prices from */
  g: 'fi',
  /** VAT added to spot price (%) */
  v: 24,
  /** night time from (hour) */
  ns: 22,
  /** night time until (hour) */
  ne: 6,
  /** night time brightness adjust (%)*/
  nb: -5,
  /** night time blink allowed */
  nf: 0,
  /** output on brightness adjust (%)*/
  ob: 20,
  /** 
   * Color configurations
   *  
   * [price, rgb-r, rgb-g, rgb-b, brightness, blink] 
   * 
   * NOTE: We can't have more rows as KVS has 256 bytes limit
   */
  c: [
    [null, 255, 255, 255, 0, 0],  //row #1 - base (no rule found)
    [null, 255, 0, 0, 50, 1],     //row #2 - error
    [-999, 0, 255, 0, 10, 0],     //row #3 - color 1 (green)
    [5, 255,255, 0, 25, 0],       //row #4 - color 2 (yellow)
    [10, 255, 120, 0, 15, 0],     //row #5 - color 3 (orange)
    [15, 255, 64, 0, 25, 0],      //row #6 - color 4 (orange/red)
    [20, 255, 0, 0, 10, 0],       //row #7 - color 5 (red)
    [null, 255, 255, 255, 100, 0],//row #8 - color 6 (not configured)
  ]
};

/** Main state of app */
let _ = {
  s: {
    /** version number */
    v: "1.0.0",
    /** Device name */
    dn: '',
    /** status as number */
    st: 0,
    /** epoch when last price check was done (logic was run) */
    chkTs: 0,
    /** active error count */
    errCnt: 0,
    /** epoch of last error */
    errTs: 0,
    /** 1 if config is checked */
    configOK: 0,
    /** current price */
    p: null,
    /** active rule index (default: 1 = error) */
    c: 1,
    /** blink/flashing active */
    f: 0,
    /** blink/flashing allowed */
    fa: 0
  },
  /** actice config */
  c: C_DEF
};

/**
 * True if loop is currently running 
 * (new one is not started + HTTP requests are not handled)
 */
let loopRunning = false;

/** Blink state that is changing false->true->false every 1s */
let blinkState = false;

/**
 * Active test configuration (null if no test active)
 */
let activeTest = null;

/**
 * Is the first logic run done
 */
let firstRunDone = false;

/**
 * Returns epoch time (seconds) without decimals
 * 
 * @param {Date?} date Date object (optional) - if not provided, using new Date()
 */
function epoch(date) {
  return Math.floor((date ? date.getTime() : Date.now()) / 1000.0);
}

/**
 * console.log() wrapper
 * 
 * @param {string} str String to log
 */
function log(data) {
  let now = new Date();
  console.log(now.toString().substring(16, 24) + ":", data);
}

/**
 * Updates state (called intervally)
 * - Checks if time is OK
 * - Some things need to be kept up-to-date here
 */
function updateState() {
  let now = new Date();
  _.s.timeOK = now.getFullYear() > 2000 ? 1 : 0;
  _.s.dn = Shelly.getComponentConfig("sys").device.name;

  if (!_.s.upTs && _.s.timeOK) {
    _.s.upTs = epoch(now);
  }
}

/**
 * Checks configuration
 * If a config key is missings, adds a new one with default value
 */
function chkConfig(cb) {
  let count = 0;

  //If config already checked, do nothing
  if (!C_DEF) {
    if (cb) {
      cb(true);
    }
    return;
  }

  for (let prop in C_DEF) {
    if (typeof _.c[prop] === "undefined") {
      _.c[prop] = C_DEF[prop];
      count++;
    }
  }

  //Deleting default config after 1st check to save memory
  C_DEF = null;

  if (count > 0) {
    Shelly.call("KVS.Set", { key: C_CFG, value: _.c }, function (res, err, msg, cb) {
      if (err !== 0) {
        log("chkConfig() - error:" + err + " - " + msg);
      }
      if (cb) {
        cb(err === 0);
      }
    }, cb);

  } else {
    if (cb) {
      cb(true);
    }
  }
}

/**
 * Reads config from KVS
 */
function getConfig(isLoop) {
  Shelly.call('KVS.Get', { key: C_CFG }, function (res, err, msg, isLoop) {
    _.c = res ? res.value : {};

    if (typeof USER_CONFIG == 'function') {
      _.c = USER_CONFIG(_.c, _, true);
    }

    chkConfig(function (ok) {
      _.s.configOK = ok ? 1 : 0;
      _.s.chkTs = 0; //To run the logic again with new settings

      if (isLoop) {
        loopRunning = false;
        Timer.set(1000, false, loop);
      }
    });

  }, isLoop);
}

/**
 * Background process loop that is called every x seconds
 */
function loop() {
  try {
    if (loopRunning) {
      return;
    }
    loopRunning = true;

    updateState();

    if (!_.s.configOK) {
      _.s.st = 0; //0 = "starting"
      getConfig(true);

    } else if (!firstRunDone) {
      _.s.c = 1; //error (no price yet)
      setPlugConfig();
      firstRunDone = true;
      loopRunning = false;
    
    } else if (logicRunNeeded()) {
      _.s.st = 1; //1 = "getting price"
      logic();

    } else {
      //Nothing to do
      loopRunning = false;
    }

  } catch (err) {
    //Shouldn't happen
    log("loop() - error:" + err);
    loopRunning = false;
  }
}

/**
 * Background process loop that is called every 2 seconds
 */
function blinkLoop() {
  blinkState = !blinkState;

  if (loopRunning) {
    return;
  }

  //If blink/flashing is active, change brightness every 1s
  let hour = new Date().getHours();
  let isNight = hour >= _.c.ns || hour < _.c.ne;
  _.s.fa = (isNight && _.c.nf) || !isNight || activeTest != null;
  
  if (_.s.f && _.s.fa) {
    setPlugConfig(blinkState);
  }
}

/**
 * Returns true if we should run the logic now
 */
function logicRunNeeded() {
  let now = new Date();

  //If fetching prices has failed too many times -> wait until trying again
  if (_.s.errCnt >= C_ERRC && (epoch(now) - _.s.errTs) < C_ERRD) {
    let timeLeft = (C_ERRD - (epoch(now) - _.s.errTs));
    //log("liikaa virheitä, odotetaan " + timeLeft.toFixed(0) + " s", me);
    return false;

  } else if (_.s.errCnt >= C_ERRC) {
    //We can clear error counter (time has passed)
    _.s.errCnt = 0;
  }

  if (_.s.chkTs == 0) {
    return true;
  }

  let chk = new Date(_.s.chkTs * 1000);

  //for debugging (run every minute)
  /*return (chk.getMinutes() !== now.getMinutes()
    || chk.getFullYear() !== now.getFullYear());
*/

  /*
    Logic should be run if
    - hour has changed and it's not the first minute of the hour
    - year has changed (= time has been received)
  */
  return ((chk.getHours() !== now.getHours() && now.getMinutes > 0)
    || chk.getFullYear() !== now.getFullYear());
}

/**
 * Sets relay output to cmd
 * If callback given, its called with success status, like cb(true)
 * 
 * @param {boolean} overrideBrightness If true, brightness is set to 0 ("led off")
 * @param {Function} cb callback to call when done (optional)
 */
function setPlugConfig(overrideBrightness, cb) {
  try {
    let now = new Date();
    let cfg = activeTest == null ? _.c.c[_.s.c] : activeTest;
    
    //Creating RGB object from config
    let rgb = {
      rgb: [
        Math.min(Math.max(0, Math.floor(cfg[1] / 255.0 * 100.0)), 100),
        Math.min(Math.max(0, Math.floor(cfg[2] / 255.0 * 100.0)), 100),
        Math.min(Math.max(0, Math.floor(cfg[3] / 255.0 * 100.0)), 100),
      ],
      brightness: Math.min(100, Math.max(0, cfg[4]))
    };

    //If blinking, we need to turn the led off 
    if (overrideBrightness) {
      rgb.brightness = 0;
    }

    //If night time, adjust brightness
    if (now.getHours() >= _.c.ns || now.getHours() < _.c.ne) {
      rgb.brightness = Math.min(Math.max(0, rgb.brightness + _.c.nb), 100);
    }

    //Creating object for PLUGS_UI config
    let prm = {
      config: {
        leds: {
          mode: "switch",
          colors: {
            "switch:0": {
              on: Object.assign({}, rgb),
              off: rgb
            }
          }
        }
      }
    };
    
    //Set on brightness
    prm.config.leds.colors["switch:0"].on.brightness = Math.min(100, Math.max(0, cfg[4] + _.c.ob));
    
    //blink in use?
    _.s.f = cfg[5];
      
    Shelly.call("PLUGS_UI.SetConfig", prm, function (res, err, msg, cb) {
      if (err === 0) {
        if (cb) {
          cb(true);
        }
        return;
      }

      log("setPlugConfig(): Error setting RGB: " + err + ":" + msg)

      if (cb) {
        cb(false);
      }

    }, cb);

  } catch (err) {
    log("setPlugConfig() - error:" + err);

    if (cb) {
      cb(false);
    }
  }
}

/**
 * Main logic
 */
function logic() {
  log("logic() - running...");

  let req = {
    url: "https://dashboard.elering.ee/api/nps/price/" + _.c.g + "/current",
    timeout: 5,
    ssl_ca: "*"
  };

  Shelly.call("HTTP.GET", req, function (res, err, msg) {
    req = null;

    try {
      if (err === 0 && res != null && res.code === 200 && res.body) {
        //Success, save memory by setting values to null
        res.headers = null;
        res.message = null;
        msg = null;

        let json = JSON.parse(res.body);

        //Save memory
        res = null;

        //Get price from json
        _.s.p = json.data[0].price / 10.0 * (100 + (json.data[0].price > 0 ? _.c.v : 0)) / 100.0;

        //Finding correct color rule
        //Default is 0 (rule #1) = base olor / no rule found
        let selected = 0;
        _.s.st = 3; //3 = "no rule found"

        for (let i = 0; i < _.c.c.length; i++) {
          let lim = _.c.c[i][0];

          //If the row has no price, it's not in use (or its error/base color)
          if (lim == null) {
            continue;
          }

          if (_.s.p >= lim && (selected <= 1 || lim >= _.c.c[selected][0])) {
            selected = i;
          }
        }

        if (selected > 0) {
          _.s.st = 4; //4 = "rule x active"
        }
        _.s.c = selected;

        log("logic() - price: " + _.s.p.toFixed(2) + " c/kWh - " + JSON.stringify(_.c.c[selected]) + " (rule #" + selected + ")");

        res = null;

        setPlugConfig(false, function (ok) {
          if (!ok) {
            _.s.errCnt++;
            _.s.errTs = epoch();
            _.s.st = 2; //2 = "error"
            _.s.c = 1; //error
            setPlugConfig(); //try to set error
          } else {
            _.s.chkTs = Math.floor(Date.now() / 1000);
          }
          loopRunning = false;
        });

      } else {
        throw new Error("error: " + err + "(" + msg + ") - " + JSON.stringify(res));
      }

    } catch (err) {
      _.s.errCnt++;
      _.s.errTs = epoch();
      _.s.st = 2; //2 = "error"
      _.s.c = 1; //error
      setPlugConfig(); //try to set error

      log("logic() - error:" + err);
      loopRunning = false;
    }
  });
}

/**
 * Parses parameters from HTTP GET request query to array of objects
 * For example key=value&key2=value2
 * 
 * @param {string} params 
 */
function parseParams(params) {
  let res = {};
  let splitted = params.split("&");

  for (let i = 0; i < splitted.length; i++) {
    let pair = splitted[i].split("=");

    res[pair[0]] = pair[1];
  }

  return res;
}

/**
 * Handles server HTTP requests
 * @param {*} request 
 * @param {*} response 
 */
function onServerRequest(request, response) {
  try {
    if (loopRunning) {
      request = null;
      response.code = 503;
      //NOTE: Uncomment the next line for local development or remote API access (allows cors)
      //response.headers = [["Access-Control-Allow-Origin", "*"]];
      response.send();
      return;
    }

    //Parsing parameters (key=value&key2=value2) to object
    let params = parseParams(request.query);
    request = null;

    let MIME_TYPE = "application/json"; //default
    response.code = 200; //default
    let GZIP = true; //default

    let MIME_HTML = "text/html";
    let MIME_JS = "text/javascript";
    let MIME_CSS = "text/css";

    if (params.r === "s") {
      //s = get state
      updateState();
      response.body = JSON.stringify(_);
      GZIP = false;

    } else if (params.r === "ts") {
      //ts = test start
      activeTest = JSON.parse(params.c);
      Timer.set(500, false, setPlugConfig);

    } else if (params.r === "te") {
      //te = test end
      activeTest = null;
      Timer.set(500, false, setPlugConfig);

    } else if (params.r === "r") {
      //r = reload settings
      _.s.configOK = false; //reload settings (prevent getting prices before new settings loaded )
      getConfig(false);
      _.s.chkTs = 0;

      response.code = 204;
      GZIP = false;

    } else if (!params.r) {
      response.body = atob('#[index.html]');
      MIME_TYPE = MIME_HTML;

    } else if (params.r === "s.js") {
      response.body = atob('#[s.js]');
      MIME_TYPE = MIME_JS;

    } else if (params.r === "s.css") {
      response.body = atob('#[s.css]');
      MIME_TYPE = MIME_CSS;

    } else {
      response.code = 404;
    }

    params = null;

    response.headers = [["Content-Type", MIME_TYPE]];

    //NOTE: Uncomment the next line for local development or remote API access (allows cors)
    //response.headers.push(["Access-Control-Allow-Origin", "*"]);

    if (GZIP) {
      response.headers.push(["Content-Encoding", "gzip"]);
    }
  } catch (err) {
    log("http - error:" + err);
    response.code = 500;
  }
  response.send();
}

//Startup
log("shelly-plug-nordpool-light v." + _.s.v);
log("URL: http://" + (Shelly.getComponentStatus("wifi").sta_ip ?? "192.168.33.1") + "/script/" + Shelly.getCurrentScriptId());

HTTPServer.registerEndpoint('', onServerRequest);
Timer.set(10000, true, loop);
Timer.set(2000, true, blinkLoop);
loop();