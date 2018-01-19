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
