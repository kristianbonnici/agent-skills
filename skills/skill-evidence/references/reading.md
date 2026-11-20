# Reading what the search finds

Every candidate is read in full before it is judged: the abstract or a search excerpt is enough to find it, never to weigh it.

## Papers

- **arXiv:** read the full text at `https://arxiv.org/html/<id>` (the HTML version), or the PDF at `https://arxiv.org/pdf/<id>` when there is no HTML. The abstract page (`/abs/<id>`) gives the versions and their dates, and any venue in its comments.
- **Other venues:** the open version the authors link (their page, arXiv, OpenReview), named in the entry when it isn't the venue's own.

## A page that refuses automated reading

A 403 or a bot check means the page is there; it isn't gone. Read its archived copy:

1. Find the latest snapshot: `curl -s "https://archive.org/wayback/available?url=<url without https://>"` names its `timestamp`.
2. Fetch the page as archived, without the archive's wrapper: `curl -sL --compressed "https://web.archive.org/web/<timestamp>id_/<url>"`. Without `--compressed` the body comes back unreadable.
3. Say in the entry that it was read from the archived copy of `<the snapshot's date>`. A snapshot older than the page's own last update doesn't count for that update.

Only when no snapshot exists, read it through search excerpts or reputable coverage, and say so in the entry, as SKILL.md section 4 says. Don't ask the archive to take a new snapshot: that publishes a request outside this run.

## Dates when an index shows none

A blog or news index without dates still says when each post appeared in its feed or sitemap: try `<site>/rss.xml`, `<site>/feed`, `<site>/news/rss.xml` and `<site>/sitemap.xml`, and read each item's `pubDate` or `lastmod`. OpenAI's news, for example, is at `https://openai.com/news/rss.xml`.

## A candidate you couldn't finish

A candidate that the run found but couldn't read in full (the time ran out, or no copy could be read) goes under "Left out" with "(not yet read: <why>)" in place of a reason. The next run weighs it again first, whatever "Left out" says of the rest, and replaces that line with its decision.
