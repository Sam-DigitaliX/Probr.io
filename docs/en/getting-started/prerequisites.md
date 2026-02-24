# Prerequisites and Installation

## Prerequisites

Before you begin, make sure you have:

1. **A working Google Tag Manager Server-Side container** receiving traffic
2. **A Probr account** with at least one site configured
3. **Editor access** (or higher) to the server-side GTM container

## Step 1: Create Your Site in Probr

1. Log in to your [Probr dashboard](https://app.probr.io)
2. Click **Add a site**
3. Fill in:
   - **Site name**: your property name (e.g., "mysite.com - Production")
   - **Site URL**: the main URL of your website
4. Click **Create**
5. Copy the **Ingest Key** displayed — you'll need it in the next step

## Step 2: Install the Probr Listener Tag

### Option A: From the GTM Community Template Gallery (recommended)

1. In your **server-side** GTM container, go to **Templates** > **Tag Templates**
2. Click **Search Gallery**
3. Search for **"Probr"**
4. Click **Probr — Server-Side Listener** then **Add to workspace**
5. Confirm the addition

### Option B: Manual import

1. Download the `template.tpl` file from the [GitHub repo](https://github.com/Sam-DigitaliX/probr-gtm-listener)
2. In server-side GTM, go to **Templates** > **Tag Templates** > **New**
3. Click the **three dots** (more options) in the top right > **Import**
4. Select the downloaded `template.tpl` file
5. Click **Save**

## Step 3: Create the Tag

1. Go to **Tags** > **New**
2. **Tag Configuration**: select **Probr — Server-Side Listener**
3. Fill in the fields:

| Field | Value |
|---|---|
| **Probr Ingest Endpoint** | `https://api.probr.io/ingest` (or your self-hosted endpoint) |
| **Probr Ingest Key** | The key copied in Step 1 |
| **Track user data quality** | Checked (recommended) |
| **Send mode** | Per event (recommended) |

4. **Triggering**: select the **All Events** trigger (or create a custom trigger)
5. Name the tag: `Probr - Listener`
6. Click **Save**

## Step 4: Exclude the Probr Tag from Monitoring

To avoid a feedback loop (the Probr tag monitoring itself):

1. Note the **ID** of the Probr Listener tag (visible in the URL when editing the tag, or in the tag list)
2. Edit the Probr Listener tag
3. In the **Tag IDs to Exclude** field, enter the noted ID
4. Save

## Step 5: Add Tag Metadata (recommended)

So that Probr displays tag **names** (not just their IDs):

1. For each important tag in your container, open its settings
2. Expand **Advanced Settings** > **Additional Tag Metadata**
3. Check **Include tag name** (`name` = `true`)
4. Save

This allows Probr to identify each tag by name in the dashboard.

## Step 6: Publish

1. Click **Submit** in GTM
2. Add a version note (e.g., "Add Probr monitoring")
3. Click **Publish**

Data will start appearing in your Probr dashboard within seconds.

## Verification

To verify everything is working:

1. Open **Preview mode** in your sGTM container
2. Send a test event from your site
3. Verify that the **Probr - Listener** tag fires with the status **Succeeded**
4. In your Probr dashboard, verify that the event appears in the real-time feed

## Next Step

See the [detailed GTM Listener documentation](../gtm-listener/configuration.md) for advanced options.
