import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config-contract';

export class ConfigService {

    private static _config: Config;
    
    static get config(): Config {

        if (this._config == null) {
            var configPath = path.join(__dirname, '../../', 'config.json');
            this._config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        return this._config;
    }
}