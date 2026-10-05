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
} satisfies Record<string, KnowledgeFact>;

export const KNOWLEDGE_FACTS_BY_ID = Object.fromEntries(Object.values(KNOWLEDGE_FACTS).map((fact) => [fact.id, fact])) as Record<string, KnowledgeFact>;
export const KNOWLEDGE_KEY_MIGRATIONS = Object.values(KNOWLEDGE_FACTS);
