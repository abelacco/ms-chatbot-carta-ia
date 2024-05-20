export const EnvConfiguration = () => ({
  // enviroment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGODB,
  port: process.env.PORT || 3002,
  mysqlHost: process.env.MYSQL_HOST,
  mysqlPort: process.env.MYSQL_PORT || 3309,
  mysqlUsername: process.env.MYSQL_USERNAME,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  mysqlDatabase: process.env.MYSQL_DATABASE,
});
