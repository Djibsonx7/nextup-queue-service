require('dotenv').config();
const express = require('express');
const app = express();
const queueRoutes = require('./routes/queueRoutes');

app.use(express.json());
app.use('/api/queue', queueRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
