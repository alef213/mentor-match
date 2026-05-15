# Airtable Setup Guide

## Step 1 — Create a free Airtable account
Go to airtable.com and sign up for free.

---

## Step 2 — Create a new Base
1. Click **"Add a base"** → **"Start from scratch"**
2. Name it **MentorMatch**

---

## Step 3 — Create the Profiles table

Rename the default "Table 1" to **Profiles**, then set up these columns:

| Field name | Field type       | Notes                          |
|------------|------------------|--------------------------------|
| Name       | Single line text | (already exists by default)    |
| Email      | Email            |                                |
| Type       | Single select    | Add options: `mentor`, `mentee`|
| Industry   | Single line text |                                |
| Role       | Single line text |                                |
| Bio        | Long text        |                                |
| Active     | Checkbox         | Check this to show on the board|

---

## Step 4 — Create the Match Requests table

Click **+** to add a new table, name it **Match Requests**, then add:

| Field name      | Field type       | Notes                                        |
|-----------------|------------------|----------------------------------------------|
| Target ID       | Single line text | Stores the Airtable record ID of the mentor/mentee |
| Requester Name  | Single line text |                                              |
| Requester Email | Email            |                                              |
| Message         | Long text        |                                              |
| Status          | Single select    | Add options: `pending`, `approved`, `declined` |

---

## Step 5 — Get your Base ID

1. Open your MentorMatch base in Airtable
2. Look at the URL — it will look like: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copy the part that starts with **app** — that is your **Base ID**

---

## Step 6 — Get your API key

1. Go to **airtable.com/create/tokens**
2. Click **Create new token**
3. Name it `MentorMatch`
4. Under **Scopes**, add: `data.records:read` and `data.records:write`
5. Under **Access**, select your MentorMatch base
6. Click **Create token** and copy the key

---

## Step 7 — Add your credentials to the app

Open the `.env.local` file in the project folder and fill in:

```
AIRTABLE_API_KEY=your_token_here
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

---

## Day-to-day management

To show or hide someone on the board:
- Open the **Profiles** table in Airtable
- Check or uncheck the **Active** checkbox on their row

That's it — no code changes needed.
