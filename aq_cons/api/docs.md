## AqCons

### GET /:scope/aq_cons/plot/:id_plot/constructions

It returns all constructions last data (but geometry) of a plot.

Path's params:
  - scope (mandatory)
  - id_plot (mandatory)

Example request URL:
```text
/aljarafe/aq_cons/plot/plot_id:1/constructions
```

Example response:
```json
[
  {
    "id_entity": "construction_id:11",
    "TimeInstant": "2018-01-01T00:05:00.06Z",
    "refsector": "sector_id:17",
    "refplot": "plot_id:11",
    "name": "CL ROSA CHACEL 43",
    "floor": "0",
    "complete_plot": "t",
    "usage": "domestic",
    "flow": "0.00450899705737053",
    "pressure": "3.97463285179563",
    "created_at": "2018-01-12T12:21:32.031544Z",
    "updated_at": "2018-01-19T16:43:46.078296Z"
  }
]
```

### POST /:scope/aq_cons/tank/:tank_id/plans

It returns the plan for saving and emergency if exists.

Path's params:
  - scope (mandatory)
  - tank_id (mandatory)

Payload
```
{
 "time": "YYYY-mm-dd"
}
```

Payload's params:
  - time (mandatory)

Example request URL:
```text
/aljarafe/aq_cons/tank/tank:1/plans
```

Payload:
```
{
 "time": "2018-04-11"
}
```

Example response:
```json
{
    "saving": {
        "kwh_used": 540,
        "price_by_litre": 0.0911111111111111,
        "money_saved": 40.1266666666667,
        "energy_saved_ratio": 28.9473684210527
    },
    "emergency": {
        "kwh_used": 573.333333333333,
        "price_by_litre": 0.0693333333333333,
        "money_saved": 36.86,
        "energy_saved_ratio": 24.5614035087719
    },
    "activations": [
        {
            "start": "2018-01-04T00:00:00.000Z",
            "finish": "2018-01-04T00:32:00.000Z",
            "emergency": false
        },
        {
            "start": "2018-01-04T02:59:00.000Z",
            "finish": "2018-01-04T03:00:00.000Z",
            "emergency": false
        },
        {
            "start": "2018-01-04T05:59:00.000Z",
            "finish": "2018-01-04T06:00:00.000Z",
            "emergency": false
        },
        {
            "start": "2018-01-04T06:53:00.000Z",
            "finish": "2018-01-04T07:00:00.000Z",
            "emergency": false
        },
        {
            "start": "2018-01-04T21:00:00.000Z",
            "finish": "2018-01-04T21:13:00.000Z",
            "emergency": true
        }
    ]
}
```
