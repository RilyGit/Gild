const { MongoClient, ObjectId } = require("mongodb");
const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(url);

async function connectDB() {
    try {
        await mongoClient.connect();
        console.log("База успішно підключена)");
    } catch (e) {
        console.error("БД:", e);
        throw e;
    }
}
function getCollection() {
    const db = mongoClient.db("finance_db");
    return db.collection("transactions");
}

function getUsersCollection() {
    const db = mongoClient.db("finance_db");
    return db.collection("users");
}
async function addUser(userData) {
    try {
        const db = mongoClient.db("finance_db");
        const collection = db.collection("users");
        const { insertedId } = await collection.insertOne(userData);
        const categoriesCollection = db.collection("categories");
        const defaultCategories = [
            { category: "Зарплата", type: "income", userId: insertedId.toString() },
            { category: "Подарунок", type: "income", userId: insertedId.toString() },
            { category: "Кешбєк", type: "income", userId: insertedId.toString() },
            { category: "Продукти", type: "expense", userId: insertedId.toString() },
            { category: "Транспорт", type: "expense", userId: insertedId.toString() }
        ];
        await categoriesCollection.insertMany(defaultCategories);
    } catch (err) {
        console.error("Помилка збереження користувача:", err);
    }
}
async function findUserByEmail(email) {
    try {
        const db = mongoClient.db("finance_db");
        const collection = db.collection("users");
        return await collection.findOne({ email });
    } catch (err) {
        console.error("Помилка пошуку користувача:", err);
        return ;
    }
}

async function addtransactions(sum, category, type, userId) {
    try {
        const collection = getCollection();
        await collection.insertOne({ sum, category, type, userId });
    } catch (err) {
        console.error("Помилка додавання:", err);
    }
}
async function deletetransactions(id, userId) {
    try {
        const collection = getCollection();
        await collection.deleteOne({ _id: new ObjectId(id), userId });
    } catch (err) {
        console.error("Помилка видалення:", err);
    }
}
async function getTransactions(userId) {
    try {
        const collection = getCollection();
        return await collection.find({ userId }).toArray();
    } catch (err) {
        console.error("Помилка отримання:", err);
        return [];
    }
}

async function Addcategory(category, type, userId) {
    try {
    const db = mongoClient.db("finance_db");
    const collection = db.collection("categories")
    await collection.insertOne({category, type, userId})
    } catch (err) {
        console.error("Помилка додавання:", err);
    }
}
async function Getcategory(userId){
    try{
    const db = mongoClient.db("finance_db");
    const collection = db.collection("categories")
    return await collection.find({ userId }).toArray();
    } catch (err){
        console.error("Помилка:", err);
    }
}

async function Balance(userId) {
try {
const collection = getCollection();
const transactions = await collection.find({ userId }).toArray();
 let total = 0; 
    transactions.forEach((item) => {
    const sum = Number(item.sum); 
        if (item.type === 'income') {
    total += sum; }
        else if (item.type === 'expense') {
    total -= sum; }
});
    return total;  } 
catch (err) {
        console.error("Помилка підрахунку балансу:", err);
        return 0;
    }
}
module.exports = { connectDB, addtransactions, deletetransactions, getTransactions, Balance , Addcategory , Getcategory, getUsersCollection, addUser, findUserByEmail};