---
title: auditkit.batch
description: "Batch scan helpers for running isolated scans across multiple targets."
---


Batch scan helpers for running isolated scans across multiple targets.


## BatchTargetResult Objects

```python
class BatchTargetResult(TypedDict)
```

Serializable per-target batch scan result.


#### parse\_target\_file

```python
def parse_target_file(path: Path) -> list[str]
```

Load batch targets, ignoring blank lines and full-line comments.


#### write\_batch\_summary

```python
def write_batch_summary(results: list[BatchTargetResult],
                        output_dir: Path) -> Path
```

Write a JSON batch summary and return its path.


#### run\_batch

```python
async def run_batch(targets: Iterable[str],
                    config: AuditConfig,
                    *,
                    phases: list[Phase] | None = None,
                    output_dir: Path | None = None,
                    allow_private: bool = False) -> list[BatchTargetResult]
```

Run isolated scans for each target and always persist a summary.


#### run\_batch\_watch

```python
async def run_batch_watch(targets: Iterable[str],
                          config: AuditConfig,
                          *,
                          phases: list[Phase] | None = None,
                          allow_private: bool = False,
                          interval_minutes: int = 5) -> None
```

Repeatedly scan targets, write JSON under ``./auditkit-scans/``, and diff vs prior run.

