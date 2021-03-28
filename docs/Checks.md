# Checks

Checks are configuration files thats lets policyer know what needed to check on the provider data.

## configuration

Used by the provider to collect the necessary data for the checks.

fields:

- provider : String - provider name
- type : String - identifier field
- payload : Object - collecting payload

## checks

policyer will loop over the checks and each step to check if the data is compliance with the check spec.

fields:

- id : String - check id
- name : String - check name
- severity : String - check severity
- parser : String: jmespath/lodash (default: lodash)
- steps : Array - list of steps

## steps

the smallest unit of check.

fields:

- path : String - path in data
- condition : String - one of equal/not/gt/gte/lt/lte/includes
- evaluationMethod: String - map (default: none)
- evaluationMethodFailPolicy: String - and/or (default: and)
- utility : every [lodash](https://lodash.com/docs/) methods
- utilityProps : Array - array of parameters to pass to the utility function
- value : any - value to compare

you can add condition for steps:

fields:

- [and/or] : Step[] - step condition

### Examples

```json
{
  "configuration": {
    "provider": "todo-provider",
    "type": "resource",
    "resource": "todo",
    "payload": {
      "id": 1
    }
  },
  "checks": [
    {
      "id": "todo-id-check",
      "name": "check if todo has an id.",
      "severity": "High",
      "steps": [
        {
          "path": "id",
          "condition": "equal",
          "utility": "isInteger",
          "value": true
        },
        { "path": "id", "condition": "equal", "value": 1 }
      ]
    },
    {
      "id": "todo-userId-check",
      "name": "check if todo has a userId.",
      "severity": "High",
      "steps": [
        {
          "path": "userId",
          "condition": "equal",
          "utility": "isInteger",
          "value": true
        },
        {
          "or": [
            { "path": "userId", "condition": "equal", "value": 1 },
            { "path": "userId", "condition": "equal", "value": "1" }
          ]
        }
      ]
    },
    {
      "id": "todo-title-check",
      "name": "check if todo has a title.",
      "severity": "Warning",
      "steps": [
        {
          "path": "title",
          "condition": "not",
          "utility": "isEmpty",
          "value": true
        },
        {
          "path": "title",
          "condition": "gt",
          "utility": "get",
          "utilityProps": ["length"],
          "value": 3
        }
      ]
    },
    {
      "id": "todo-completed-check",
      "name": "check if todo has a valid completed field.",
      "severity": "Warning",
      "steps": [
        {
          "path": "completed",
          "condition": "includes",
          "value": [true, false]
        }
      ]
    }
  ]
}
```

```yaml
---
configuration:
  provider: todo-provider
  type: resource
  resource: todo
  payload:
    id: 1
checks:
  - id: todo-id-check
    name: check if todo has an id.
    severity: High
    steps:
      - path: id
        condition: equal
        utility: isInteger
        value: true
      - path: id
        condition: equal
        value: 1
  - id: todo-userId-check
    name: check if todo has a userId.
    severity: High
    steps:
      - path: userId
        condition: equal
        utility: isInteger
        value: true
      - or:
          - path: userId
            condition: equal
            value: 1
          - path: userId
            condition: equal
            value: "1"
  - id: todo-title-check
    name: check if todo has a title.
    severity: Warning
    steps:
      - path: title
        condition: not
        utility: isEmpty
        value: true
      - path: title
        condition: gt
        utility: get
        utilityProps:
          - length
        value: 3
  - id: todo-completed-check
    name: check if todo has a valid completed field.
    severity: Warning
    steps:
      - path: completed
        condition: includes
        value:
          - true
          - false
```
