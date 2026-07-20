import dotenv from 'dotenv';
dotenv.config();
console.log('Connection Host:', process.env.DB_HOST + ':' + process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);