---
title: "Configuring SMTP for outbound email"
description: "Point bioAF at your mail server so it can invite teammates, reset passwords, and send notifications."
thumbnail: /assets/images/screenshot-user-add.png
---

{% include youtube.html id="v_f3DWntbC8" title="Configuring SMTP for outbound email" %}

Like it or not, we live by our email. It's gone so far that our email address is synonymous with our identity! So at least for now, bioAF uses email to invite users, send password reset codes, and send critical notifications. But none of that works until you tell bioAF which mail server to use.

The video above walks through the whole thing. It takes about as long as it takes to paste in six values.

## Where the settings live

SMTP configuration is an admin task. Navigate to **Settings > Integrations > SMTP** and you'll find a single form with six fields:

- **Host** and **Port**: your mail provider's SMTP endpoint. Port `587` is the default.
- **Username** and **Password**: the credentials for that account. The password is stored encrypted, and once it's saved the field shows a masked placeholder instead of the value.
- **From Address**: what recipients see in the "from" line, usually something like `noreply@yourlab.org`.
- **Encryption**: STARTTLS (port 587), SSL/TLS (port 465), or None (port 25). Match this to whatever your provider expects. Most managed providers want STARTTLS on 587.

Fill those in, click **Save SMTP Settings**, and that's the configuration done.

{% include info-bubble.html title="A note on Gmail" content="Gmail's SMTP service does not currently respect the From Address you set here, it sends from the authenticated account instead. That's a known limitation and it's being addressed in an upcoming update." %}

## Send a test before you trust it

Under the form there's a **Send Test Email** box. Put your own address in, click the button, and check your inbox. If it lands, you're done. If it doesn't, bioAF surfaces the failure detail right there so you can see whether it was an auth rejection, a connection timeout, or a bad from-address.

It's worth doing this every time you change a credential. A wrong password here fails silently in normal use: bioAF logs the failure and moves on, so the first sign of trouble is usually a teammate saying they never got their invite.

## What runs on top of it

Once SMTP is live, the rest of the platform just works:

- **User invitations** go out automatically when you add someone under **Settings > Users and Accounts**.
- **Password resets** send a one-time code that expires in 10 minutes.
- **Notifications** for pipeline completion, QC results, and budget thresholds can be turned on per user. SMTP is the delivery channel for the email versions of those.

If you skip SMTP entirely, in-app notifications still work, but invitations and password resets won't. For a team of more than one, it's worth setting up on day one.

## Next steps

SMTP setup is part of the broader post-install checklist. The [Post-Setup guide]({{ '/docs/installation/post-setup/' | relative_url }}) covers it alongside enabling platform components and inviting your team.
