import winston from 'winston';


const logFormat = winston.format.printf((info) => (
  `${new Date().toISOString()}-${info.level}: ${JSON.stringify(info.message, null, 2)}`
));

const options: winston.LoggerOptions = {
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
  ],
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level');
}

export default logger;
