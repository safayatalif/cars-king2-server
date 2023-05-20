const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9tzptnp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
        const toyCarsCollection = client.db("toyCarsDB").collection("toyCars");


        app.get('/getToyCars', async (req, res) => {
            const result = await toyCarsCollection.find().limit(20).toArray();
            res.send(result)
        })
        app.get('/getToyCarsById/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await toyCarsCollection.findOne(filter)
            res.send(result)
        })
        app.get("/getToyCarsByCategory/:category", async (req, res) => {
            const result = await toyCarsCollection.find({ subCategory: req.params.category }).toArray();
            res.send(result);
        });

        app.get("/getToyCarsByEmail/:email", async (req, res) => {
            const query = parseInt(req.query.sort)
            const result = await toyCarsCollection.find({ sellerEmail: req.params.email }).sort({ price: query }).toArray();
            res.send(result);
        });

        app.get("/getToysByText/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toyCarsCollection
                .find({
                    $or: [
                        { toyName: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });

        app.post('/addToyCars', async (req, res) => {
            const toyCars = req.body;
            const result = await toyCarsCollection.insertOne(toyCars);
            res.send(result)
        })


        app.patch('/updateToyCarsById/:id', async (req, res) => {
            const id = req.params.id;
            const toyCars = req.body;
            // console.log(id);
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updateToyCars = {
                $set: {
                    price: toyCars.price,
                    availableQuantity: toyCars.availableQuantity,
                    detailDescription: toyCars.detailDescription
                }
            }
            const result = await toyCarsCollection.updateOne(filter, updateToyCars, option)
            res.send(result)

        })


        app.delete('/deleteToyCarsById/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: new ObjectId(id) }

            const result = await toyCarsCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Cars King Is Running........")
})

app.listen(port, (req, res) => {
    console.log(`Cars King Is Running On Port ${port}`)
})