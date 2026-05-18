---
title: "Updating bioAF"
description: "Check your version, see what's new, and install an update without leaving the web UI."
thumbnail: /assets/images/bioaf-update.png
---

{% include youtube.html id="ZFWEU05fqAw" title="Updating bioAF" %}

bioAF updates itself from the web UI. There's no SSH session, no `git pull`, no rebuilding containers by hand. Ok... there is if you want it, but do you really want to do that? Probably not unless you're another developer like me. The video above shows the whole thing: check the version, see what changed, click install, watch it restart.

## Find your current version

Updates live under **Settings > Information**. That page shows your current version right at the top, the running version of bioAF, and it's the number you'd quote in a bug report.

## Check whether an update exists

Next to the version numbers is a **Check for updates** button. bioAF keeps a cached view of the latest release and refreshes it daily on its own, but clicking the button forces a fresh check against the public release feed so you're looking at the real latest version, not yesterday's cache.

If you're up to date, nothing happens. If there's something newer, a banner appears: the new version number, a **View release** link to the full release notes, and, if you have deploy permission, an **Install Update** button.

## Install it

Click **Install Update** and bioAF takes it from there. The page shows you each step as it happens:

1. **Backing up the database** so there's a recovery point.
2. **Fetching the new version.**
3. **Rebuilding containers.**
4. **Preparing to restart**, with a 60-second countdown so anyone mid-task gets a warning.
5. **Restarting services.** The application is briefly unavailable here, this is the only downtime in the process.
6. **Running database migrations.**

The page polls for status the whole time and picks back up once the application is reachable again, so you can leave the tab open and watch it finish. When it's done, the version numbers update in place.

{% include info-bubble.html title="Who can install updates?" content="Checking the version and viewing release notes only needs view access. Actually installing an update requires the infrastructure deploy permission, so the Install Update button only shows for admins and roles that have it." %}

## Look back at what changed

Below the version panel is the **Upgrade History** table: every update this instance has been through, with the from-version, to-version, status, and date. If an update ever fails or gets rolled back, it's recorded here too, so the history is the source of truth for how your instance got to where it is.

## That's the whole loop

Check, review, install, done. The same flow works for every release, so keeping bioAF current is a two-minute task whenever you see the banner.
