# Week 8 Blind Test Report

## Part C: Blind Swap

I received the Salama team's `README_Blind`

## Part D: Blind Test

### Attempted request

The README's local setup instructions identify the API base URL as
`http://localhost:5000`. Following the documented Resources example, I ran:

```bash
curl http://localhost:5000/api/resources
```

### Result

The request returned:

```http
HTTP/1.1 404 Not Found
```

The response body was:

```html
<pre>Cannot GET /api/resources</pre>
```

I also checked the documented root URL:

```bash
curl http://localhost:5000/
```

That returned a successful response, but it identified the running service as
the SettleIn Student Housing API rather than Salama. Therefore it was not a
successful call against the Salama API.

The test took less than one minute. I could not continue to a successful Salama
request because the README only provides local instructions and no reachable
Salama deployment URL, and the service running on the documented port was a
different API.

## Part E: SettleIn README Findings and Follow-up

The SettleIn README was reviewed from the perspective of a reader who did not
already know the repository. Before the fix, it started the frontend but did
not give the reader the commands to install, configure, or start the backend.
It also presented `localhost:5000` without explaining that this address is
local to the machine running the API. A reader on another computer could not
use that URL to access this API.

I fixed the README by adding:

- Backend dependency installation.
- `.env` creation from `.env.example`.
- A repeatable MySQL schema and seed-data import for a clean clone.
- The requirement for a local MySQL database named `settlein_db`, or an
  alternative database configuration.
- Separate frontend and backend start commands.
- An explicit explanation that `localhost:5000` is not a public deployment
  URL.

The SettleIn API is not deployed to a public host, so a reader on another
computer cannot call it through `localhost:5000`. They can now reproduce the
API locally by importing the included schema and seed data, or use a shared
LAN/tunnel URL or a real deployed API URL.

No outside team successfully tested the SettleIn README against a separate
machine or deployment during this session, so I am not claiming that a remote
blind call succeeded. The documented local quickstart is now more complete,
and the clean-clone database gap is addressed. Remote access remains an
explicitly flagged gap until the API is deployed or exposed through a shared
URL.

## Part E: Salama Blind-Test Result

The README needs an environment-specific way to start or reach the Salama API
for a blind tester. In particular, the local setup instructions should ensure
that the Salama server is running on port 5000, or provide a live base URL and
an explicit command to verify that the running service is Salama before testing
`/api/resources`.

It did not work: I could not obtain a working Salama API response using only
the supplied README. The documented endpoint was attempted exactly as written,
but localhost:5000 was occupied by a different API and returned 404 for the
Salama route. No code or undocumented endpoint was used to bypass the blind
test.
