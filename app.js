//jshint esversion:6

const express = require("express");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to do list mate!"
});

const item2 = new Item({
  name: "Hit + to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

const day = date.getDate();

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved defaultItems to DB");
        }
      });
      res.redirect("/")
    } else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  const list = new List({
    name : customListName,
    items : defaultItems
  });

  list.save();
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  if(itemName.replace(/\s/g, '').length > 0){
    item.save();
  }
 
  res.redirect("/")

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndDelete(checkedItemId, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("Item successfully deleted!")
      setTimeout(function(){res.redirect("/")}, 500);
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
