# Azure Integration in Wiki.js

This wiki supports several **Azure** integrations: storage for uploads, application monitoring, and (optionally) sign-in with Microsoft or Azure AD.

---

## 1. Azure Blob Storage (uploads & assets)

Use **Azure Blob Storage** as the backend for uploaded files (images, PDFs, etc.) instead of the database or local disk.

### Where to configure

- **Administration** → **Storage** (or **Manage** → **Storage**).
- Add or edit a storage target and choose **Azure Blob Storage**.

### Settings

| Setting | Description |
|--------|-------------|
| **Account Name** | Your Azure Storage account name (e.g. `mystorageaccount`). |
| **Account Access Key** | Key 1 or Key 2 from the storage account (**Access keys** in Azure Portal). |
| **Container Name** | Blob container name (e.g. `wiki`). Created automatically if it doesn’t exist. |
| **Storage Tier** | **Hot** (frequent access) or **Cool** (lower cost, higher retrieval cost). |

### How to get credentials

1. In **Azure Portal**: your **Storage account** → **Access keys**.
2. Copy **key1** or **key2** and use it as **Account Access Key**.
3. Create a container (or use the default name `wiki` and let the wiki create it).

### What gets stored

- **Page exports** (when using Azure as the active storage).
- **Uploaded assets** (images, documents, etc.) from the wiki.

After enabling Azure Blob Storage, you can run **Export All DB Assets to Azure** to sync existing DB assets to the container.

---

## 2. Azure Application Insights (analytics)

Use **Application Insights** to monitor the wiki (page views, performance, errors).

### Where to configure

- **Administration** → **Analytics** (or the section where analytics providers are configured).
- Enable **Azure Application Insights** and enter your **Instrumentation Key**.

### How to get the key

1. In **Azure Portal**: create or open an **Application Insights** resource.
2. **Overview** → copy **Instrumentation Key**.
3. Paste it into the wiki’s Azure Application Insights configuration.

Data is sent to Azure from the browser (via the Application Insights SDK) for page views and client-side metrics.

---

## 3. Sign-in with Microsoft (Microsoft Account)

The wiki includes a **Microsoft** authentication strategy (personal Microsoft accounts, e.g. Outlook.com).

- In the codebase it is currently **disabled** by default (`isAvailable: false` in the module definition).
- If enabled by an administrator, you configure it with:
  - **Client ID** and **Client Secret** from [Azure Portal – App registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) (or [Microsoft identity platform](https://apps.dev.microsoft.com/) for legacy registration).
  - Redirect/callback URL: `https://your-wiki-host/login/{strategy-id}/callback`.

This is for **consumer** Microsoft accounts, not Azure AD work/school accounts.

---

## 4. Sign-in with Azure AD (Entra ID)

For **work or school accounts** (Azure AD / Microsoft Entra ID), use **Generic OpenID Connect**:

- **Administration** → **Authentication** → add or edit a strategy → choose **Generic OpenID Connect / OAuth2**.
- Configure it with your **Azure AD (Entra ID)** app registration:

| Setting | Azure AD value (typical) |
|--------|---------------------------|
| **Authorization URL** | `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize` |
| **Token URL** | `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token` |
| **User Info URL** | `https://graph.microsoft.com/oidc/userinfo` (or `https://login.microsoftonline.com/{tenant-id}/openid/userinfo`) |
| **Issuer** | `https://login.microsoftonline.com/{tenant-id}/v2.0` |
| **Client ID** | Application (client) ID from your app registration |
| **Client Secret** | Client secret from your app registration |

Replace `{tenant-id}` with your Azure AD tenant ID (or use `common` for multi-tenant).

In **Azure Portal** → **App registrations** → your app:

- **Authentication**: add a **Web** redirect URI: `https://your-wiki-host/login/{strategy-id}/callback`.  
  The wiki builds this from the configured **Site URL** (Administration → Configuration): `{Site URL}/login/{strategy-id}/callback`. Use the exact strategy key/id shown in the wiki’s auth strategy (e.g. a UUID).
- **API permissions**: ensure **OpenID** (e.g. `openid`, `profile`, `email`) are granted.

### Setting login to Azure

To use **only** Azure AD for login:

1. Enable **Generic OpenID Connect** and configure it with the Azure AD values above.
2. Disable or remove other login strategies (e.g. Local) if you want Azure-only.
3. Ensure **Self-registration** is enabled on the OIDC strategy if new users should get accounts on first sign-in (optional).

---

## 5. Mapping Azure AD groups to wiki groups

You can drive **wiki group membership** (and thus permissions) from **Azure AD group membership**:

1. **Azure AD**: Configure your app to include a **groups** claim in the ID token or userinfo.
   - **App registration** → **Token configuration** → **Add groups claim** → choose “Groups assigned to the application” or “Security groups” (and optionally “Emit groups as role claims” if you prefer).
   - Azure will then send group **Object IDs** (GUIDs) in the token (e.g. in the `groups` claim).

2. **Wiki.js**: In the **Generic OpenID Connect** strategy configuration, set:
   - **Groups claim name**: the claim path that contains the list of group IDs (e.g. `groups` for Azure AD).
   - **Group mapping (JSON)**: a JSON object mapping **Azure AD group Object IDs** to **wiki group IDs** (UUIDs or numeric IDs from Administration → Groups).  
     Example: `{"azure-ad-object-id-1":"wiki-group-uuid-1","azure-ad-object-id-2":"2"}`.

3. On each login, the wiki:
   - Reads the groups claim from the token/userinfo.
   - Maps each external ID to a wiki group using your JSON mapping.
   - Sets the user’s wiki groups to exactly those mapped groups (replacing previous membership when mapping is configured).

So you can have e.g. an Azure AD group “Wiki Editors” (object ID `abc-123-...`) mapped to the wiki group “Editors” (id `xyz-...`), and an Azure AD group “Wiki Admins” mapped to the wiki “Administrators” group. Users get wiki permissions based on their Azure AD group membership.

---

## Summary

| Integration | Purpose | Where to configure |
|-------------|---------|--------------------|
| **Azure Blob Storage** | Store uploaded assets and page exports in a blob container | Administration → Storage |
| **Azure Application Insights** | Monitor usage and performance | Administration → Analytics |
| **Microsoft Account** | Sign in with personal Microsoft accounts | Auth module (currently disabled in code) |
| **Azure AD (Entra ID)** | Sign in with work/school accounts | Authentication → Generic OpenID Connect |
| **Azure AD groups → Wiki groups** | Map IdP groups to wiki permissions | OIDC strategy: Groups claim name + Group mapping (JSON) |

For production, use **managed identities** or **Azure Key Vault** for secrets where possible instead of pasting keys into the UI; the wiki currently expects keys/secrets to be entered in the admin panels.
