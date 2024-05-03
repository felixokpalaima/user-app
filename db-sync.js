const sequelize = require('./sequelize');  // Assuming this is your Sequelize instance

function connectWithRetry() {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected!');
      sequelize.sync({ force: false })
        .then(() => {
          console.log('Database & tables created!');
        })
        .catch(syncError => {
          console.error('Error syncing database:', syncError);
        });
    })
    .catch(error => {
      console.error('Unable to connect to the database:', error);
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    });
}

module.exports = connectWithRetry;
