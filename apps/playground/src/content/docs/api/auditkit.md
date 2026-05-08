---
title: auditkit
description: "AuditKit — Comprehensive website security audit tool."
---


AuditKit — Comprehensive website security audit tool.

## Submodules

- [`auditkit.config`](./auditkit_config.md) — Application configuration via pydantic-settings.
- [`auditkit.bootstrap`](./auditkit_bootstrap.md) — Assemble a module registry with all built-in scan modules registered.
- [`auditkit.batch`](./auditkit_batch.md) — Batch scan helpers for running isolated scans across multiple targets.
- [`auditkit.constants`](./auditkit_constants.md) — Shared limits for evidence strings, body previews, and finding snippets.
- [`auditkit.core`](./auditkit_core.md) — Core module — base classes and orchestration.
- [`auditkit.transport.curl_impersonate`](./auditkit_transport_curl_impersonate.md) — In-process JA3 / TLS impersonation via optional curl_cffi (Phase 17 Tier 2).
- [`auditkit.services.authorization`](./auditkit_services_authorization.md) — Authorization helpers for edge-bypass transports (ADR-011).
