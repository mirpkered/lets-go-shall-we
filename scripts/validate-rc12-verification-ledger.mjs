import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'audit-output/rc12-verification-ledger.json'), 'utf8'));
const statuses = new Set(['UNREVIEWED','VERIFIED_HEALTHY_REPAIRED','VERIFIED_HEALTHY_NO_LONGER_REPRODUCES','VERIFIED_FALSE_POSITIVE','VERIFIED_REASSIGNED_NOT_INDEPENDENT_RC12','OPEN_REPRODUCIBLE','OPEN_AMBIGUOUS']);
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
check(data.schema === 'lgsw.rc12-verification.v1', 'schema mismatch');
check(data.confirmedFindingRecords === 109 && data.findingAdventureAssignments === 144 && data.canonicalAdventureCount === 124, 'canonical totals mismatch');
check(data.adventures.length === 124, 'expected 124 Adventures');
const adventureIds = new Set(); const pairs = new Set(); const findingIds = new Set();
let assignmentCount = 0, singles = 0, multis = 0, maximum = 0, reconciled = 0, open = 0, unreviewed = 0;
const counts = Object.fromEntries([...statuses].map(s => [s, 0]));
for (const a of data.adventures) {
 check(!adventureIds.has(a.adventureId), 'duplicate Adventure ID ' + a.adventureId); adventureIds.add(a.adventureId);
 check(Array.isArray(a.findings) && a.findings.length > 0, 'Adventure has no RC12 findings ' + a.slug);
 if (!a.findings?.length) continue;
 if (a.findings.length === 1) singles++; else multis++;
 maximum = Math.max(maximum, a.findings.length);
 for (const f of a.findings) {
  assignmentCount++; findingIds.add(f.findingId); const pair = a.adventureId + '|' + f.findingId;
  check(!pairs.has(pair), 'duplicate assignment ' + pair); pairs.add(pair);
  check(statuses.has(f.status), 'invalid status ' + pair + ': ' + f.status);
  if (statuses.has(f.status)) counts[f.status]++;
 }
 const expected = a.findings.some(f => f.status === 'UNREVIEWED') ? 'UNREVIEWED' : a.findings.some(f => f.status === 'OPEN_REPRODUCIBLE' || f.status === 'OPEN_AMBIGUOUS') ? 'OPEN' : 'RECONCILED';
 check(a.status === expected, 'derived Adventure status mismatch ' + a.slug + ': expected ' + expected);
 if (expected === 'RECONCILED') reconciled++; else if (expected === 'OPEN') open++; else unreviewed++;
}
check(assignmentCount === 144, 'assignment count ' + assignmentCount + ' != 144');
check(findingIds.size === 109, 'finding record count ' + findingIds.size + ' != 109');
check(singles === 106 && multis === 18 && maximum === 3, 'multiplicity mismatch ' + singles + '/' + multis + '/' + maximum);
check(reconciled + open + unreviewed === 124, 'Adventure counters do not sum to 124');
check(data.nonCanonicalHistoricalWork.every(x => x.canonical === false && x.excludedFromCounters === true), 'noncanonical supplemental work leaked into canonical set');
if (counts.UNREVIEWED === 0) check(reconciled + open === 124, 'completion-mode total mismatch');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(JSON.stringify({findingRecords:findingIds.size,assignments:assignmentCount,adventures:adventureIds.size,singles,multis,maximumFindings:maximum,assignmentStatusCounts:counts,adventureStatusCounts:{RECONCILED:reconciled,OPEN:open,UNREVIEWED:unreviewed}}));
