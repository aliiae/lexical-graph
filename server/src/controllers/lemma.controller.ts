import { Application } from 'express';
import LemmaService from '../services/lemma.service';

export default class LemmaController {
  private lemmaService: LemmaService;

  constructor(private app: Application) {
    this.lemmaService = new LemmaService();
    this.routes();
  }

  public routes(): void {
    this.app.route('/api/wordnet/lemma/:word')
      .get(this.lemmaService.getGlosses.bind(this.lemmaService));
    this.app.route('/api/wordnet/lemma')
      .get(this.lemmaService.getAllLemmata.bind(this.lemmaService));
  }
}
