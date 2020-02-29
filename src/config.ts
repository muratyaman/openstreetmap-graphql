import dotenv from 'dotenv';

dotenv.config();

const pe = process.env;

export default {
  osm: {
    api: pe.OSM_API,
    interpreter: pe.OSM_INTERPRETER,
  },
}
