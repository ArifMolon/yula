# ADR-0007: Container Runtime

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

The container runtime is Podman (rootless, daemonless), behind a `ContainerRuntimePort` so a Docker or alternate adapter is optional. Sandbox defaults are non-root user, read-only rootfs, `--network=none` (a domain-allowlist proxy if a network is genuinely required), and CPU/RAM/PID/duration limits, with the container, volumes, and any temporary secret destroyed at job end. On macOS Podman runs via `podman machine`.

The macOS `podman machine` edge is recorded decisively here, conditioned on **WP-0.5 spike validation**. If the spike reveals an edge that cannot be resolved by sandbox defaults or the `ContainerRuntimePort`, this ADR is revised.

## Consequences

No daemon and no root remove the Docker-socket attack surface entirely. The `ContainerRuntimePort` keeps the runtime swappable without touching Tool Lab domain logic. Writing the decision decisively (instead of deferring) lets WP-0.5 validate it rather than reopen it; only a real edge triggers revision.