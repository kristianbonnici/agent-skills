# Reading what the search finds

Every candidate is read in full before it is judged: the abstract or a search excerpt is enough to find it, never to weigh it.

## Papers

- **arXiv:** read the full text at `https://arxiv.org/html/<id>` (the HTML version), or the PDF at `https://arxiv.org/pdf/<id>` when there is no HTML. The abstract page (`/abs/<id>`) gives the versions and their dates, and any venue in its comments.
- **Other venues:** the open version the authors link (their page, arXiv, OpenReview), named in the entry when it isn't the venue's own.

## A page that refuses automated reading

A 403 or a bot check means the page is there; it isn't gone. Read its archived copy:

1. Find the latest snapshot: `curl -sG --max-time 60 --data-urlencode "url=<url without https://>" https://archive.org/wayback/available` names its `timestamp` (encoded, so a URL with `?` or `&` is looked up whole).
2. Fetch the page as archived, without the archive's wrapper: `curl -sL --compressed "https://web.archive.org/web/<timestamp>id_/<url>"`. Without `--compressed` the body comes back unreadable.
3. Say in the entry that it was read from the archived copy of `<the snapshot's date>`.

Give each request a time limit (`--max-time 60`). A snapshot that doesn't replay (an error, an empty or unreadable page), or that is older than the page's own last update, counts as no snapshot for what it can't show. Then read the page through search excerpts or reputable coverage, and say so in the entry, as SKILL.md section 4 says. A cited source whose claims you couldn't confirm from what you could read (no copy, or excerpts that leave a figure or quote unchecked) isn't rechecked: add "(not rechecked <date>: <why>)" to its entry and name it in the report, so the next run tries it whatever the file's sources date. Don't ask the archive to take a new snapshot: that publishes a request outside this run.

## Dates when an index shows none

A blog or news index without dates still says when each post appeared in its feed or sitemap: try `<site>/rss.xml`, `<site>/feed`, `<site>/news/rss.xml` and `<site>/sitemap.xml`, and read each item's `pubDate`. A sitemap's `lastmod` only says the page changed, maybe its template: take it as a lead and check the post's own date, or what it says it revised, before it counts for the search window or the bar's "recent". A candidate whose date you can't establish goes under "Left out" as "(not yet read: no date found)". OpenAI's news, for example, is at `https://openai.com/news/rss.xml`.

## A candidate you couldn't finish

A candidate that the run found but couldn't read in full (the time ran out, or no copy could be read) goes under "Left out" with "(not yet read: <why>)" in place of a reason, written exactly so. The next run weighs it first, whatever its date or what "Left out" says of the rest, and replaces the line with its decision; if it still can't read it, the mark stays with that run's reason.
