export const meta = {
  name: 'contract-review',
  description: 'Independent review of api/openapi.yaml against the baseline OpenSpec specs: one read-only reviewer per capability, each reporting concrete mismatches between what its spec requires at the API boundary and what the contract defines.',
  whenToUse: 'Before archiving a contract change (NFR-12). Pass args: { capabilities: [{ name }], contractPath? }.',
  phases: [{ title: 'Review', detail: 'one reviewer per capability spec, in parallel' }],
}

const REVIEW_SCHEMA = {
  type: 'object',
  required: ['capability', 'consistent', 'mismatches'],
  properties: {
    capability: { type: 'string' },
    consistent: { type: 'boolean' },
    mismatches: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'specRef', 'contractRef', 'issue', 'suggestedFix'],
        properties: {
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          specRef: { type: 'string', description: 'openspec/specs/<cap>/spec.md:<line>' },
          contractRef: { type: 'string', description: 'api/openapi.yaml:<line> or operationId / schema name, or "missing"' },
          issue: { type: 'string' },
          suggestedFix: { type: 'string', description: 'Change to the contract, or to the spec when the spec is wrong' },
        },
      },
    },
  },
}

const contractPath = args?.contractPath ?? 'api/openapi.yaml'
const capabilities = args?.capabilities ?? []
if (capabilities.length === 0) {
  return { error: 'Pass args.capabilities: [{ name }]' }
}

phase('Review')
const reviews = await parallel(
  capabilities.map((cap) => () =>
    agent(
      `Review the API contract ${contractPath} against the product spec openspec/specs/${cap.name}/spec.md.\n` +
        `The contract is the single source of truth for both code repos (NFR-12): server interfaces and the TS client are generated from it, so anything the spec requires at the API boundary must be expressible in it.\n` +
        `Read both files fully. For every requirement and scenario in the spec that touches the API (paths, methods, operationIds, request and response fields, enums, status codes, problem+json shapes, headers, cookies, limits), check the contract defines it the same way. Report each concrete mismatch: a missing operation, field, enum value or status code; a different name, type, nullability or limit; a status code the spec requires that the operation does not declare; a contract shape that makes a spec scenario impossible.\n` +
        `Do not report style preferences, and do not report behavior that a contract cannot express (business rules, timings). Cite file:line on both sides. Severity: blocker = generated code could not implement the spec; major = wrong or missing field/status the implementer would have to guess; minor = naming or documentation drift. Return consistent=true only when you found no blocker or major mismatch.`,
      { label: `review:${cap.name}`, phase: 'Review', schema: REVIEW_SCHEMA },
    ),
  ),
)

const all = reviews.filter(Boolean).flatMap((r) => r.mismatches.map((m) => ({ capability: r.capability, ...m })))
const count = (s) => all.filter((m) => m.severity === s).length
log(`Contract review: ${count('blocker')} blocker, ${count('major')} major, ${count('minor')} minor across ${reviews.filter(Boolean).length} capabilities`)

return {
  consistent: reviews.every((r) => r && r.consistent),
  counts: { blocker: count('blocker'), major: count('major'), minor: count('minor') },
  mismatches: all,
}
