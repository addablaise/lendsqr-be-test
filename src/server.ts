import app from "./app";
import dotenv from "dotenv";
import db from './db/knex'

dotenv.config();

const PORT = process.env.PORT || 3000;
db.migrate
  .latest()
  .then(() => console.log('Migrations up to date'))
  .catch(err => {
    console.error('Migration error', err)
    process.exit(1)
  })

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
