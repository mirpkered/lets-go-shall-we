export interface KnowledgeFact {
  id: string;
  text: string;
}

/** Stable identities for reusable, mechanically queried facts. Display wording can evolve independently. */
export const KNOWLEDGE_FACTS = {
  chapelHandbell: { id: 'chapel-burial-handbell-removed', text: 'A cold iron handbell was taken from beneath the chapel.' },
  chapelInscription: { id: 'chapel-bell-inscription-warning', text: 'The soot inscription reads: DO NOT RING IT BELOW.' },
  baggageBrakeHandwheel: { id: 'baggage-car-brake-handwheel-method', text: 'The baggage-car handwheel can vent the vacuum brake line if it is turned, held, then locked.' },
  blackstoneMaintenanceSiding: { id: 'blackstone-bridge-maintenance-siding', text: 'Beyond Milepost 47, a maintenance siding climbs away before the broken Blackstone Bridge.' },
  barnDrainToCreek: { id: 'barn-tunnel-drains-to-creek', text: 'A tunnel under the barn drains toward the creek.' },
  floodedMineAir: { id: 'flooded-mine-airflow-pattern', text: 'The mine air is poorer near the flooded rail bed; a lantern flame leans low there, while the upper ledges still draw air.' },
  mineSideDrift: { id: 'survey-map-side-drift-route', text: 'The old survey map marks a side drift that reaches the lower workings above the flooded rail bed.' },
  markedAces: { id: 'mercer-marked-aces-method', text: 'Mercer marked the backs of three aces with tiny half-moon nicks and reads them by touch.' },
  freightWagonAxle: { id: 'freight-wagon-rut-axle-evidence', text: 'The freight wagon broke at a deep rut; the axle is cracked, not cleanly cut.' },
  riverBendSupper: { id: 'ferryman-river-bends-seasonal-report', text: 'A ferryman said river bends are shallow this season, but can change after rain.' },
  numberedRefugeLampSystem: { id: 'lantern-vault-numbered-refuge-lamps', text: 'The Lantern Vault’s brass-tagged wick belonged to a numbered refuge-lamp system; its marks identified a registered room, not a door.' },
  winterJointMovement: { id: 'winter-joint-movement-signs', text: 'A joint mark that continues to separate shows active movement; one observation cannot establish that a footing has settled safely.' },
  waterBehindCladding: { id: 'water-hidden-behind-cladding', text: 'Water stains that continue behind a newer surface can indicate hidden decay; inspect from a safe edge before opening the wall.' },
  bellTowerBraceSigns: { id: 'bell-tower-brace-warning-signs', text: 'A new rub mark and a changing lean deserve attention together; a plumb line compares position but does not certify the tower.' },
  waterPathBeforeWall: { id: 'trace-water-path-before-sealing-wall', text: 'A wet foundation joint may show where water emerges, not where it entered; trace the route before sealing the visible point.' },
  scaffoldFootAndLashing: { id: 'scaffold-footing-and-lashing-check', text: 'Check scaffold footing and lashings as separate failure points; a secured base cannot compensate for a split rail.' },
  fireDamageHiddenTie: { id: 'fire-damage-hidden-structural-tie', text: 'A fire can weaken a concealed tie beyond the visible soot line; keep the area closed until the connection is inspected.' },
  rampLoadAtFeet: { id: 'ramp-load-bearing-at-support-feet', text: 'A ramp’s boards can be strong while its supports fail; inspect where the weight reaches the ground.' },
  tieRodAndBracketTogether: { id: 'tie-rod-and-bracket-load-path', text: 'A moving tie rod and a pulled bracket are related clues; tightening one fastener cannot verify the whole support path.' },
  telegraphRepeatConvention: { id: 'telegraph-repeat-convention', text: 'A repeat mark requests confirmation of the received words; it does not prove that the full message arrived correctly.' },
  reheatedSealSigns: { id: 'reheated-seal-signs', text: 'A doubled wax ridge can suggest a seal was reheated, but it cannot identify who handled the letter or what changed inside.' },
  senderReceiverCopyDifference: { id: 'sender-receiver-copy-difference', text: 'When sender and receiver copies differ, preserve both and ask for a read-back before acting on the disputed instruction.' },
  relayDelayMarks: { id: 'relay-delay-marks', text: 'A relay acknowledgment mark records receipt at the next office; a sending time alone does not establish delivery.' },
  telegraphPayerNotAuthority: { id: 'telegraph-payer-not-authority', text: 'A telegraph receipt identifies who paid for a message, not whether that person had authority over the property named in it.' },
  undeliverableForwardingMarks: { id: 'undeliverable-forwarding-marks', text: 'Forwarding marks can trace an address change, but a familiar town name is not enough to identify a present recipient.' },
  telegraphOfficeBellConvention: { id: 'telegraph-office-bell-convention', text: 'Office bells distinguish line status from waiting traffic only when sender and receiver share the posted convention.' },
  courierHorseChangeNotation: { id: 'courier-horse-change-notation', text: 'A current horse-change ledger can supersede an older route map when it records a staffed relay moved after an animal change.' },
  lateMessageMayRetainOtherValue: { id: 'late-message-may-retain-other-value', text: 'A late message may still contain information or terms worth the recipient seeing; lateness alone does not settle its value.' },
  senderCopyDoesNotProveReceipt: { id: 'sender-copy-does-not-prove-receipt', text: 'A sender’s copy proves what was prepared or sent, not that a receiving office acknowledged the words.' },
  courierRouteEndMark: { id: 'courier-route-end-mark', text: 'The last entry in an old route log marks where the record ends, not where the courier or message necessarily ended.' },
  signsOfRecopiedMessage: { id: 'signs-of-recopied-message', text: 'Changed paper fibers and a replaced address can show that a message was recopied, but not who changed it or why.' },
} satisfies Record<string, KnowledgeFact>;

export const KNOWLEDGE_FACTS_BY_ID = Object.fromEntries(Object.values(KNOWLEDGE_FACTS).map((fact) => [fact.id, fact])) as Record<string, KnowledgeFact>;
export const KNOWLEDGE_KEY_MIGRATIONS = Object.values(KNOWLEDGE_FACTS);
