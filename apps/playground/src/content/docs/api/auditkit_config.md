---
title: auditkit.config
description: "Application configuration via pydantic-settings."
---


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

