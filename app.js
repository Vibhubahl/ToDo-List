const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vaibhav:bahlvibhu1015@cluster0.jzpe9.mongodb.net/ToDoList", { useUnifiedTopology: true ,useNewUrlParser: true });

const itemsSchema = new mongoose.Schema(
	{
		name:{
			type:String,
			required:[true]
		}
	}
)

const Item = mongoose.model("item",itemsSchema);

const item = new Item({
	name:"Hit the Gym"
});

const item1 = new Item({
	name:"Buy grocery"
});

const item2 = new Item({
	name:"Do Web devp"
});

const defaultItems = [item,item1,item2];

const listSchema = new mongoose.Schema(
	{
		name:{
			type:String,
			required:[true]
		},
		items:[itemsSchema]
	}
)

const List = new mongoose.model("List",listSchema);

app.get("/", function(req,res)
{
	Item.find({},function(err,foundItems){
		if(foundItems.length===0)
		{
			Item.insertMany(defaultItems , function(err)
			{
				if(err)
				{
					console.log(err);
				}
				else
				{
					console.log("Added");
				}
			})
			res.redirect("/");
		}
		else
		{
			res.render("list", {Day:"Today" , arr:foundItems});
		}
	});
});

app.get("/:custName" ,function(req,res)
{
	const custName = _.capitalize(req.params.custName);
	List.findOne({name:custName},function(err , found){
		if(!err)
		{
			if(!found)
			{
				const list = new List({
				name:custName,
				items:defaultItems
				});
				list.save();
				res.redirect("/"+custName);
			}
			else
			{
				res.render("list" , {Day:found.name , arr:found.items});
			}
		}
	})
})

app.post("/" , function(req,res)
{
	const itemName = req.body.todo;
	const listName = req.body.submit;
	const item = new Item({
			name:itemName
	})
	if(listName==="Today")
	{
		item.save();
		res.redirect("/");
	}
	else
	{
		List.findOne({name:listName},function(err,found){
			found.items.push(item);
			found.save();
			res.redirect("/"+listName);
		})
	}
});

app.post("/del" , function(req,res)
{
	const checked = (req.body.check);
	const listName = req.body.listName;
	if(listName==="Today")
	{
		Item.deleteOne({_id:checked},function(err)
		{
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log("Deleted");
		}
		})
		res.redirect("/");
	}
	else
	{
		List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked}}} ,function(err , found){
		if(!err)
		{
			res.redirect("/"+listName);
		}
		});
	}
});

/*app.get("/upd/:id" , function(req,res)
{
	console.log(req.params.id);
  	items.splice(req.params.id,1);
    res.redirect("/");
});*/

let port = process.env.PORT;
if(port==null || port=="")
{
	port=3000;
}

app.listen(port ,function(req,res)
{
	console.log("Started");
})