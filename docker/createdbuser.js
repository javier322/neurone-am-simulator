
db.createUser({
	user: 'test', pwd: 'test',
	roles: [{ role: "readWrite", db: "test" }]
});


db.getCollection('sequences').insert([
	{ actual_value: 0 }
]);

