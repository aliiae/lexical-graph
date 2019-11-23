import mongoose, { Schema } from 'mongoose';

export interface RelationType {
  rel: string;
  tgt: string;
}

export interface SynsetType {
  _id: string;
  pos: string;
  word: string[];
  edges: RelationType[];
  gloss: string;
}

const RelationSchema = new Schema({
  rel: String,
  tgt: String,
});

const SynsetSchema = new Schema({
  _id: String,
  pos: String,
  word: [String],
  edges: [RelationSchema],
  gloss: String,
});

export default mongoose.model('Synset', SynsetSchema);
