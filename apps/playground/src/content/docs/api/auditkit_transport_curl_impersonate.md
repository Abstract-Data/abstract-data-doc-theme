---
title: auditkit.transport.curl_impersonate
description: "In-process JA3 / TLS impersonation via optional curl_cffi (Phase 17 Tier 2)."
---


In-process JA3 / TLS impersonation via optional ``curl_cffi`` (Phase 17 Tier 2).

This path is distinct from `auditkit.services.curl_impersonate_http_transport`, which
invokes a curl-impersonate **subprocess**. Import ``curl_cffi`` only inside factory / context
entry so the core package stays usable without the ``impersonate`` extra.


## CurlCffiNotInstalledError Objects

```python
class CurlCffiNotInstalledError(RuntimeError)
```

Raised when Tier 2 code paths require ``curl_cffi`` but it is not importable.


#### ensure\_curl\_cffi\_available

```python
def ensure_curl_cffi_available() -> type[Any]
```

Import and return ``curl_cffi.requests.AsyncSession`` or raise `CurlCffiNotInstalledError`.


#### impersonate\_target\_for\_browser\_profile

```python
def impersonate_target_for_browser_profile(profile: BrowserProfile) -> str
```

Map `BrowserProfile` names to ``curl_cffi`` ``impersonate=`` identifiers.


## CurlCffiAsyncClient Objects

```python
class CurlCffiAsyncClient()
```

Thin async wrapper: ``curl_cffi.AsyncSession`` with `httpx.Response` results.

