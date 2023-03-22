// nodejs module
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

// database
var mysql      = require('mysql');
var config     = require('./lib/mysqlConfig');

var db = mysql.createConnection({
  host     : config.host,
  user     : config.user,
  password : config.password,
  database : config.database
});
db.connect(); // 실제 접속

// custom module(모듈화)
var template = require('./lib/template.js');

// main
var app = http.createServer(function(request,response){
    var _url = request.url;
    // 쿼리 값
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log(pathname);
    // 홈페이지
    if(pathname === '/'){
      if(queryData.id === undefined){
       // 홈페이지
       db.query(`SELECT * FROM user`, function(error, user){
        var title = `회원가입`;
        var description = 'Test environment required to analyze attacks and countermeasures by type of SQL injection';
        var list = template.list(user);
        var html = template.html(title, list,
          `
          <h3>${description}</h3>
          <a href="/create">create</a>
          `
          );
        response.writeHead(200);
        response.end(html);
       });
      } else {
          db.query(`SELECT * FROM user`, function(error, users){
            if(error){
              throw error;
            }
            db.query(`SELECT * FROM user WHERE id = ?`,[queryData.id], function(error2, user){
              if(error2){
                throw error2;
              }
              var name = user[0].name;
              var pw = user[0].pw;
              /*
              var description = test[0].intro;
              var youtube = test[0].youtube;
              var tel = test[0].tel;
              var email = test[0].email;
              var address = test[0].address;
              */
              var list = template.list(users);
              var html = template.html(name, list,
                `
                <h2>${name}</h2>
                <h3>${pw}</h3>
                `,
                `<a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>
                `);
              response.writeHead(200);
              response.end(html);
              console.log(queryData);
              });
            });
          }
    } else if(pathname === '/create'){
      db.query(`SELECT * FROM user`, function(error, users){
        var title = `SQL injection`;
        var list = template.list(users);
        var html = template.html(title, list,
          `
          <form action="/create_process" method="post">
            <p><input type="text" name="name" placeholder="NAME"></p>
            <p><input type="text" name="pw" placeholder="PASSWORD"></p>
            <p><input type="submit"></p>
          </form>
          `,
          `<a href="/create">create</a>`
          );
        response.writeHead(200);
        response.end(html);
       });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
          db.query(`
            INSERT INTO user (name, pw)
            VALUES (?, ?)
            `,
            [post.name, post.pw],
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
            }
          )
        }
      );
    } else if(pathname === '/update'){
      db.query(`SELECT * FROM user`, function(error, users){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM user WHERE id = ?`,[queryData.id], function(error2, user){
        if(error2){
          throw error2;
        }
          var list = template.list(users);
          var html = template.html(user[0].name, list,
            `<form action="/update_process" method="post">
              <input type="hidden" name="id" value="${user[0].id}">
              <p><input type="text" name="name" placeholder="NAME" value="${user[0].name}"></p>
              <p><input type="text" name="pw" placeholder="PASSWORD" value="${user[0].pw}"></p>
              <p><input type="submit"></p>
            </form>`,
            // 글 생성, 수정 부분
            `<a href="/create">create</a>
            <a href="/update?id=${user[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
      // 
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        db.query('UPDATE user SET name=?, pw=? WHERE id=?', [post.name, post.pw, post.id], function(error, result){
          response.writeHead(302, {Location: `/?id=${post.id}`});
          response.end();
        })
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base;
        db.query('DELETE FROM user WHERE id = ?', [post.id], function(error, result){
          if(error){
            throw error;
          }
          response.writeHead(302, {Location: `/`});
          response.end();
        });
        });
    } else {
    response.writeHead(404);
    response.end('Not found');
  }
});

app.listen(3000);