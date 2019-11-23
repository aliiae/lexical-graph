import { Application } from 'express';
import SynsetService from '../services/synset.service';

export default class SynsetController {
  private synsetService: SynsetService;

  constructor(private app: Application) {
    this.synsetService = new SynsetService();
    this.routes();
  }

  public routes(): void {
    this.app.route('/api/wordnet/synset/:word/:max')
      .get(this.synsetService.getSomeRelations.bind(this.synsetService));
    this.app.route('/api/wordnet/synset/:word')
      .get(this.synsetService.getAllRelations.bind(this.synsetService));
    this.app.route('/api/wordnet/synset')
      .get(this.synsetService.getAllSynsets.bind(this.synsetService));
  }
}
