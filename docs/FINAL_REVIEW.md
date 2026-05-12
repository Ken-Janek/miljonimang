# Lõppülevaade

## Lõppdemo

Rakendus on kättesaadav Railway aadressil:

https://miljonimang-production.up.railway.app/

Põhikasutusvoog:

1. Kasutaja avab avalehe.
2. Kasutaja valib `input/001` näidisülesande.
3. Rakendus loeb `assignment.md` ja lahenduse failid.
4. AI genereerib küsimused või API vea korral kasutatakse fallback-küsimusi.
5. Kasutaja mängib miljonimängu formaadis küsimustele vastates.
6. Kasutaja saab kasutada vihjet, 50:50 ja publiku hääletust.
7. Vale vastuse, loobumise või kõigi küsimuste läbimise järel kuvatakse tulemus.

## Nõuete täitmine

| Nõue | Staatus | Märkus |
| --- | --- | --- |
| GitHub repo sisaldab lähtekoodi | Täidetud | Kood asub `src/`, `input/`, `prompts/` kaustades. |
| README.md on olemas | Täidetud | Sisaldab kirjeldust, tehnoloogiaid, kasutamist ja AI loogikat. |
| Vähemalt üks näidisülesanne `input/` kaustas | Täidetud | `input/001` sisaldab kalkulaatori ülesannet ja lahendusfaile. |
| AI prompt on nähtav | Täidetud | `prompts/question-generation.md` ja prompti ehitus `src/services/aiService.js`. |
| Projektijuhtimise/Kanbani vaade | Täidetud | Vaata `docs/PROJECT_MANAGEMENT.md`. |
| Kanbanis on vajalikud töövoo etapid | Täidetud | Backlog, Todo, In progress, Review/Test ja Done on kirjeldatud. |
| Product backlog kasutajalugudega | Täidetud | `PRODUCT_BACKLOG.md`. |
| Vastuvõtutingimused | Täidetud | Kirjas olulisemate kasutajalugude juures. |
| Iteratiivne arendus on nähtav | Täidetud | Git commitid ja `docs/PROJECT_MANAGEMENT.md` sprintide kirjeldus. |
| Definition of Done | Täidetud | `DEFINITION_OF_DONE.md`. |
| Testimine on dokumenteeritud | Täidetud | `TESTING.md`. |
| Lõppdemo kirjeldus | Täidetud | Sama fail, jaotis "Lõppdemo". |
| Tagasivaade | Täidetud | Sama fail, jaotis "Tagasivaade". |
| Edasiarendatav struktuur | Täidetud | Ülesanded lisatakse `input/XXX` kaustadena, teenused ja route'id on eraldatud. |
| Õpetaja ligipääs | Täidetud, kui repo on avalik | Kui repo muudetakse privaatseks, tuleb õpetajale anda GitHubi ligipääs. |

## Mis sai valmis

- Avaleht loeb ülesanded `input/` kaustast.
- Näidisülesanne `input/001` on olemas.
- AI küsimuste genereerimise prompt on repos.
- Mäng genereerib või fallbackib 15 küsimust.
- Vastusevariandid randomiseeritakse.
- Küsimused värskenduvad lehe refreshimisel ja pärast läbikukkumist.
- Õlekõrred töötavad: vihje, 50:50 ja publikuhääletus.
- Kasutajaliides on lihtsustatud orange/white stiilis.
- Deployment töötab Railway kaudu.

## Mis jäi tegemata

- Püsiv tulemuste salvestamine andmebaasi jäi tegemata, sest MVP eesmärk oli valideerida põhikasutusvoog.
- Kasutajakontod jäid tegemata, sest ühe mängija anonüümne voog oli esmane.
- Õpetaja statistika vaade jäi backlogi, sest see eeldaks andmebaasi ja kasutajate süsteemi.

## Tagasivaade

### Mis õnnestus

Kõige paremini õnnestus rakenduse modulaarsus: ülesannete lugemine, AI loogika, mängu route'id ja kasutajaliides on eraldi. See teeb uute ülesannete lisamise lihtsaks.

### Mis oli keeruline

Keerulisem osa oli AI küsimuste kvaliteet. Esialgu olid õiged vastused liiga ilmsed, sest need olid sageli pikemad või detailsemad. Seda parandati prompti täpsustamise, fallback-küsimuste tasakaalustamise ja lisavalideerimisega.

### Mida järgmises iteratsioonis parandada

Järgmises iteratsioonis lisaksin tulemuste salvestamise, õpetaja statistika vaate ja püsiva küsimuste ajaloo. Samuti võiks Kanban liikuda GitHub Projects vaatesse, kui õpetajal on sellele ligipääs.
