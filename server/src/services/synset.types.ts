// Database output types
export type RelationType =
  'synonym'
  | 'antonym'
  | 'hypernym'
  | 'hyponym'
  | 'meronym'
  | 'holonym'
  | 'entailment'
  | 'attribute'
  | 'cause';
export type SynsetWordGroup = string[];
export type Edge = { source: string; targets: string[] };
export type RelationEdge = {
  type: RelationType;
  synsets: Edge[];
};
export type RelationNode = {
  _id: string;
  words: SynsetWordGroup;
  relations?: RelationNode[];
};
export type InputGraph = {
  lemmaPos: string;
  edges: RelationEdge[];
  nodes: RelationNode[];
};
export type LemmaPosRelations = InputGraph[];
export type QueryRelations = LemmaPosRelations[];

// Formatted graph types
export interface GraphNode {
  id: string;
  group: string;
  label?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };


// Formatted hierarchy types
export type HierarchyNode = {
  label: string;
  type?: string;
  children?: HierarchyNode[];
};
export type TypeToHierarchy = { [type in RelationType | string]: HierarchyNode };
export type LemmaPosToHierarchy = Record<string, TypeToHierarchy>;
export type OutputHierarchy = LemmaPosToHierarchy;

// Formatted output graph types
// export type SynsetToWords = Record<string, SynsetWordGroup>;
export type SynsetToWords = Map<string, SynsetWordGroup>;
export type TypeToEdges = { [type in RelationType | string]: GraphData };
export type LemmaPosToEdges = Record<string, TypeToEdges>;
export type OutputGraph = LemmaPosToEdges;
