# NanoFlex API

NanoFlex is a *lightweight API* built for <ins>*simple, beginner-friendly data manipulation*</ins>. It provides *basic functionalities like character counting and calculations, making it suitable for learning, experimentation, and simple integration use cases*.  NanoFlex is **not designed** for production-level applications needing complex algorithms or high performance.
> [!CAUTION]
> This API is **under development**, there may be many strange things, bugs and errors, report them by *opening issues* in this github repository

## Becoming a Collaborator

We welcome any collaborators from users with *feedback, testing suggestions, corrections* and other potential improvements to NanoFlex, You can become a collaborator by opening an issue with the tag `collaborator`. 
[see this for example](https://github.com/Syaamilmaulana256/nanoflex-api/issues/2)

## Quick Overview

NanoFlex offers *two primary* endpoints for simple operations:

*   `/api/calc`: Performs mathematical calculations <ins>(add, reduce, multiply, divide)</ins> on a running total. The API supports both `GET` and `POST` methods. A current value is persisted in *a session (cookie)* for cumulative results and reset after *24 hours*.  *An error occurs if division is performed by 0*.


*   `/api/charCount`: Counts characters within a provided string, categorizing them into *alphabets (a-z, A-Z), numbers (0-9), symbols, spaces, and others (characters not covered by the other categories)*. The API supports both `GET` and `POST`.

## Rate Limit 
- *Before you use our API*, you should see what our API **Rate Limit** is to <ins>prevent high resource usage and this is important</ins>.
- The minutes referred to in the table are to *reset the request to default*, This happens if you use it *many times, or spam occurs*. If spam occurs for 5 minutes and the request exceeds, then it will **Rate Limit**
  
| Rate Limit | Minutes |
| :---: | :---: |
| **96 requests per IP** | *5 mins* |
## Endpoint Details

### `/api/calc`

This endpoint supports both GET and POST requests. The operations supported are *"add", "reduce", "multiply":and "divide."* The current number to operate on is stored in a session (cookie) and defaults to 0 if not initialized.  An error occurs if division is performed by 0.

Endpoint 

```
/api/calc?<operation>=<value>
```

`<operation>` is the mathematical operation (add, reduce, multiply and divide), while `<value>` is the number to be calculated.

**GET Request (Example):**

```
/api/calc?add=10
```

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
  * Spamming API
  * Using API multiple times
[see what is the NanoFlex API rate limit](#rate-limit)
### `/api/charCount`


Endpoint 

```
/api/charCount?text=<string>
```

Fill `<string>` with text

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

> [!NOTE]
> Chances are, Error `400` and `404` are **almost impossible** to occur because it is just a character count, if you encounter it, open an `issue` as a `bug` tag.



## Error Handling & Feedback

To report *issues, suggest or enhancements*, please create an issue on the project repository, specifying the error/suggestion using appropriate tags such as `suggestion`, `bug`,  and `enhancement`.  


## Important Considerations


*  The design prioritizes simplicity and assumes requests follow specific syntaxes or formats outlined for parameters and input.


