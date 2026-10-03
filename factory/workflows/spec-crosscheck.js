export const meta = {
  name: 'spec-crosscheck',
  description: 'Independent cross-capability check of the baseline OpenSpec specs (the Cross-check phase of spec-pipeline on its own), plus verification that previously reported findings are resolved.',
  whenToUse: 'After specs were fixed outside spec-pipeline (e.g. resolving a previous cross-check). Pass args: { capabilities: [{ name, frIds }], requirementsPath, previous?: { gaps, duplicates, contradictions }, deferred?: string[] }.',
  phases: [{ title: 'Cross-check', detail: 'coverage and consistency over all specs, then re-check earlier findings' }],
}

const COVERAGE_SCHEMA = {
  type: 'object',
  required: ['allCovered', 'gaps', 'duplicates', 'contradictions', 'previousFindings'],
  properties: {
    allCovered: { type: 'boolean' },
    gaps: { type: 'array', items: { type: 'string' } },
    duplicates: { type: 'array', items: { type: 'string' } },
    contradictions: { type: 'array', items: { type: 'string' } },
    previousFindings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'resolved', 'evidence'],
        properties: {
          id: { type: 'string' },
          resolved: { type: 'boolean' },
          evidence: { type: 'string' },
        },
      },
    },
  },
}

const requirementsPath = args?.requirementsPath ?? 'docs/requirements.md'
const capabilities = args?.capabilities ?? []
if (capabilities.length === 0) {
  return { error: 'Pass args.capabilities: [{ name, frIds }]' }
}
const previous = args?.previous ?? { gaps: [], duplicates: [], contradictions: [] }
const listed = [
  ...previous.gaps.map((t, i) => `G${i + 1}: ${t}`),
  ...previous.duplicates.map((t, i) => `D${i + 1}: ${t}`),
  ...previous.contradictions.map((t, i) => `C${i + 1}: ${t}`),
]
const deferred = args?.deferred ?? []

phase('Cross-check')
const coverage = await agent(
  `Cross-check ALL baseline specs under openspec/specs/ against ${requirementsPath}.\nCapability ownership map: ${JSON.stringify(capabilities.map((c) => ({ name: c.name, frIds: c.frIds })))}.\nVerify: (1) every MVP FR appears in exactly one spec - list gaps and duplicates by FR id; (2) no two specs contradict each other (shared entities, statuses, role names); (3) cross-cutting NFRs are not silently owned by one spec. Read the actual spec files.` +
    (deferred.length
      ? `\n\nThese items are deliberately NOT owned by any capability spec; they are assigned owners in the Phase 3 capability plan. Do not report them as gaps unless a spec contradicts them:\n${deferred.map((d) => `- ${d}`).join('\n')}`
      : '') +
    (listed.length
      ? `\n\nA previous cross-check reported the findings below, and the specs were edited since. For EACH id, decide from the current files whether it is resolved, and give file:line evidence in previousFindings. Judge independently: a finding is resolved only if the conflict or gap is actually gone, not merely reworded.\n${listed.join('\n')}`
      : ''),
  { label: 'coverage-check', phase: 'Cross-check', schema: COVERAGE_SCHEMA },
)

const unresolved = (coverage?.previousFindings ?? []).filter((f) => !f.resolved)
log(
  coverage?.allCovered && unresolved.length === 0
    ? 'Cross-check clean: all MVP FRs owned exactly once, no open findings.'
    : `Open - new gaps: ${coverage?.gaps?.length ?? '?'}, duplicates: ${coverage?.duplicates?.length ?? '?'}, contradictions: ${coverage?.contradictions?.length ?? '?'}; previous findings unresolved: ${unresolved.length}`,
)

return { coverage, unresolvedPrevious: unresolved.map((f) => f.id) }
