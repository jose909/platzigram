var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/', function (ctx, next) {
  title('Platzigram');
  var main = document.getElementById('main-container');

  var pictures = [
    {
      user: {
        username: 'Jose Rosales',
        avatar: 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.0-9/10171745_10152117693756888_1635202168_n.jpg?oh=887935b2d746373ec3df853ecf5e2c1b&oe=5A32016B'
      },
      url: 'office.jpg',
      likes: 10,
      liked: false,
      createdAt: new Date()
    },
    {
      user: {
        username: 'Jose Rosales',
        avatar: 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.0-9/10171745_10152117693756888_1635202168_n.jpg?oh=887935b2d746373ec3df853ecf5e2c1b&oe=5A32016B'
      },
      url: 'office.jpg',
      likes: 2,
      liked: true,
      createdAt: new Date().setDate(new Date().getDate() - 10)
    },
    {
      user: {
        username: 'Jose Rosales',
        avatar: 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.0-9/10171745_10152117693756888_1635202168_n.jpg?oh=887935b2d746373ec3df853ecf5e2c1b&oe=5A32016B'
      },
      url: 'office.jpg',
      likes: 28,
      liked: false,
      createdAt: new Date().setDate(new Date().getDate() - 20)
    },
    {
      user: {
        username: 'Jose Rosales',
        avatar: 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.0-9/10171745_10152117693756888_1635202168_n.jpg?oh=887935b2d746373ec3df853ecf5e2c1b&oe=5A32016B'
      },
      url: 'office.jpg',
      likes: 0,
      liked: false,
      createdAt: new Date().setDate(new Date().getDate() - 20)
    }
  ];

  empty(main).appendChild(template(pictures));
})
