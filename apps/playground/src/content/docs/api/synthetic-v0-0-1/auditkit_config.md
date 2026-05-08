---
title: auditkit.config
description: "Application configuration via pydantic-settings."
version: "synthetic-v0.0.1"
versionLabel: "0.0.1 (legacy)"
---

:::caution[Older version]
You're viewing **0.0.1 (legacy)**. Latest is [0.1 (latest) →](/api/0-1-0/auditkit_config/).
:::


Application configuration via pydantic-settings.


## HttpTransportBackend Objects

```python
class HttpTransportBackend(StrEnum)
```

Ordered HTTP transport implementations (TLS / wire realism).


## WpDumpTransport Objects

```python
class WpDumpTransport(StrEnum)
```

HTTP stack selection for ``wp-dump`` (Phase 17 Tier 2 vs default httpx).


## AuditConfig Objects

```python
class AuditConfig(BaseSettings)
```

AuditKit runtime configuration, loaded from environment variables.


#### http\_transport\_backend\_order\_tuple

```python
@property
def http_transport_backend_order_tuple() -> tuple[HttpTransportBackend, ...]
```

Parsed ``http_transport_backend_order`` as ``HttpTransportBackend`` values (validated at init).


#### assume\_cms\_tuple

```python
@property
def assume_cms_tuple() -> tuple[str, ...]
```

Parsed ``assume_cms`` entries (validated, lowercase, stable order).

