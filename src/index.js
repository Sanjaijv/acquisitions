// top of src/index.js — add these two lines BEFORE ALL OTHER imports
import dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH ?? (process.env.NODE_ENV === 'development' ? '.env.development' : '.env') });


// Start server
import "./server.js";
