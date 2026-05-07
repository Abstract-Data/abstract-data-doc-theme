---
title: auditkit.services.authorization
description: "Authorization helpers for edge-bypass transports (ADR-011)."
---


Authorization helpers for edge-bypass transports (ADR-011).


#### authorized\_targets\_path

```python
def authorized_targets_path() -> Path
```

Resolve path to the authorized-targets file (env overrides default).


#### target\_host\_for\_authorization

```python
def target_host_for_authorization(target: str) -> str
```

Normalize ``ctx.target`` (URL or host) to a lowercase hostname for glob checks.


#### host\_matches\_authorized\_line

```python
def host_matches_authorized_line(host: str, pattern: str) -> bool
```

Return True if ``host`` matches ``pattern`` (exact or fnmatch glob).


#### host\_authorized\_in\_file

```python
def host_authorized_in_file(host: str, path: Path) -> bool
```

Return True if ``host`` matches any non-comment line in ``path``.


#### require\_edge\_bypass\_authorization

```python
async def require_edge_bypass_authorization(ctx: ScanContext,
                                            *,
                                            interactive: bool = False) -> bool
```

Return True iff the operator authorized edge-bypass transports for this target.

Order:
    1. ``ctx.config.scope_confirmed`` (``--scope-confirmed`` / env)
    2. Host appears in ``~/.auditkit/authorized-targets.txt`` (or ``AUDITKIT_AUTHORIZED_TARGETS``)
    3. Optional TTY confirmation when ``interactive=True``

