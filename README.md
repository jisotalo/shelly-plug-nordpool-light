# shelly-plug-nordpool-light
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/shelly-plug-nordpool-light)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)
 
 Hieman yliampuva pörssisähkön hinnan mukaan valoa ohjaava skripti **Shelly Plus Plug S** -etäohjattavaan pistorasiaan. Skriptin konfiguroidaan selaimella toimivalla käyttöliittymällä kotiverkosta. Käyttää [Eleringin](https://dashboard.elering.ee/api) rajapintaa eikä vaadi rekisteröitymistä.

 **Huom:** Tämä skripti ei ohjaa pistorasialähtöä! Tämä skripti ainoastaan asettaa RGB-valon hinnan mukaan. Jos haluat ohjata pistorasiaa pörssisähkön hinnan mukaan, katso toinen projektini [shelly-porssisahko](https://github.com/jisotalo/shelly-porssisahko). Voit laittaa molemmat skriptit toimimaan samanaikaisesti.

 ---

 An overkill script for **Shelly Plus Plug S** to control the RGB light based on active Nordpool electricity price. The prices are available for Finland, Estonia, Latvian and Lithuania. Settings can be adjusted using web-based UI in the local network. Uses [Elering](https://dashboard.elering.ee/api) API, so no registeration is needed.

 **Note:** This script does not control the output - it only handles the RGB LED color. If you want to control the output based on electricity price, see my other project [shelly-porssisahko](https://github.com/jisotalo/shelly-porssisahko). You can run both scripts at the same time.

![shelly-plug-nordpool-light gif](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/d050b1e1-602f-4aea-a9d3-075426a03af0)x§

## Sisällysluettelo / Table of Contents
<!-- TOC -->

- [Sisällysluettelo / Table of Contents](#sis%C3%A4llysluettelo--table-of-contents)
- [Suomeksi](#suomeksi)
  - [Ominaisuudet](#ominaisuudet)
  - [Asennus](#asennus)
  - [Asetukset](#asetukset)
  - [Kysymyksiä ja vastauksia](#kysymyksi%C3%A4-ja-vastauksia)
- [In English](#in-english)
  - [Installation](#installation)
  - [Settings](#settings)
  - [FAQ](#faq)
- [License](#license)

<!-- /TOC -->

## Suomeksi

### Ominaisuudet

* Ilmainen sekä avoin lähdekoodi
* Oma web-serveri Shellyn sisällä ja siinä pyörivä käyttöliittymä
* Ei rekisteröitymistä
* Valvonta ja konfigurointi nettiselaimen avulla kotiverkossa (PC, puhelin, tabletti)
* Vapaasti konfiguroitava väri, kirkkaus ja vilkutus* eri hinnoille ja vikatilanteelle
* Asetusten testaus ennen tallennusta
* Mahdollista himmentää kirkkautta ja vilkutusta yön ajaksi
* Mahdollista asettaa eri kirkkaus jos lähtö on päällä

*\* Vilkutuksen käyttö kuluttaa laitteen muistia pitkässä juoksussa - käytä ainoastaan vikatilanteessa tai harvinaisessa hintatilanteessa. Käyttö omalla vastuulla.*

### Asennus

**HUOMIO:** Skripti vaatii firmwaren 1.0.7 tai uudemman

1. Ota Shelly käyttöön, yhdistä se wifi-verkkoon ja päivitä sen firmware. Avaa Shellyn hallinta **nettiselaimella**.
2. Laita **Websocket debug** päälle (Settings -> Debug -> Enable websocket debug). Näin näet suoraan hallintapaneelin osoitteen skriptin alla.
3. Avaa **Scripts**-sivu Shellyn hallinnasta
4. Paina **Library**-painiketta

    ![image](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/97b58d24-a947-459c-b6e2-4a0c1f84a6bf)

5. Aukeavassa ikkunassa paina **Configure URL**

    ![image](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/fa592dc8-d99c-45a6-80bd-55c2d7720572)

6. Syötä osoitteeksi `https://raw.githubusercontent.com/jisotalo/shelly-plug-nordpool-light/master/shelly-library.json` ja paina **Save**

    ![image](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/5618ff9a-cd5b-4218-a6d8-5d1f7f1dad54)

7. Nyt kirjastoon ilmestyy tämä skripti. Asenna se painamalla **Import code**

    ![image](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/0436e617-214a-4fe1-af3b-0d36e9205524)

8. Kun skripti ilmestyy, paina **Save**

    ![image](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/0505c7fe-14c1-494c-8604-9013e0fdf1ef)

9. Tallentamisen jälkeen paina **Start**, jolloin skripti käynnistyy

    ![image](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/18309201-8ceb-4e4e-b70d-9bcd08c4d6aa)

10. Jos websocket debug on päällä (**kohta 2**), näet hallinnan osoitteen suoraan skriptin alla konsolissa. Kopioi tämä osoite ja avaa se selaimella. Jos et näe sitä niin osoite on muotoa `http://ip-osoite/script/1` (jos kyseessä on 1. skripti)

    ![image](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/58e47d7e-d46e-42aa-ab22-deaef16d9104)

11. Varmista vielä että skripti käynnistyy aina automaattisesti. Eli **Scripts**-sivulla pitää shelly-plug-nordpool-light.js -skriptin kohdalla olla valinta päällä.

    ![image](https://github.com/jisotalo/shelly-plug-nordpool-light/assets/13457157/a4ab558c-216b-4ff8-bde4-fcd54c79289b)

12. Valmis! Avaa käyttöliittymä selaimessa (**kohta 10**) ja säädä asetukset kohdilleen [Asetukset](#asetukset)-kappaleen ohjeilla.


### Asetukset

| Asetus | Selite | Esim. (kuva yllä)
| --- | --- | ---
| Country | Maa/alue, jolle hinta haetaan | `Finland`
| VAT-% | Käytettävä ALV-% sähkön hinnalle. [%]| `24 %`
| Output on | Paljonko kirkkautta muutetaan jos lähtö on päällä. [%]<br><br>Negativiinen arvo pienentää, positiivinen kasvattaa. | `20%`
|&nbsp;
| **Night settings** | **Asetukset yötä varten** 
| Night time | Aikaväli, jolloin yöasetukset ovat käytössä. | `22:00-06:00`
| Brightness adjust | Paljonko kirkkautta muutetaan<br><br>Negativiinen arvo pienentää, positiivinen kasvattaa. | `-5 %`
| Blink allowed | Sallitaanko vilkutus yöaikaan | `ei`
|&nbsp;
| **Rules** | **Hinta- ja väriasetukset**
| ≥ c/kWh	| Hintaraja, jonka yläpuolella ehto on aktiivinen. [c/kWh] | #1: `5 c/kWh`
| Color | Käytettävä väri. Syötä arvo käsin tai paina laatikkoa avataksesi värivalinnan. | #1: `0, 255, 0 (vihreä)`
| Brightness | Valon kirkkaus [%] | #1: `10 %`
| Blink* | Vilkutetaanko valoa 2s välein? | #1: `ei`

*\* Vilkutuksen käyttö kuluttaa laitteen muistia pitkässä juoksussa - käytä ainoastaan vikatilanteessa tai harvinaisessa hintatilanteessa. Käyttö omalla vastuulla.*

Esimerkkikuvan asetuksilla säännöt toimivat seuraavasti:
* Jos hintaa ei saada haettua - väri on punainen ja valo vilkkuu
* Hinta < 5 c/kWh - väri on vihreä (sääntö #1)
* Hinta 5...10 c/kWh - väri on keltainen (sääntö #2)
* ...
* Hinta > 25 c/kWh - väri on punainen (sääntö #6)

### Kysymyksiä ja vastauksia


## In English

* Free and open source
* Own webserver that runs UI
* No registeration
* Monitoring and configuration using web browser in local network
* Freely configurable color, brightness and blink* for each price and error situation
* Testing setting before saving
* Possible to adjust brightness and blink during night-time
* Possible to adjust brighness when output is on

*\* Using blink might cause device lifetime to decrease. Use only in error situation or in rare price condition. Use at your own risk.*

### Installation

### Settings

### FAQ

## License

GNU Affero General Public License v3.0 - [LICENSE.txt](https://github.com/jisotalo/shelly-plug-nordpool-light/blob/master/LICENSE.txt)