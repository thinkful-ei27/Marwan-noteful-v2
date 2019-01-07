// 1 display all the documents in the collection notes.

db.notes.find();

// 2 display all the documents in the collection notes and format the results to be 'pretty'

db.notes.find().pretty();

// 3 display the fields title and content for all the documents in the collection notes.

db.notes.find({},{title:1,content:1});

// 4 display the fields title and content but exclude the field _id for all the documents in the collection notes.

db.notes.find({},{_id:0,title:1,content:1});

// 5  display only the title field for all the documents in the collection notes and sort the results by _id in descending order.

db.notes.find({},{_id:0,title:1}).sort({_id:-1});

// 6 

db.notes.find( {title:"life lessons learned from cats"} );

// 7

db.notes.find().limit(5);

// 8

db.notes.find().skip(5).limit(5);

// 9

db.notes.count();

// 10

db.notes.find({createdAt: {$gt: ISODate("2018-01-01")}});

// 11

db.notes.find({updatedAt : {$gte:ISODate("2018-01-01"),$lte: new Date()}});

// 12

db.notes.find({createdAt: {$lte: new Date()}});

// 13

db.notes.findOne();

// 14

db.notes.findOne({},{title:1});

// 15

db.notes.findOne({},{_id:0,title:1});

// 16

db.notes.insertOne({title:"I love cats and parrots", content: "blah blah blah blah"});

// 17

db.notes.insert([{title: "note1 inserted",content:"blah1 blah1 blah1"},
{title:"note2 inserted",content:"blah2 blah2 blah3"}
]);

// 18

db.notes.findAndModify({
   query: {_id: 000000000000000000000003}
,update:{title:"sdssss", content:"dsdsdssds"}});

// 19

db.notes.findAndModify({query:{_id:000000000000000000000007},
update:{title:"title has been changed"}});

// 20

db.note.findAndModify({query: {createdAt:{$gt:ISODate("2018-01-01")}},
update:{title: "title is changed too",content:"content is changed too"}});

// 21

db.notes.update(
    {_id:"000000000000000000000008"},
    {$unset:{title:1}}
);

// 22

db.notes.update({createdAt:{$lte: new Date()}},
{$unset: {content: ""}});

// 23

db.notes.update({updatedAt:{$lte: ISODate("2018-01-01")}},
{$unset: {title: 1}});

// 24

db.notes.remove({_id: ObjectId("000000000000000000000017")});

// 25

db.notes.remove({updatedAt: {$lte: ISODate("2018-01-01")}});

// 26

db.notes.deleteMany({createdAt: {$gte: ISODate("2018-01-01")},
title:{$regex : ".*dogs.*"}});

// 27


db.notes.find({title:null});

// 28

db.notes.deleteMany({title: {$regex: ".*cats.*",$not:/read/}});

// 29

db.notes.find({title:{$not:/dogs/}},{title:1});









