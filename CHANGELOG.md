# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# Suomeksi

## [1.1.0] - 07.04.2024
- Muutettu kirkkauden säätöä kun lähtö on päällä tai on yöaika
  - Aiemmin syötettiin prosenttiyksiköt
  - Nyt syötetään muutoksen prosenttiarvo
    - 0% = kirkkaus 0
    - 100% = alkuperäinen kirkkaus
    - 200% = 2x kirkkaampi kuin alkuperäinen
- Bugikorjaus: Yöajan kirkkaussäätö ei toiminut jos lähtö oli päällä

## [1.0.0] - 02.04.2024
- Ensimmäinen julkinen versio

# In English

## [1.1.0] - 07.04.2024
- Changed brightness adjust operation of output on and night time 
  - Before, the adjust was %-units
  - Now the adjustment is %
    - 0% = brightness 0
    - 100% = original brightness
    - 200% = 2x brightner than the original brightness
- Bugfix: Night time brightness adjust didn't work if output was on
 
## [1.0.0] - 02.04.2024
- First public version