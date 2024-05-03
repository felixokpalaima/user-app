const express = require('express');
const connectWithRetry = require('./db-sync');
const User = require('./models/user');

const app = express();
const port = 3000;

app.use(express.json());

let users = [];

// sequelize.sync({ force: false }).then(() => {
//   console.log('Database & tables created!');
// }).catch(error => console.error('Error syncing database:', error));
connectWithRetry();

// // Endpoint to create a user
// app.post('/users', (req, res) => {
//     const { id, name, email } = req.body;
//     if (!id || !name || !email) {
//         return res.status(400).send('Missing user information');
//     }
//     users.push({ id, name, email });
//     res.status(201).json({ message: 'User created',  user: { id, name, email }});
// });


app.post('/users', async (req, res) => {
    try {
      const { name, email } = req.body;
      const newUser = await User.create({ name, email });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  app.get('/users', async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.get('/users/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await User.findByPk(id);

        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/users', async (req, res) => {
    try {
        // This command deletes all entries in the users table
        await User.destroy({
            where: {}, // No condition, all records are targeted
            truncate: true // This option can be set to true for a more efficient deletion (resets table auto-increment)
        });

        res.status(204).send(); // 204 No Content is appropriate for a delete success with no content in response
    } catch (error) {
        res.status(500).send(error.message); // Internal Server Error for any issues during the process
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
