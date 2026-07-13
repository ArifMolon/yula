import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { contextNames } from './domain-catalog.mjs';

export const phase0Specs = Object.freeze([
  { id:'SPEC-P0-domain-discovery', title:'[Spec] Validate YULA domain flows and Context Map', context:'Orchestration', contextLabel:'context:orchestration', risk:'R1', review:'Required', size:'M', phase:'0', outcome:'YULA has an evidence-backed Event Storming record for task execution, tool onboarding, and knowledge ingestion, with hotspots and Context Map corrections visible before implementation.', language:['Command','Domain Event','Policy','Hotspot','Bounded Context','Context Map'], invariants:['Every main flow names actors, commands, events, policies, and hotspots.','Context ownership conflicts are resolved or recorded as explicit decisions.'], published:['Event Storming record','Context Map change proposal'], dependencies:[], exit:['Phase 0 Event Storming record is canonical under my-docs/okf/event-storming.','Hotspots and Context Map conclusions are reviewed by the product owner.'] },
  { id:'SPEC-P0-ubiquitous-language', title:'[Spec] Freeze the Phase 0 Ubiquitous Language', context:'Agent Studio', contextLabel:'context:agent-studio', risk:'R1', review:'Required', size:'S', phase:'0', outcome:'Agents and contributors share one binding Phase 0 glossary that can be enforced in code, tests, schemas, and Project language.', language:['Ubiquitous Language','Glossary','Published Language','AgentDefinition','Skill','ToolVersion','Execution'], invariants:['Each term has one context-owned binding definition.','A new domain term requires a glossary change before merge.','Numeric-only context names are excluded from daily work.'], published:['Glossary v1'], dependencies:['SPEC-P0-domain-discovery'], exit:['Glossary v1 covers Phase 0 terms and all twelve context names.','DDD MUST validator references the canonical glossary.'] },
  { id:'SPEC-P0-seed-decisions', title:'[Spec] Ratify the Phase 0 architecture decisions', context:'Orchestration', contextLabel:'context:orchestration', risk:'R3', review:'Required', size:'M', phase:'0', outcome:'The hard-to-reverse process, IPC, knowledge, security, runtime, model, learning, test, platform, UI, and voice choices are captured as immutable ADRs before product scaffolding.', language:['Architecture Decision Record','Superseded','Port','Published Language'], invariants:['An accepted decision changes only through a superseding ADR.','Each ADR states context, decision, consequences, and verification evidence.'], published:['ADR index','Accepted ADR'], dependencies:['SPEC-P0-domain-discovery','SPEC-P0-ubiquitous-language'], exit:['The seed ADR set is accepted and linked from the canonical plan.','No spike result silently contradicts an accepted decision.'] },
  { id:'SPEC-P0-monorepo-foundation', title:'[Spec] Establish the executable YULA monorepo foundation', context:'Orchestration', contextLabel:'context:orchestration', risk:'R2', review:'Policy', size:'M', phase:'0', outcome:'A minimal Tauri, Elixir Core, Rust worker, and web UI skeleton builds end to end with CI smoke coverage on the approved platforms.', language:['YULA Core','Rust Agent Worker','Tauri Host','Execution'], invariants:['Domain dependencies point inward.','The Tauri host contains no orchestration logic.','Lockfiles are worktree-safe and node_modules is not shared mutably.'], published:['Build contract','Sidecar lifecycle port'], dependencies:['SPEC-P0-seed-decisions'], exit:['The empty end-to-end build is green on macOS arm64.','Windows and Linux CI smoke jobs compile their supported components.'] },
  { id:'SPEC-P0-sidecar-lifecycle-spike', title:'[Spec] Prove the Tauri-to-Core sidecar lifecycle', context:'Orchestration', contextLabel:'context:orchestration', risk:'R2', review:'Policy', size:'S', phase:'0', outcome:'The desktop host can start, observe, and stop the Elixir YULA Core sidecar without embedding domain orchestration in Tauri.', language:['Tauri Host','YULA Core','Heartbeat','Cancellation'], invariants:['Host lifecycle failure is observable.','Core shutdown is bounded and leaves no orphan process.'], published:['Sidecar lifecycle protocol'], dependencies:['SPEC-P0-monorepo-foundation'], exit:['Start, heartbeat, cancellation, crash, and shutdown evidence is captured.','A Core crash does not crash the host UI.'] },
  { id:'SPEC-P0-worker-ipc-spike', title:'[Spec] Prove resilient multi-worker IPC', context:'Orchestration', contextLabel:'context:orchestration', risk:'R2', review:'Policy', size:'M', phase:'0', outcome:'YULA Core controls two Rust Agent Workers over framed Port IPC with token streaming, cancellation, crash isolation, and recoverable Execution state.', language:['Execution','StepExecution','Rust Agent Worker','VersionSnapshot','Checkpoint'], invariants:['Worker failure cannot crash Core or UI.','Execution state is never reported successful after worker loss.','IPC messages use the approved framed Published Language.'], published:['Worker IPC protocol','Execution lifecycle events'], dependencies:['SPEC-P0-monorepo-foundation','SPEC-P0-sidecar-lifecycle-spike'], exit:['Two workers run concurrently and stream tokens.','Cancellation and crash recovery are demonstrated with trace evidence.'] },
  { id:'SPEC-P0-tool-sandbox-spike', title:'[Spec] Prove the quarantined Tool Lab sandbox', context:'Tool Lab', contextLabel:'context:tool-lab', risk:'R3', review:'Required', size:'M', phase:'0', outcome:'A quarantined ToolVersion executes ephemerally through ContainerRuntimePort on Podman machine with default-deny isolation and auditable results.', language:['ToolVersion','ToolLabSession','SandboxSpec','ToolGrade','ContainerRuntimePort'], invariants:['Sandbox runs non-root with read-only rootfs and network disabled by default.','Container, volume, and temporary secrets are destroyed after the session.','A quarantined tool cannot be bound to production Execution.'], published:['ContainerRuntimePort','ToolLabSessionCompleted'], dependencies:['SPEC-P0-seed-decisions','SPEC-P0-monorepo-foundation'], exit:['macOS Podman machine run proves resource, filesystem, network, and teardown constraints.','Failure evidence is recorded without promoting the ToolVersion.'] },
  { id:'SPEC-P0-hybrid-retrieval-spike', title:'[Spec] Prove canonical OKF and hybrid retrieval', context:'Knowledge', contextLabel:'context:knowledge', risk:'R2', review:'Policy', size:'M', phase:'0', outcome:'A sourced OKF Concept can be indexed through the serialized KnowledgeWriter and retrieved through FTS5 plus sqlite-vec while OKF remains recoverable canonical memory.', language:['Concept','KnowledgeChunk','Provenance','KnowledgeWriter','VectorIndexPort'], invariants:['No persistent writer bypasses KnowledgeWriter.','sqlite-vec stores derived vectors and is rebuildable from OKF.','A result always returns provenance.'], published:['KnowledgeWriteRequested','KnowledgeIndexed','Retrieval result contract'], dependencies:['SPEC-P0-seed-decisions','SPEC-P0-monorepo-foundation'], exit:['Hybrid query returns a provenance-linked result.','Deleting and rebuilding the derived index preserves canonical knowledge.','Concurrent reads and serialized writes are measured.'] },
  { id:'SPEC-P0-model-adapter-spike', title:'[Spec] Prove the replaceable Model Gateway adapter', context:'Model Gateway', contextLabel:'context:model-gateway', risk:'R2', review:'Policy', size:'S', phase:'0', outcome:'One provider adapter and one local model execute through the same ModelGatewayPort contract with version, cost, and trace metadata.', language:['ModelGatewayPort','ModelProvider','ModelProfile','ModelPolicy'], invariants:['Domain code imports no provider SDK.','Provider and model version are recorded on Execution.','Contract tests use fakes and make no real provider call.'], published:['Model request and response contract'], dependencies:['SPEC-P0-seed-decisions','SPEC-P0-monorepo-foundation'], exit:['Provider and local-model smoke evidence satisfy the same contract.','Adapter replacement requires no domain change.'] },
]);

export function validatePhase0Catalog(specs) {
  const errors = [];
  const ids = new Set();
  for (const spec of specs) {
    if (ids.has(spec.id)) errors.push(`duplicate Spec identifier: ${spec.id}`); else ids.add(spec.id);
    if (spec.phase !== '0') errors.push(`${spec.id}: Phase must be 0`);
    if (!contextNames.includes(spec.context)) errors.push(`${spec.id}: invalid Bounded Context`);
    if (!['R0', 'R1', 'R2', 'R3', 'R4'].includes(spec.risk)) errors.push(`${spec.id}: invalid RiskLevel`);
    if (!['Policy', 'Required'].includes(spec.review)) errors.push(`${spec.id}: invalid Human Review`);
    if (!['XS', 'S', 'M'].includes(spec.size)) errors.push(`${spec.id}: invalid Size`);
    for (const field of ['outcome', 'language', 'invariants', 'published', 'dependencies', 'exit']) if (spec[field] == null) errors.push(`${spec.id}: missing ${field}`);
  }
  if (errors.length) throw new Error(errors.join('; '));
  return specs;
}

validatePhase0Catalog(phase0Specs);

export function renderSpecBody(spec) {
  const bullets = values => values.length ? values.map(value => `- ${value}`).join('\n') : '- None';
  return `Phase: ${spec.phase}\nSpec: ${spec.id}\nRisk: ${spec.risk}\nSize: ${spec.size}\n\n## Outcome\n\n${spec.outcome}\n\n## Bounded Context\n\n${spec.context}\n\n## Ubiquitous Language\n\n${bullets(spec.language)}\n\n## Invariants\n\n${bullets(spec.invariants)}\n\n## Published Language\n\n${bullets(spec.published)}\n\n## Dependencies\n\n${bullets(spec.dependencies)}\n\n## HITL Policy\n\n${spec.review}\n\n## Exit Criteria\n\n${bullets(spec.exit)}\n\n## Child Issues\n\nNone — child issues are created only after this spec is selected.\n`;
}

function gh(args) { return execFileSync('gh', args, { encoding:'utf8', stdio:['ignore','pipe','inherit'] }).trim(); }
const config = JSON.parse(readFileSync(new URL('../.github/yula-project.json', import.meta.url), 'utf8'));

export function findExistingSpec(issues, specId) {
  return issues.find(issue => !issue.pull_request && new RegExp(`^Spec: ${specId}$`, 'm').test(issue.body ?? ''));
}

function repositoryIssues() {
  return JSON.parse(gh(['api', `repos/${config.repository}/issues?state=all&per_page=100`]));
}

function setField(itemId, field, value, text = false) {
  const args = ['project','item-edit','--id',itemId,'--project-id',config.project.id,'--field-id',config.fields[field]];
  if (text) args.push('--text',value); else args.push('--single-select-option-id',config.options[field][value]);
  gh(args);
}

export function applyPhase0Specs() {
  const published = [];
  for (const spec of phase0Specs) {
    const existing = findExistingSpec(repositoryIssues(), spec.id);
    let issue = existing && { number:existing.number, title:existing.title, url:existing.html_url };
    if (!issue) {
      const url = gh(['issue','create','--repo',config.repository,'--title',spec.title,'--body',renderSpecBody(spec),'--label',`${spec.contextLabel},kind:capability${spec.review === 'Required' ? ',human-required' : ''}`]);
      issue = { url, number:Number(url.split('/').at(-1)), title:spec.title };
    }
    const item = JSON.parse(gh(['project','item-add',String(config.project.number),'--owner',config.owner,'--url',issue.url,'--format','json']));
    setField(item.id,'Status','Todo'); setField(item.id,'Phase','0'); setField(item.id,'Bounded Context',spec.context);
    setField(item.id,'Risk',spec.risk); setField(item.id,'Spec',spec.id,true); setField(item.id,'Human Review',spec.review); setField(item.id,'Size',spec.size);
    published.push({ ...issue, spec:spec.id });
  }
  return published;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--apply')) console.log(JSON.stringify(applyPhase0Specs(), null, 2));
  else for (const spec of phase0Specs) console.log(`${spec.id}\t${spec.context}\t${spec.risk}\t${spec.size}\t${spec.title}`);
}
