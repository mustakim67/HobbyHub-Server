const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xqfap2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const app=express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

     const UserCollection = client.db('UsersDB').collection('Users');
     const GroupsCollection = client.db('UsersDB').collection('Groups');

      app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await UserCollection.insertOne(newUser);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const result = await UserCollection.find().toArray();
            res.send(result);
        });
        //for ascending and descending order and search
        // GET /sorted-groups?search=photography&sort=asc
app.get('/sorted-groups', async (req, res) => {
  try {
    const { search = '', sort = 'desc' } = req.query;

    const filter = search
      ? { groupName: { $regex: search, $options: 'i' } }
      : {};

    const sortDirection = sort === 'asc' ? 1 : -1;

    const result = await GroupsCollection.find(filter)
      .sort({ groupName: sortDirection })
      .toArray();

    res.send(result);
  } catch (err) {
    console.error('Error fetching sorted groups:', err);
    res.status(500).send({ error: 'Failed to fetch groups' });
  }
});

//Create group -----------------------------------------------------
        app.post('/groups',async (req,res)=>{
          const newGroups = req.body;
          const result =await GroupsCollection.insertOne(newGroups);
          res.send(result);
        })
        app.get('/groups', async (req, res) => {
            const result = await GroupsCollection.find().toArray();
            res.send(result);
        });
//Delte group--------------------------------------------------------
app.delete('/groups/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await GroupsCollection.deleteOne(query);
            res.send(result);
        })
//Update Group--------------------------------------------------------------
 app.put('/groups/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedInfo = req.body;
            const updatedDoc = {
                $set: updatedInfo
            }
            const result = await GroupsCollection.updateOne(filter, updatedDoc, options);

            res.send(result);
        })
//Find ongoing Groups from db-------------------------------------------------------
app.get('/groups/featured', async (req, res) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const result = await GroupsCollection.find({
    endDate: { $gte: todayStr }
  }).toArray();

  res.send(result);
});
//Find active groups from db
app.get('/groups/active', async (req, res) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const result = await GroupsCollection.find({
    endDate: { $gte: todayStr }
  }).toArray();
  res.send(result);
});

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}



run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hobby server is running')
});

app.listen(port, () => {
    console.log(`Hobbyt server is running on port ${port}`)
})