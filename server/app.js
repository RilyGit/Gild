require('dotenv').config();

const express = require('express'); 
const cors = require('cors');
const dbOperations = require('./db');
const authRouter = require('./routes/auth');
const checkAuth = require('./middleware/checkAuth');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 3100;
const HOST = '0.0.0.0';
const correctType = ['income', 'expense']

app.post("/Addtransaction", checkAuth, async (req, res) => {
    const { sum, category, type } = req.body; 
    const numericSum = Number(sum);
    const userId = req.userId;
    try{
        if(!isNaN(numericSum) && numericSum > 0 && correctType.includes(type) && category && category.trim().length > 0){
             await dbOperations.addtransactions(numericSum, category, type, userId); 
            res.json({ status: "done" }); 
        } else{
            res.status(400).json({ error: "Некоректні дані" });
        }
    }
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Server don`t works" });
    }    

});
app.delete("/Deltransaction", checkAuth, async (req, res) => {
    const { id } = req.body;
    const userId = req.userId;

    if (!id) {
    return res.status(400).json({ error: "Не вказано ID для видалення" });
}
    try{
    await dbOperations.deletetransactions(id, userId);
    res.json({ status: "deleted" });
    } catch(e){
    res.status(500).json({ error: "Server don`t works"})
    console.log(e)
    }
});
app.get("/getTransactions", checkAuth, async (req, res) => {
    try{
    const transactions = await dbOperations.getTransactions(req.userId);
    res.json(transactions);
    } catch(e){
    res.status(500).json({ error: "Server don`t works"})
    console.log(e)
    }
});

app.get("/getBalance", checkAuth, async (req, res) => {
    try{
    const balance = await dbOperations.Balance(req.userId);
    res.json({ balance });
    } catch(e){
    res.status(500).json({ error: "Server don`t works"})
    console.log(e)
    }
});
app.post("/Addcategory", checkAuth, async (req, res) => {
    const { category, type } = req.body
    try{
        if(correctType.includes(type) && category && category.trim().length > 0){
    await dbOperations.Addcategory(category.trim(), type, req.userId);
    res.json({ status: "done" }); 
    } else{
        res.status(400).json({ error: "Некоректні дані" });
    }
} catch(e){
    res.status(500).json({ error: "Server don`t works"})
    console.log(e)
    }
})
app.get("/Getcategory", checkAuth, async (req, res) => {
    try{
     const categories = await dbOperations.Getcategory(req.userId);
    res.json(categories);
    } catch(e){
    res.status(500).json({ error: "Server don`t works"})
    console.log(e)
    }
})

async function startServer() {
    try {
        await dbOperations.connectDB();
        app.listen(PORT, HOST, () => {
            console.log(`Server started at http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exitCode = 1;
    }
}
startServer();