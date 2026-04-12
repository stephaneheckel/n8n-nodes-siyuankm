# v2.0.6 Retest List — Credential Test Fix (Final)

> **Prerequisites:**
> 1. Publish v2.0.6: `npm login` then `npm publish`
> 2. Verify: `npm view n8n-nodes-siyuan version` → should show `2.0.6`
> 3. In n8n: Settings → Community Nodes → Update `n8n-nodes-siyuan` to 2.0.6
> 4. Run each test below

---

## Fix: Credential Test — Removed responseSuccessBody Rule

**What was wrong in v2.0.5:** The `responseSuccessBody` rule checked if the JSON body's `code` field equaled `0`. But n8n's rule implementation does a string comparison, and SiYuan returns `code` as an integer `0` — so `"0" !== 0` and the rule always failed, even with a valid token. This caused "Authentication failed" on every test.

**What was fixed in v2.0.6:** Removed the `responseSuccessBody` rule entirely. SSH investigation confirmed that SiYuan returns **HTTP 401** for invalid tokens and **HTTP 200** for valid tokens on `/api/notebook/lsNotebooks`. n8n's default HTTP status check (200 = pass, 401 = fail) is all we need. The trailing slash fix from v2.0.5 is still in place.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Valid token, no trailing slash | Set URL to `http://siyuan.lan`. Set correct token. Click **Test** once. Should show green "Connection tested successfully". | PASS | |
| 2 | Valid token, with trailing slash | Set URL to `http://siyuan.lan/`. Same correct token. Click **Test** once. Should also show green success. | PASS | |
| 3 | Invalid token, no trailing slash | Set URL to `http://siyuan.lan`. Set token to `wrongtoken12345`. Click **Test** once. Should show red error. | PASS | |
| 4 | Invalid token, with trailing slash | Set URL to `http://siyuan.lan/`. Token still `wrongtoken12345`. Click **Test** once. Should also show red error. | PASS | |
| 5 | Restore and save | Put back correct URL and token. Test. Save. | PASS | |

> **Important:** Click Test only ONCE per test. Wait up to 30 seconds for the response.

---

## Verify previous fixes still work

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Put + Get File | Asset → Put File `/data/v6-test.txt` content `hello`. Asset → Get File → returns `hello`. Asset → Remove File. | PASS | |
| 2 | Set Notebook Conf | Notebook → Create. Set Configuration `{"icon":"1f4d3"}`. Get Configuration → icon is `1f4d3`. Remove notebook. | PASS | |
| 3 | Trigger baseline | Activate a SiYuan Trigger workflow. No immediate fire. Make a change in SiYuan. Trigger fires. Deactivate. | PASS | |

---

## Summary

| Version | Credential test approach | Result |
|---------|------------------------|--------|
| v2.0.2 | `ICredentialTestRequest` hitting `/api/system/version` (no auth required) | Wrong token shows green (FAIL) |
| v2.0.3 | Switched to `/api/notebook/lsNotebooks` (requires auth) | n8n hung on test (double-slash URL issue) |
| v2.0.4 | Added `responseSuccessBody` rule checking `code === 0` | Rule always failed — n8n string-compares int (FAIL) |
| v2.0.5 | Same rule + trailing slash fix | Valid tokens rejected by rule (FAIL) |
| **v2.0.6** | **Removed rule. Rely on HTTP 401 (invalid) vs 200 (valid). Trailing slash fix kept.** | **Should work** |
