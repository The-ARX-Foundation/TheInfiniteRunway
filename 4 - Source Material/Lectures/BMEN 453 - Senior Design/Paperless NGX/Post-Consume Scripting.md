---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index:
  - "[[Lectures]]"
Topic:
  - "[[BMEN 453 - Senior Design]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Programming]]

## Hooking into the consumption process

Sometimes you may want to do something arbitrary whenever a document is consumed. Rather than try to predict what you may want to do, Paperless lets you execute scripts of your own choosing just before or after a document is consumed using a couple of simple hooks.

Just write a script, put it somewhere that Paperless can read & execute, and then put the path to that script in `paperless.conf` or `docker-compose.env` with the variable name of either [`PAPERLESS_PRE_CONSUME_SCRIPT`](https://docs.paperless-ngx.com/configuration/#PAPERLESS_PRE_CONSUME_SCRIPT) or [`PAPERLESS_POST_CONSUME_SCRIPT`](https://docs.paperless-ngx.com/configuration/#PAPERLESS_POST_CONSUME_SCRIPT).

Info

These scripts are executed in a **blocking** process, which means that if a script takes a long time to run, it can significantly slow down your document consumption flow. If you want things to run asynchronously, you'll have to fork the process in your script and exit.

### Pre-consumption script

Executed after the consumer sees a new document in the consumption folder, but before any processing of the document is performed. This script can access the following relevant environment variables set:

|Environment Variable|Description|
|---|---|
|`DOCUMENT_SOURCE_PATH`|Original path of the consumed document|
|`DOCUMENT_WORKING_PATH`|Path to a copy of the original that consumption will work on|
|`TASK_ID`|UUID of the task used to process the new document (if any)|

Note

Pre-consume scripts which modify the document should only change the `DOCUMENT_WORKING_PATH` file or a second consume task may be triggered, leading to failures as two tasks work on the same document path

Warning

If your script modifies `DOCUMENT_WORKING_PATH` in a non-deterministic way, this may allow duplicate documents to be stored

A simple but common example for this would be creating a simple script like this:

`/usr/local/bin/ocr-pdf`

`[](https://docs.paperless-ngx.com/advanced_usage/#__codelineno-0-1)#!/usr/bin/env bash [](https://docs.paperless-ngx.com/advanced_usage/#__codelineno-0-2)pdf2pdfocr.py -i ${DOCUMENT_WORKING_PATH}`

`/etc/paperless.conf`

`[](https://docs.paperless-ngx.com/advanced_usage/#__codelineno-1-1)... [](https://docs.paperless-ngx.com/advanced_usage/#__codelineno-1-2)PAPERLESS_PRE_CONSUME_SCRIPT="/usr/local/bin/ocr-pdf" [](https://docs.paperless-ngx.com/advanced_usage/#__codelineno-1-3)...`

This will pass the path to the document about to be consumed to `/usr/local/bin/ocr-pdf`, which will in turn call [pdf2pdfocr.py](https://github.com/LeoFCardoso/pdf2pdfocr) on your document, which will then overwrite the file with an OCR'd version of the file and exit. At which point, the consumption process will begin with the newly modified file.

The script's stdout and stderr will be logged line by line to the webserver log, along with the exit code of the script.

### Post-consumption script

Executed after the consumer has successfully processed a document and has moved it into paperless. It receives the following environment variables:

|Environment Variable|Description|
|---|---|
|`DOCUMENT_ID`|Database primary key of the document|
|`DOCUMENT_FILE_NAME`|Formatted filename, not including paths|
|`DOCUMENT_CREATED`|Date & time when document created|
|`DOCUMENT_MODIFIED`|Date & time when document was last modified|
|`DOCUMENT_ADDED`|Date & time when document was added|
|`DOCUMENT_SOURCE_PATH`|Path to the original document file|
|`DOCUMENT_ARCHIVE_PATH`|Path to the generate archive file (if any)|
|`DOCUMENT_THUMBNAIL_PATH`|Path to the generated thumbnail|
|`DOCUMENT_DOWNLOAD_URL`|URL for document download|
|`DOCUMENT_THUMBNAIL_URL`|URL for the document thumbnail|
|`DOCUMENT_OWNER`|Username of the document owner (if any)|
|`DOCUMENT_CORRESPONDENT`|Assigned correspondent (if any)|
|`DOCUMENT_TAGS`|Comma separated list of tags applied (if any)|
|`DOCUMENT_ORIGINAL_FILENAME`|Filename of original document|
|`TASK_ID`|Task UUID used to import the document (if any)|

The script can be in any language, A simple shell script example:

post-consumption-example

```shell
#!/usr/bin/env bash

echo "

A document with an id of ${DOCUMENT_ID} was just consumed.  I know the
following additional information about it:

* Generated File Name: ${DOCUMENT_FILE_NAME}
* Archive Path: ${DOCUMENT_ARCHIVE_PATH}
* Source Path: ${DOCUMENT_SOURCE_PATH}
* Created: ${DOCUMENT_CREATED}
* Added: ${DOCUMENT_ADDED}
* Modified: ${DOCUMENT_MODIFIED}
* Thumbnail Path: ${DOCUMENT_THUMBNAIL_PATH}
* Download URL: ${DOCUMENT_DOWNLOAD_URL}
* Thumbnail URL: ${DOCUMENT_THUMBNAIL_URL}
* Owner Name: ${DOCUMENT_OWNER}
* Correspondent: ${DOCUMENT_CORRESPONDENT}
* Tags: ${DOCUMENT_TAGS}

It was consumed with the passphrase ${PASSPHRASE}

"
```


Note: The post consumption script cannot cancel the consumption process.

Warning: The post consumption script should not modify the document files directly.

The script's stdout and stderr will be logged line by line to the webserver log, along with the exit code of the script.

### Docker

To hook into the consumption process when using Docker, you will need to pass the scripts into the container via a host mount in your `docker-compose.yml`.

Assuming you have `/home/paperless-ngx/scripts/post-consumption-example.sh` as a script which you'd like to run.

You can pass that script into the consumer container via a host mount:

```python
...
webserver:
  ...
  volumes:
    ...
    - /home/paperless-ngx/scripts:/path/in/container/scripts/ 
  environment: 
    ...
    PAPERLESS_POST_CONSUME_SCRIPT: /path/in/container/scripts/post-consumption-example.sh 
...
```

Troubleshooting:

- Monitor the Docker Compose log `cd ~/paperless-ngx; docker compose logs -f`
- Check your script's permission e.g. in case of permission error `sudo chmod 755 post-consumption-example.sh`
- Pipe your scripts's output to a log file e.g. `echo "${DOCUMENT_ID}" | tee --append /usr/src/paperless/scripts/post-consumption-example.log`
# Post Consume Script Examples

WebWorkingMan edited this page Aug 30, 2024 · [9 revisions](https://github.com/paperless-ngx/paperless-ngx/wiki/Post-Consume-Script-Examples/_history)

This wiki page is a repository of example [post-consume scripts](https://docs.paperless-ngx.com/advanced_usage/#post-consume-script) contributed by the community. As always, you should exercise caution when using a script and make sure you understand the code before using a script from the internet.

## Python + API
A more advanced post consume script which uses Python and the API to assign some new values to a document which has just been consumed. Make sure the script has execute permissions.

```python
#!/usr/bin/env python3

import os
import json

# TODO: The user can use anything in the standard library, installed for paperless
# or use the custom startup scripts to install additional libraries via pip
import requests


def _set_auth_tokens(paperless_url: str, timeout: float, session: requests.Session):
    # TODO: You fill these in or otherwise provide them
    credentials = {"username": "test", "password": "test"}

    response = session.get(paperless_url, timeout=timeout)
    response.raise_for_status()

    csrf_token = response.cookies["csrftoken"]

    response = session.post(
        paperless_url + "/api/token/",
        data=json.dumps(credentials),
        headers={
            "X-CSRFToken": csrf_token,
            "Content-Type": "application/json"
        },
        timeout=timeout,
    )
    response.raise_for_status()

    api_token = response.json()["token"]

    session.headers.update(
        {"Authorization": f"Token {api_token}", f"X-CSRFToken": csrf_token}
    )


if __name__ == "__main__":
    # Running inside the Docker container
    # TODO: Update this as needed
    paperless_url = "http://localhost:8000"
    timeout = 5.0

    with requests.Session() as sess:
        # Set tokens for the appropriate header auth
        _set_auth_tokens(paperless_url, timeout, sess)

        # Get the PK as provided via post-consume
        doc_pk = int(os.environ["DOCUMENT_ID"])

        # Query the API for the document info
        doc_info_resp = sess.get(
            paperless_url + f"/api/documents/{doc_pk}/", timeout=timeout
        )
        doc_info_resp.raise_for_status()
        doc_info = doc_info_resp.json()

        # Extract the currently assigned values
        correspondent = doc_info["correspondent"]
        doc_type = doc_info["document_type"]
        doc_original_name = doc_info["original_file_name"]
        # etc...

        # Parse, set, otherwise choose new values
        # TODO: Up to the user to decide how these new values should be set
        # Use regex, etc to get the primary key of the new values
        new_correspondent = 1
        new_doc_type = 1

        # Update the document
        resp = sess.patch(
            paperless_url + f"/api/documents/{doc_pk}/",
            headers={"Content-Type": "application/json"},
            data=json.dumps({"correspondent": new_correspondent, "document_type": new_doc_type}),
            timeout=timeout,
        )
        resp.raise_for_status()
```

## Send new document message via ntfy + Paperparrot
```python
#!/usr/bin/env python3

import os, requests, json

DOCUMENT_ID = os.getenv('DOCUMENT_ID')
USER = os.getenv('DOCUMENT_OWNER')

PAPERPARROT_URL = f"paperparrot://documents/{DOCUMENT_ID}"
NTFY_URL = "https://ntfy.example.com/"

requests.post(NTFY_URL, data=json.dumps({
    "topic": USER,
    "message": f"Hi, {USER}, a Document has been added",
    "actions": [{"action": "view", "label": "Open", "url": PAPERPARROT_URL}]
}), headers={"Click": PAPERPARROT_URL})
```

