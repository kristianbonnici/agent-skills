# Share a prototype

1. Confirm the runnable prototype directory.
2. Confirm the target and the visibility with the user for this deployment, even when the user's request, a saved preference, or a saved share target suggests one. A saved target is a suggestion, not consent: name it, say whether the result will be public (anyone with the link, possibly indexed) or private (login or an unguessable link only), and wait for a yes. If the target has no private option, say so. Ask where to deploy when nothing is saved.
3. Check that the prototype holds no real data before anything leaves the machine. Look through the source, mock data, images, copied screenshots, comments, `.env` files, and build output for real names, emails, phone numbers, customer or account data, internal URLs, tokens, and keys. Remove or replace what you find, or stop and tell the user. Do not upload `node_modules`, `.env` files, or the run folder's screenshots.
4. Build and test locally before deployment.
5. Use the selected deployment tool directly when available.
6. Verify the returned URL in a clean browser session (`SKILL.md`, "Browser"), not the one used to build the prototype.
7. Return the working URL, whether it is public or private, and any manual follow-up.

Do not deploy before the user has confirmed the target and the visibility. Do not claim success until the URL loads in the clean session. If the selected tool is unavailable, say so and ask whether to use another target.
