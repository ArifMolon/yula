export const boundedContexts = Object.freeze([
  { name: 'Orchestration', slug: 'orchestration' },
  { name: 'Agent Studio', slug: 'agent-studio' },
  { name: 'Tool Lab', slug: 'tool-lab' },
  { name: 'Knowledge', slug: 'knowledge' },
  { name: 'Workspace', slug: 'workspace' },
  { name: 'Model Gateway', slug: 'model-gateway' },
  { name: 'Interaction', slug: 'interaction' },
  { name: 'Approval & Security', slug: 'approval-security' },
  { name: 'Integration', slug: 'integration' },
  { name: 'Observability & Cost', slug: 'observability-cost' },
  { name: 'Remote Access', slug: 'remote-access' },
  { name: 'Identity & Secrets', slug: 'identity-secrets' },
]);

export const contextNames = Object.freeze(boundedContexts.map(context => context.name));
export const contextSlugs = Object.freeze(boundedContexts.map(context => context.slug));
export const contextSlugByName = new Map(boundedContexts.map(context => [context.name, context.slug]));
