import * as _ from 'lodash';
import { Config } from './config-contract';

var defaults = require('./default.js');
var envConfig = require("./" + (process.env.NODE_ENV || "development") + ".js");


const config: Config = _.merge({}, defaults, envConfig).config;

export default config;