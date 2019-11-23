import compression from 'compression';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import favicon from 'serve-favicon';
import { DO_IMPORT_WORDNET, MONGO_URL, STATIC_FOLDER } from './constants/app.constants';
import LemmaController from './controllers/lemma.controller';
import Controller from './controllers/main.controller';
import SynsetController from './controllers/synset.controller';
import logger from './util/logger';
import importWordnet from './util/wordnet.util';

class App {
  public app: Application;

  public mainController: Controller;

  public lemmaController: LemmaController;

  public synsetController: SynsetController;

  constructor() {
    this.app = express();
    this.setConfig();
    this.setMongoConfig();
    this.lemmaController = new LemmaController(this.app);
    this.synsetController = new SynsetController(this.app);
    this.mainController = new Controller(this.app);
  }

  private setConfig(): void {
    this.app.use(compression());
    // this.app.use(favicon(path.join(STATIC_FOLDER, 'favicon.ico')));
    this.app.use(express.static(__dirname));
    // this.app.use(express.static(STATIC_FOLDER));
  }

  private setMongoConfig(): void {
    mongoose.Promise = global.Promise;
    mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => {
      logger.info('Connected to Mongo');
      if (DO_IMPORT_WORDNET) {
        importWordnet();
      }
    }).catch((err: Error) => logger.error(err));
  }
}

export default new App().app;
