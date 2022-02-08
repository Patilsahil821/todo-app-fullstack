const express = require("express")
const ejs = require("ejs")
const _ = require("lodash")
const getDay = require(__dirname + "/index.js")
const app = express()
const mongoose = require("mongoose")
app.set("view engine", "ejs")

const url = "mongodb+srv://NewUser:Ironman368@cluster0.yoqqt.mongodb.net/todoDB"

mongoose
  .connect(url)
  .then((res) => {
    console.log("connencted succesfully")
  })
  .catch((err) => {
    console.log(err)
  })

const todoSchema = new mongoose.Schema({
  name: String
})

//our data will be stored using below model
const List = new mongoose.model("List", todoSchema)

const customlistSchema = new mongoose.Schema({
  name: "String",
  items: [todoSchema]
})

const CustomList = new mongoose.model("Customlist", customlistSchema)

const item1 = new List({ name: "Welcome to your todo list" })
const item2 = new List({ name: "Hit the + button to add a new item" })
const item3 = new List({ name: "<-- Check this  to delete an item" })

// List.insertMany([item1, item2, item3], (err, result) => {
//   if (err) {
//     console.log(err)
//   } else {
//     console.log("added successfully!")
//   }
// })

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/", (req, res) => {
  console.log("i am inner side ")
  var day = "Today"

  List.find({}, (err, result) => {
    if (result.length == 0) {
      List.insertMany([item1, item2, item3], (err, result) => {
        if (err) {
          console.log(err)
        } else {
          console.log("added successfully!")
        }
        res.redirect("/")
      })
    } else {
      console.log("mein print karunga ab list...")
      res.render("list.ejs", { listtitle: day, newItem: result })
    }
  })
})

app.post("/", (req, res) => {
  const item = req.body.item
  const listname = _.capitalize(req.body.list)
  const newItem = new List({
    name: item
  })
  if (listname == "Today") {
    newItem.save()
    res.redirect("/")
  } else {
    CustomList.findOne({ name: listname }, (err, result) => {
      if (result) {
        result.items.push(newItem)
        result.save()
        res.redirect("/" + listname)
      }
    })
  }
})

app.post("/delete", (req, res) => {
  const id = req.body.checkbox
  const customlist = _.capitalize(req.body.listname)
  if (customlist == "Today") {
    List.findByIdAndRemove(id, (err, result) => {
      if (err) {
        console.log(err)
      } else {
        console.log(result)
      }
    })
    res.redirect("/")
  } else {
    CustomList.findOneAndUpdate(
      { name: customlist },
      { $pull: { items: { _id: id } } },
      (err, response) => {
        if (!err) {
          res.redirect("/" + customlist)
        }
      }
    )
  }
})

app.get("/:customlist", (req, res) => {
  const name = _.capitalize(req.params.customlist)
  /* 
         if list is already present 
         then we will update the list
         else 
         will create a new list.
    */
  CustomList.findOne({ name }, (err, result) => {
    if (err) {
      console.log(err)
    } else if (result) {
      res.render("list.ejs", { listtitle: name, newItem: result.items })
    } else {
      const list = new CustomList({
        name: name,
        items: [item1, item2, item3]
      })
      list.save()
      res.redirect("/" + name)
    }
  })
})

app.listen(process.env.PORT)
