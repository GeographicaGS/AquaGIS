
### POST /:scope/aq_simul/simulation/count

It returns a classification by type of the constructions.

Path's params:
  - scope (mandatory).

Body's params:
  - filters (mandatory).
  - filters.bbox (optional).

Example request URL:
```text
/aljarafe/aq_simul/simulation/count
```

Example body:
```json
{
  "filters" : {
    "bbox" : [...]
  }
}
```

Example response:
```json
[
    {
        "type_name": "Edificio",
        "count": "7",
        "rows": [
            {
                "type_id": 6,
                "type_value": 60,
                "type_parameter": "Número de habitantes",
                "count": "100"
            },
            {
                "type_id": 1,
                "type_value": 10,
                "type_parameter": "Número de habitantes",
                "count": "200"
            },
            {
                "type_id": 2,
                "type_value": 20,
                "type_parameter": "Número de habitantes",
                "count": "500"
            },
            {
                "type_id": 3,
                "type_value": 30,
                "type_parameter": "Número de habitantes",
                "count": "750"
            },
            {
                "type_id": 4,
                "type_value": 40,
                "type_parameter": "Número de habitantes",
                "count": "1000"
            },
            {
                "type_id": 5,
                "type_value": 50,
                "type_parameter": "Número de habitantes",
                "count": "1000"
            }
        ]
    }
]
```

### POST /:scope/aq_simul/map/historic

It returns all entities of a type as GeoJSON `FeatureCollection` with the acumulated consumption value between two dates and other data.

Path's params:
  - scope (mandatory)

Body's params:
  - time.start (mandatory)
  - time.finish (mandatory)

Example request URL:
```text
/aljarafe/aq_simul/map/historic
```

Example body:
```json
{
  "time": {
  	"start": "2018-01-16T00:00:00Z",
  	"finish": "2018-01-20T23:59:59Z"
  }
}
```

Example response:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -6.05800766117674,
          37.353173399743
        ]
      },
      "properties": {
        "id_entity": "sector_id:16_industrial",
        "calibre": 50,
        "consumption": 42.7002512456547,
        "tipo": 2,
        "n_personas": 4
      }
    }
  ]
}
```