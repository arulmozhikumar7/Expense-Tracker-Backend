const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

mongoose.connect(
  "mongodb+srv://arulmozhikumar7:1234qwer@expandables.joiujak.mongodb.net/Expenses",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const conn = mongoose.connection;
conn.once("open", () => {
  console.log(`Successfully Connected`);
});
conn.on("error", () => {
  console.log("Error");
  process.exit();
});

app.use(cors());
app.use(bodyParser.json());

const ExpenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  date: { type: Date, default: Date.now },
});

const Expense = mongoose.model("Expense", ExpenseSchema);

// Get all expenses
app.get("/getExpenses", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.send(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Add new expense
app.post("/addExpense", async (req, res) => {
  try {
    const { description, amount, date } = req.body;
    const parsedDate = date ? new Date(date) : new Date();

    const expense = new Expense({
      description,
      amount,
      date: parsedDate,
    });
    await expense.save();
    res.send(expense);
  } catch (error) {
    console.error("Error adding expense:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Delete an expense by ID
app.delete("/deleteExpense/:id", async (req, res) => {
  const expenseId = req.params.id;

  try {
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);
    if (!deletedExpense) {
      return res.status(404).send("Expense not found");
    }
    res.send(deletedExpense);
  } catch (error) {
    console.error("Error deleting expense:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Update an expense by ID
// Update an expense by ID
app.put("/editExpense/:id", async (req, res) => {
  const expenseId = req.params.id;
  const { description, amount, date } = req.body;

  try {
    const existingExpense = await Expense.findById(expenseId);

    if (!existingExpense) {
      return res.status(404).send("Expense not found");
    }

    // Check if the date is provided in the request body
    const updatedDate = date ? new Date(date) : existingExpense.date;

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        description,
        amount,
        date: updatedDate,
      },
      { new: true }
    );

    res.send(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Team Name: Expandables.`);
});
