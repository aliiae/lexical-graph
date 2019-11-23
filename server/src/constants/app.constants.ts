import path from 'path';

export const PORT = process.env.PORT || '8080';
export const MONGO_URL = process.env.MONGO_URI || 'mongodb://db:27017/Wordnet';
export const STATIC_FOLDER = path.join(__dirname, '../client');
// Drops the existing database and newly imports wordnet
export const DO_IMPORT_WORDNET = process.env.DO_IMPORT_WORDNET
  ? parseInt(process.env.DO_IMPORT_WORDNET, 10) : 0;
export const WORDNET_PATH = path.join(__dirname, '../../data');
