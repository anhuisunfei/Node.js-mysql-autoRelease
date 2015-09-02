var mysql = require('mysql'),
	Connection = require('mysql/lib/Connection.js');

var pool = mysql.createPool({
	host: '127.0.0.1',
	database: 'myDB',
	port: 3306,
	user: 'root',
	password: 'root',
	debug: false,
	connectionLimit: 3
});



var execPool = function() {
	pool.getConnection(function(err, conn) {
		transAutoRelease(conn);

		conn.beginTransaction(function(err) {
			if (err) throw err;
			conn.query("INSERT INTO test(id,name,date,test) values(1,'123',now(),1)",
				function(err, ret) {
					if (err) {
						console.error(err);
						conn.rollback(function() {});
					} else {
						console.log(ret);
						conn.query('UPDATE test set id=12321312 where id=1', function(err, ret) {
							if (err) {
								console.error(err);
								conn.rollback(function() {

								});
							} else {
								conn.commit(function() {
									console.log('success' + JSON.stringify(ret));
								});
							}
						});

					}
				});
		});
	});
}

function after(fn, cb) {
	console.log(12);
	return function() {
		fn.apply(this, arguments);
		cb();
	}
}

function transAutoRelease(conn) {
	console.log(conn.commit);
	if (conn.commit == Connection.prototype.commit)
		conn.commit = after(conn.commit, release);
	if (conn.rollback == Connection.prototype.rollback)
		conn.rollback = after(conn.rollback, release);

	function release() {
		if (conn) {
			conn.release();
		}
	}
}


var intervalStartProcess = function() {
	setInterval(function() {
		execPool();
	}, 1000);
}
for (var i = 5 - 1; i >= 0; i--) {
	intervalStartProcess(); 
}