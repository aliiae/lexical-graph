import mongoose, { Schema } from 'mongoose';

export interface LemmaType {
  _id: string;
  lemma: string;
  pos: string;
  synsets: string[];
}

export const LemmaSchema = new Schema({
  _id: String,
  lemma: String,
  pos: String,
  synsets: [String],
});

export default mongoose.model('Lemma', LemmaSchema);
