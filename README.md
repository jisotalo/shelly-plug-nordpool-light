# shelly-plug-nordpool-light
[![License](https://img.shields.io/badge/License-AGPLv3-orange)](https://choosealicense.com/licenses/agpl-3.0/)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/shelly-plug-nordpool-light)
[![Support](https://img.shields.io/badge/Support_with-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)
 
 Hieman yliampuva pörssisähkön hinnan mukaan valoa ohjaava skripti **Shelly Plus Plug S** -etäohjattavaan pistorasiaan. Skriptin konfiguroidaan selaimella toimivalla käyttöliittymällä kotiverkosta. Käyttää [Eleringin](https://dashboard.elering.ee/api) rajapintaa eikä vaadi rekisteröitymistä.

 **Huom:** Tämä skripti ei ohjaa pistorasialähtöä! Tämä skripti ainoastaan asettaa RGB-valon hinnan mukaan. Jos haluat ohjata pistorasiaa pörssisähkön hinnan mukaan, katso toinen projektini [shelly-porssisahko](https://github.com/jisotalo/shelly-porssisahko). Voit laittaa molemmat skriptit toimimaan samanaikaisesti.

 ---

 An overkill script for **Shelly Plus Plug S** to control the RGB light based on active Nordpool electricity price. The prices are available for Finland, Estonia, Latvian and Lithuania. Settings can be adjusted using web-based UI in the local network. Uses [Elering](https://dashboard.elering.ee/api) API, so no registeration is needed.

 **Note:** This script does not control the output - it only handles the RGB LED color. If you want to control the output based on electricity price, see my other project [shelly-porssisahko](https://github.com/jisotalo/shelly-porssisahko). You can run both scripts at the same time.

## Sisällysluettelo / Table of Contents
<!-- TOC -->

- [shelly-plug-nordpool-light](#shelly-plug-nordpool-light)
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
3. Avaa **Scripts**-sivu Shellyn hallinnasta. Poista olemassaolevat skriptit, jos niitä on.
4. Paina **Library**-painiketta

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/5fe7184e-f9ac-4fd4-b461-ad2239a96d95)

5. Aukeavassa ikkunassa paina **Configure URL**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/ccd4b9fd-f9f2-4f42-8bc9-74c9486f6432)

6. Syötä osoitteeksi `https://raw.githubusercontent.com/jisotalo/shelly-porssisahko/master/shelly-library.json` ja paina **Save**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/972fedb9-8503-4d90-a9b2-3af6f430ed7d)

7. Nyt kirjastoon ilmestyy pörssisähköohjaus. Asenna se painamalla **Import code**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/9139dad1-e3ec-4a09-9e39-d940af5ea9d7)

8. Kun skripti ilmestyy, paina **Save**

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2a241033-4ccb-415e-b422-373ec7ce54ef)

9. Tallentamisen jälkeen paina **Start**, jolloin skripti käynnistyy

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/8b30aa9f-b9de-44a7-9677-6872404b022d)

10. Jos websocket debug on päällä (**kohta 2**), näet hallinnan osoitteen suoraan skriptin alla konsolissa. Kopioi tämä osoite ja avaa se selaimella. Jos et näe sitä niin osoite on muotoa `http://ip-osoite/script/1`


    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/93b64aea-ec36-4ea4-88ff-e0a75146262b)

11. Varmista vielä että skripti käynnistyy aina automaattisesti. Eli **Scripts**-sivulla pitää shelly-porssisahko.js -skriptin kohdalla olla valinta päällä.

    ![image](https://github.com/jisotalo/shelly-porssisahko/assets/13457157/2d9fbb5f-e2c5-4f5c-a457-5606825184f3)

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