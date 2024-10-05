# NanoFlex API

NanoFlex is a lightweight API built for simple, beginner-friendly data manipulation. It provides basic functionalities like character counting and calculations, making it suitable for learning, experimentation, and simple integration use cases.  NanoFlex is **not designed** for production-level applications needing complex algorithms or high performance.
> [!CAUTION]
> This API is **under development**, there may be many strange things, bugs and errors, report them by *opening issues* in this github repository

## Quick Overview

NanoFlex offers two primary endpoints for simple operations:

*   `/api/calc`: Performs mathematical calculations (add, reduce, multiply, divide) on a running total. The API supports both GET and POST methods. A current value is persisted in a session (cookie) for cumulative results.  An error occurs if division is performed by 0.


*   `/api/charCount`: Counts characters within a provided string, categorizing them into alphabets (a-z, A-Z), numbers (0-9), symbols, spaces, and others (characters not covered by the other categories). The API supports both GET and POST.

## Rate Limit 
- Before you use our API, you should see what our API **Rate Limit** is to prevent high resource usage and this is important.

| User | Rate Limit | Minutes |
| :---: | :---: | :---: |
| Default | **96 requests per IP** | *5 mins* |
| *Collaborator* | **220 requests per IP** | *15 mins* |
| **Developer/Owner** | **1k+ requests per IP** | *60mins+* |
## Endpoint Details

### `/api/calc`

This endpoint supports both GET and POST requests. The operations supported are "add", "reduce", "multiply" and "divide." The current number to operate on is stored in a session (cookie) and defaults to 0 if not initialized.  An error occurs if division is performed by 0.

**GET Request (Example):**

```
/api/calc?add=10
```

`value` represents the numerical amount. The GET method requires `operation`.

**POST Request (Example):**

```json
POST /api/calc
{
  "operation": "add",
  "value": 10
}
```


**Example Result (200 OK):**

```json
{
  "ok": true,
  "code": "200",
  "message": "Calculation successful",
  "data": {
    "number": 20 
  }
}
```

**Error Responses (Example):**

* **400 Bad Request (missing or invalid value):**  `/api/calc?value=invalidInput`
* **400 Bad Request (invalid operation):** `/api/calc?operation=invalidOperation&value=5`
* **429 Too Many Requests:**
- Spamming API
- Using API multiple times, [see what is the NanoFlex API rate limit](https://github.com/Syaamilmaulana256/nanoflex-api/tree/main?tab=readme-ov-file#rate-limit)
### `/api/charCount`


This endpoint counts characters based on categories.

**GET Request (Example):**

```
/api/charCount?text=Hello world!, 123
```

**POST Request (Example):**

```json
POST /api/charCount
{
  "text": "Hello world!, 123"
}
```

The request can have either the `text` parameter (GET) or a body with the text.


**Example Result (200 OK):**


```json
{
  "ok": true,
  "code": "200",
  "message": "Character count successful",
  "data": {
    "alphabet": 10,
    "numbers": 3,
    "symbols": 1,
    "spaces": 2,
    "others": 0,
    "total": 16
  }
}
```

Error responses like `400` or `404`  are returned for incorrect input in the request, making error handling transparent.



## Error Handling & Feedback

To report issues or suggest enhancements, please create an issue on the project repository, specifying the error/suggestion using appropriate tags such as `feature-request`, `bug`,  and `enhancement`.  


## Important Considerations


*  The design prioritizes simplicity and assumes requests follow specific syntaxes or formats outlined for parameters and input.


## Contributing

We welcome any contributions from users with feedback, testing suggestions, corrections, and other potential improvements to NanoFlex (see the CONTRIBUTING document or guidelines, should that be included).
