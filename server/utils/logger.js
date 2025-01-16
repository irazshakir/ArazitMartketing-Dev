import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs to `whatsapp-api.log`
    new winston.transports.File({ 
      filename: 'logs/whatsapp-api.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

export default logger; 