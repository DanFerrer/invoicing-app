const app = require('../../app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => `App running on localhost:${PORT}`);