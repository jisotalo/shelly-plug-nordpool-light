/** 
 * shelly-plug-nordpool-light
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-plug-nordpool-light
 * 
 * License: GNU Affero General Public License v3.0 
 */

/** URL of the shelly (only if DEV active, otherwise it is same origin) */
let URL = "";

/** URL of the logic script */
let URLS = "";

/** Shortcut for querySelector() call */
let qs = (s) => document.querySelector(s);

/**
 * debug function that is printing to console only when DEV is active
 */
let DBG = () => { };

/**
 * Enumeration of state
 */
let STATE_STR = [
  "Starting...", //0
  "Getting price...", //1
  "Error (no price)", //2
  "No rule found for this price", //3
  "Rule #%s is active", //4
]

/**
 * Global state
 * 
 * undefined = not yet read
 * null = error
 */
let state = undefined;

/**
 * Helper that is used for DBG calls to add caller information
 */
let me = () => "";

/**
 * Global state if color picking is currently active
 */
let colorPickingActive = false;

/**
 * Global promise resolver for color picking dialog
 */
let colorPickerPromiseResolver = null;

/**
 * Global for selected color from color picker
 */
let colorPickerSelectedColor = null;

/**
 * Config read state
 */
let configRead = false;

/**
 * Fetches data from url
 * @param {*} url 
 * @param {*} isJson 
 * @returns 
 */
let getData = async (url) => {
  try {
    let res = await fetch(url);

    if (res.ok) {
      let data = null;

      if (res.status !== 204) {
        data = await res.json();
      }

      DBG(me(), `Fetching ${url} done. Status code: ${res.status}`);

      return {
        ok: true,
        code: res.status,
        txt: res.statusText,
        data
      };

    } else {
      console.error(`${url}: ${res.statusText}`);

      return {
        ok: false,
        code: res.status,
        txt: `${url}: ${res.statusText} (${(await res.text())})`,
        data: null
      };

    }
  } catch (err) {
    console.error(`${url}: (${JSON.stringify(err)})`);

    return {
      ok: false,
      code: -1,
      txt: `${url}: (${JSON.stringify(err)})`,
      data: null
    };
  }
}

/**
 * Formats Date object to dd.mm.yyyy
 * @param {*} date 
 * @returns 
 */
let formatDate = (date) => {
  return `${(date.getDate().toString().padStart(2, "0"))}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;
}

/**
 * Formats Date object to time HH:mm(:ss)(.fff)
 * @param {*} date 
 * @param {*} showSeconds 
 * @param {*} showMilliseconds 
 * @returns 
 */
let formatTime = (date, showSeconds = true, showMilliseconds = false) => {
  return `${(date.getHours().toString().padStart(2, "0"))}:${date.getMinutes().toString().padStart(2, "0")}${(showSeconds ? `:${date.getSeconds().toString().padStart(2, "0")}` : "")}${(showMilliseconds ? `.${date.getMilliseconds().toString().padStart(3, "0")}` : "")}`;
}

/**
 * Formats Date object to dd.mm.yyyy - HH:mm(:ss)(.fff)
 * @param {*} date 
 * @param {*} showSeconds 
 * @param {*} showMilliseconds 
 * @returns 
 */
let formatDateTime = (date, showSeconds = true, showMilliseconds = false) => {
  return `${formatDate(date)} ${formatTime(date, showSeconds, showMilliseconds)}`;
}

/** Returns color from config row as array, such as [255, 255, 255] */
let getRgbFromCfg = (cfg) => {
  return cfg.slice(1, 4);
}

/**
 * Converts array of RGB colors to string
 * [255, 255, 255] -> "255,255,255"
 * @param {*} cfg 
 * @returns 
 */
let getRgbStrFromCfg = (cfg) => getRgbFromCfg(cfg).join(",");

/**
 * Returns css color from a config row 
 * Such as rgb(255, 255, 255)
 * @param {*} cfg 
 * @returns 
 */
let getCssColorFromCfg = (cfg) => getCssColorFromRgbStr(getRgbStrFromCfg(cfg));

/**
 * Returns css color from RGB string (adds rgb() around it) 
 * 
 * @param {*} str 
 * @returns 
 */
let getCssColorFromRgbStr = (str) => `rgb(${str})`;

/**
 * Converts RGB color string to array of numbers
 * "255,255,255" -> [255, 255, 255]
 * @param {} str 
 * @returns 
 */
let rgbStrToArray = (str) => str.split(",").map(v => Number(v));

/**
 * Handles starting and stopping of color picking on the gradient
 */
let toggleColorPickingActive = (event) => {
  colorPickingActive = !!event;
  colorPickingActive && handleColorPickerSelect(event);
}

/**
 * Handles taking the color when clicked on the gradient
 */
let handleColorPickerSelect = (event) => {
  if (!colorPickingActive)
    return;

  // Calculate the percentage of the clicked position along the gradient
  let rect = qs("#pck-grd").getBoundingClientRect();
  let percent = (event.clientX - rect.left) / rect.width;

  // Calculate RGB values based on the percentage
  const rgbValues = getColorAtPercent(percent);

  qs("#pck-box").style.backgroundColor = getCssColorFromRgbStr(rgbValues);
  qs("#pck-txt").innerText = getCssColorFromRgbStr(rgbValues)

  // Update the selected color
  colorPickerSelectedColor = rgbValues.join(",");
}

/**
 * Returns RGB color at percentage
 */
let getColorAtPercent = (percent) => {
  //Colors just like they are in css
  let colors = [
    [255, 255, 255],
    [255, 0, 0],
    [255, 255, 0],
    [0, 255, 0],
    [0, 255, 255],
    [0, 0, 255],
    [255, 0, 255],
    [0, 0, 0]
  ];

  //Calculating the RGB at certain point of gradient
  let segment = 1 / (colors.length - 1);
  let index = Math.floor(percent / segment);

  let color1 = colors[index];
  let color2 = colors[index + 1];
  let segmentPercent = (percent - index * segment) / segment;

  let red = Math.round(color1[0] + (color2[0] - color1[0]) * segmentPercent);
  let green = Math.round(color1[1] + (color2[1] - color1[1]) * segmentPercent);
  let blue = Math.round(color1[2] + (color2[2] - color1[2]) * segmentPercent);

  return [red, green, blue];
}

/**
 * Tests a config row
 * @param {*} i 
 */
let testConfigRow = async (i) => {
  try {
    let cfg = [
      null,
      ...rgbStrToArray(qs(`#cfg-${i}-c`).value),
      Number(qs(`#cfg-${i}-b`).value),
      qs(`#cfg-${i}-f`).checked ? 1 : 0
    ];

    await getData(`${URLS}?r=ts&c=${JSON.stringify(cfg)}`);

    alert(`Test active!\n\nTest ends when this popup is closed`);

  } catch (err) {
    console.error(err);
    alert("Error: " + err);

  } finally {
    try {
      await getData(`${URLS}?r=te`);
    } catch { }
  }
}

/**
 * Open color picker and waits for color
 */
let promptColor = async (el) => {
  let hideColorPicker = () => {
    colorPickerPromiseResolver = null;
    qs("#pck").style.display = "none";
    qs("#content").classList.remove("fade");
  }

  //Setting up active color
  let rgb = qs(`#${el}`).value;

  qs("#pck-box").style.backgroundColor = getCssColorFromRgbStr(rgb);
  qs("#pck-txt").innerText = getCssColorFromRgbStr(rgb);
  colorPickerSelectedColor = rgb;

  qs("#pck").style.display = "block";
  qs("#content").classList.add("fade");

  //Wait until promise is resolved (cancel or accept)
  colorPickerPromiseResolver = () => new Promise(resolve => colorPickerPromiseResolver = resolve);
  let res = await colorPickerPromiseResolver();

  if (res) {
    qs(`#${el}`).value = colorPickerSelectedColor;
    setBoxColor(qs(`#${el}`));
  }

  hideColorPicker();
}

/**
 * Sets color of color picker box by the value of its input
 */
let setBoxColor = (e) => {
  qs(`#${e.id}p`).style.backgroundColor = getCssColorFromRgbStr(e.value);
}

/**
 * Called cyclically
 */
let updateLoop = async () => {
  DBG(me(), "Updating");
  qs("#spin").style.visibility = "visible";

  try {
    let res = await getData(`${URLS}?r=s`);

    if (res.ok) {
      state = res.data;

      //If status 503 the shelly is just now busy running the logic -> do nothing
    } else if (res.code !== 503) {
      state = null;
    }

    try {
      if (typeof state === "undefined") {
        return;
      } else if (!state) {
        throw new Error("no data");
      }

      //Some shortcuts..
      let s = state.s;
      let c = state.c;

      document.title = `${(s.dn ? `${s.dn} - ` : '')}Shelly Plus Plug`;

      //Status
      qs("#s-st").innerHTML = STATE_STR[s.st].replace("%s", (s.c - 1));
      qs("#s-c").innerHTML = `<div class="color${s.fa && c.c[s.c][5] ? " b2s" : ""}" style="background: ${getCssColorFromCfg(c.c[s.c])};">&nbsp;</div>`;
      qs("#s-now").innerHTML = s.p != null ? `${s.p.toFixed(2)} c/kWh` : "";
      qs("#s-dn").innerHTML = s.dn ? s.dn : '<i>Not set</i>';
      qs("#s-v").innerHTML = `Started ${formatDateTime(new Date(s.upTs * 1000))} (uptime ${((new Date().getTime() - new Date(s.upTs * 1000).getTime()) / 1000.0 / 60.0 / 60.0 / 24.0).toFixed("1")} days) - v.${s.v}`;

      //Config
      if (!configRead) {
        qs("#g").value = c.g;
        qs("#v").value = c.v;
        qs("#ns").value = `${c.ns}`.padStart(2, "0");
        qs("#ne").value = `${c.ne}`.padStart(2, "0");
        qs("#nb").value = c.nb;
        qs("#nf").checked = c.nf ? "checked" : "";
        qs("#ob").value = c.ob;

        qs("#cfg").innerHTML = "";
        for (let i = 1; i < c.c.length; i++) {
          const rule = c.c[i];

          qs("#cfg").innerHTML += `
        <tr>
          ${i > 1
              ? `<td>#${i - 1}</td><td><input type="text" id="cfg-${i}-p" size="1" value="${rule[0] ?? ""}"></td>`
              : '<td><td>error</td>'
            }
          <td>
            <input type="text" id="cfg-${i}-c" size="8" value="${getRgbStrFromCfg(rule)}">
            <div id="cfg-${i}-cp" class="color pick" style="background: ${getCssColorFromCfg(rule)};">&nbsp;</div>
          </td>
          <td><input type="text" id="cfg-${i}-b" size="1" value="${rule[4]}"> %</td>
          <td>
            <input type="checkbox" id="cfg-${i}-f" ${rule[5] && "checked"}>
          </td>
          <td>
            <input id="cfg-${i}-t" type="button" value="test">
          </td>
        </tr>
        `;
        }

        for (let i = 1; i < c.c.length; i++) {
          qs(`#cfg-${i}-cp`).addEventListener("click", () => promptColor(`cfg-${i}-c`));
          qs(`#cfg-${i}-t`).addEventListener("click", () => testConfigRow(i));
          qs(`#cfg-${i}-c`).addEventListener("change", () => setBoxColor(qs(`#cfg-${i}-c`)));
        }
      }

      configRead = true;
    } catch (err) {
      console.error(err);
      let c = (e) => qs(e).innerHTML = "";
      qs("#s-st").innerHTML = "Unknown status";
      c("#s-c");
      c("#s-now");
      c("#s-dn");
      c("#s-mode");
    }

  } catch (err) {
    console.error(err);
    state = null;

  } finally {
    qs("#spin").style.visibility = "hidden";
    setTimeout(updateLoop, 5000);
  }
}

/**
 * Called when pressing save button
 */
const save = async () => {
  try {
    let c = state.c
    let n = (el) => Number(el.value);
    const limit = (min, value, max) => Math.min(max, Math.max(min, value));

    c.g = qs("#g").value;
    c.v = n(qs("#v"));
    c.ns = limit(0, n(qs("#ns")), 24);
    c.ne = limit(0, n(qs("#ne")), 24);
    c.nb = n(qs("#nb"));
    c.nf = qs(`#nf`).checked ? 1 : 0;
    c.ob = n(qs("#ob"));

    for (let i = 1; i < c.c.length; i++) {
      c.c[i] = [
        qs(`#cfg-${i}-p`) && qs(`#cfg-${i}-p`).value != ""
          ? n(qs(`#cfg-${i}-p`))
          : null,
        ...rgbStrToArray(qs(`#cfg-${i}-c`).value),
        n(qs(`#cfg-${i}-b`)),
        qs(`#cfg-${i}-f`).checked ? 1 : 0
      ];

    }

    DBG(me(), "Settings to save:", c);

    const res = await getData(`${URL}/rpc/KVS.Set?key="shelly-plug-nordpool-light"&value=${(JSON.stringify(c))}`);

    if (res.code == 200) {
      getData(`${URLS}?r=r`)
        .then(res => {
          alert(`Saved!`);
          configRead = false;
        })
        .catch(err => {
          alert(`Error: ${err})`);
        });

    } else {
      alert(`Error: ${res.txt})`);
    }
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
};

if (DEV) {
  reqJs("dev.js");
} else {
  updateLoop();
}

//Adding event handles
qs("#save").addEventListener("click", save);
qs("#pck-grd").addEventListener("mousedown", toggleColorPickingActive);
qs("#pck-grd").addEventListener("mousemove", handleColorPickerSelect);
qs("#pck-grd").addEventListener("mouseup", () => toggleColorPickingActive(null));

qs("#pck-no").addEventListener("click", () => colorPickerPromiseResolver(false));
qs("#pck-ok").addEventListener("click", () => colorPickerPromiseResolver(true));
