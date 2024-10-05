# QuickGraph API

QuickGraph is a lightweight, beginner-friendly graph API built for simple calculations.  It's primarily intended for educational purposes, simple tasks, or experimenting with fundamental mathematical operations on a graph structure.  QuickGraph is **not designed** for production-level applications needing extensive graph capabilities.

>[!CAUTION]
> This API is still under construction and may contain bugs and errors. Open an issue to report such bugs or errors.

## Quick Overview

QuickGraph allows users to perform basic arithmetic calculations. It currently handles the operations 'add', 'reduce', 'multiply', and 'divide', accessible through both GET and POST requests. This API leverages a simple state system, storing a current numerical value via cookies.  This value will be modified by the calculation commands and subsequently reflected in future responses. 


## Usage Example (JavaScript with Fetch API)


### GET Method (`/api/calc?<operator>=<number>`)

```javascript
// Example for "add" operation
fetch('/api/calc?add=5')
  .then(response => response.json())
  .then(data => {
    console.log(data); // Example output: { ok: true, number: 5, message: "Numbers Increased"}
  })
  .catch(error => console.error('Error:', error));
```
```javascript
// Example for "divided" operation
fetch('/api/calc?divided=2')
  .then(response => response.json())
  .then(data => {
    console.log(data); // Output: { ok: true, number: resultOfDivision, message: "Divided Numbers"}
  })
  .catch(error => console.error('Error:', error));
```


### POST Method (`/api/calc`)


```javascript
fetch('/api/calc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ operation: 'add', value: 3 })
})
  .then(response => response.json())
  .then(data => {
      console.log(data); // Expected Output : { ok: true, number: 3, message: "Numbers Increase"}
  })
  .catch(error => console.error('Error:', error));
```


## Data Model

The API maintains a running calculation, storing the results of previous operations using cookies.  A cookie named `number` holds the current calculated value.


## Important Considerations

* The API is designed for simplicity.
* Results are directly modified in the UI through a persisted session and reflect all cumulative previous results from all operation.
* No real time operation are possible, a user action causes server request to the specified endpoints


## Error Handling

Error responses from the API (e.g., `400`, `429`) are given as JSON arrays for standardized errors (example of response : `{ ok:false, code:"<code>", message: "<Message>"}`)


## Limitations

*   This API lacks sophisticated graph algorithm functionalities and performance optimization, best for use cases where straightforward arithmetic on an accumulated value suffice.



## Contributing


If you'd like to enhance or modify the functionalities:

Please reach out via the QuickGraph channel(s).

## Contact
Questions, suggestions, feedback, error or bug just open issues on this Github Repository
