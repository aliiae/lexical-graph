import { Application } from 'express';
import path from 'path';
import { STATIC_FOLDER } from '../constants/app.constants';

export default class Controller {
  constructor(private app: Application) {
    this.routes();
  }

  public routes(): void {
    this.app.get('/*', (req, res) => {
      res.sendFile(path.join(STATIC_FOLDER, 'index.html'));
    });
  }
}
