# Brancher un vrai backend

Aujourd’hui, les données vivent dans `js/data.js` (paniers `lots`, historique `hist`) et les mesures de la boîte
sont simulées dans `js/merchant.js`. Pour passer à un vrai serveur, remplacez ces points un par un.

| Où dans le code | Aujourd’hui | Avec un backend |
| --- | --- | --- |
| `js/data.js` : `lots` | liste en mémoire | `GET /api/lots` (prix, score et blocage calculés côté serveur) |
| `js/market.js` : réservation | objet `res` en mémoire | `POST /api/lots/{id}/reserve` (verrou de 10 min, code de retrait aléatoire), `DELETE /api/lots/{id}/reservation` |
| `js/merchant.js` : `finish()` | résultats tirés au hasard | résultats de la boîte (ESP32 → MQTT → API), par exemple via un flux SSE |
| `js/merchant.js` : `save()` | `hist.unshift(...)` | `POST /api/tests` puis `GET /api/tests` pour l’historique et le stock |
| `js/merchant.js` : instruments en direct | `setInterval` qui simule la boîte | `GET /api/telemetry/current` toutes les 2 s |

Règles à respecter côté serveur :

- **Le serveur est la source de vérité** pour le score, le prix et le blocage (`js/pricing.js` sert de référence ;
  reproduisez les formules et vérifiez-les avec `tests/pricing.test.js`).
- Faites la réservation dans une **transaction** : deux étudiants ne doivent jamais obtenir le même panier.
- Le code de retrait est généré par le serveur (aléatoire), n’est envoyé qu’à l’étudiant qui réserve et devient
  invalide après usage ou expiration.
- Authentifiez les routes commerçant, autorisez uniquement l’origine du site en CORS et servez en HTTPS.
- Le texte saisi par l’utilisateur est échappé à l’affichage (`esc()` dans `js/util.js`) : gardez ce réflexe.

Télémétrie suggérée (une ligne JSON toutes les 30 à 60 s, topic MQTT `fwr/<id-boite>/telemetry`) :

```json
{ "ts": 1767265200000, "gas_bme": 142.0, "gas_mq": 310.0, "temp": 4.2, "temp_bme": 5.4,
  "hum": 62.0, "weight_g": 1450, "door": false, "fan": false, "phase": "accumulation" }
```

`temp` est la sonde DS18B20 (fiable, sert aux degrés-heures) ; `temp_bme` est informative, car le BME680 chauffe.
