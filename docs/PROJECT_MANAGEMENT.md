# Projektijuhtimine ja Kanban

See fail on repo-sisene projektijuhtimiskeskkonna vaade. Kuna projekt esitatakse GitHubi repositooriumina, on Kanban-tabel dokumenteeritud samas avalikus repos, et õpetaja näeks töövoogu ilma eraldi ligipääsuta.

## Kanban-tabel

| Backlog | Todo | In progress | Review/Test | Done |
| --- | --- | --- | --- | --- |
| Tulemuste salvestamine andmebaasi | Õpetaja statistika vaade | Küsimuste kvaliteedi parandused | Vastuvõtutingimuste kontroll | Ülesannete lugemine `input/` kaustast |
| Kasutajate süsteem | Püsiv mänguajalugu | README ja lõppülevaate täiendused | Railway deploy kontroll | Ülesande valimine avalehelt |
| Õpetaja ülesannete haldus | Täpsem AI vigade käsitlus |  | UI testimine desktopis | AI küsimuste genereerimine |
| LMS integratsioon |  |  |  | Miljonimängu põhiloogika |
|  |  |  |  | Õlekõrred: vihje, 50:50, publik |
|  |  |  |  | Tulemuse kuvamine mängu lõpus |
|  |  |  |  | Orange/white kasutajaliidese kujundus |

## Töövoo etapid

- **Backlog**: ideed ja hilisemad parandused, mida ei olnud vaja MVP jaoks.
- **Todo**: lähimad arendusülesanded, mis on valmis tööks.
- **In progress**: parajasti arenduses olevad muudatused.
- **Review/Test**: funktsioonid, mida kontrollitakse vastuvõtutingimuste või käsitsi testidega.
- **Done**: valmis funktsioonid, mis on testitud ja main-harusse jõudnud.

## Iteratsioonid

### Sprint 1: ülesannete avastamine ja valimine
Eesmärk oli saada tööle minimaalne kasutusvoog: rakendus loeb `input/` kausta, kuvab ülesanded ja lubab kasutajal mängu alustada.

### Sprint 2: AI küsimuste genereerimine
Järgmisena lisati OpenAI integratsioon, prompt ja küsimuste JSON-kuju, sest mängul ei ole väärtust ilma ülesandepõhiste küsimusteta.

### Sprint 3: mänguloogika ja õlekõrred
Kui küsimused olid olemas, lisati miljonimängu voog, punktid, vale/õige vastuse käsitlus ja õlekõrred.

### Sprint 4: kasutuskogemuse parandused
Viimases iteratsioonis parandati kujundust, vastusevariantide kvaliteeti, vihjete kasulikkust, popupide puhastamist ning küsimuste värskendamist lehe uuendamisel või läbikukkumisel.

Selline järjekord valiti sellepärast, et iga järgmine osa sõltus eelmisest: enne AI-d oli vaja ülesandeid lugeda, enne mänguloogikat oli vaja küsimusi ning enne viimistlust oli vaja terviklikku kasutusvoogu.
