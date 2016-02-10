!function(r, $, _) {
  'use strict';

  var $chat = $('#robinChatList');
  var $scroll = $('#robinScrollContainer');

  function addChatMessage(message) {
    var scrollOffset = ($scroll.prop('scrollHeight') - $scroll.scrollTop());
    var wasScrolledDown = (scrollOffset === $scroll.height());

    console.log('scroll state = ' + wasScrolledDown);

    var date = new Date();
    var time = date.toLocaleTimeString ? date.toLocaleTimeString() : date.toTimeString();

    message.isoDate = date.toISOString();
    message.timestamp = time;

    var el = r.templates.make('robin/robinmessage', message);
    $chat.append(el);

    if (wasScrolledDown) {
      robinScrollContainer.scrollTop = robinScrollContainer.scrollHeight;
    }
  }

  function addSystemMessage(body) {
    return addChatMessage({
      from: 'robinbot',
      userClass: 'system',
      body: body,
    });
  }

  var websocket = new r.WebSocket(r.config.robin_websocket_url);
  websocket.on({
    'connecting': function() {
      addSystemMessage('connecting');
    },

    'connected': function() {
      addSystemMessage('connected!');
    },

    'disconnected': function() {
      addSystemMessage('disconnected :(');
    },

    'reconnecting': function(delay) {
      addSystemMessage('reconnecting in ' + delay + ' seconds...');
    },

    'message:chat': function(message) {
      if (message.from === r.config.logged) {
        message.userClass = 'self';
      } else {
        message.userClass = 'user';
      }
      addChatMessage(message);
    },

    'message:join': function(message) {
      addSystemMessage(message.user + ' has joined the room');
    },

    'message:part': function(message) {
      addSystemMessage(message.user + ' has left the room');
    },
  });
  websocket.start();

  $('#send-message').submit(function (ev) {
    ev.preventDefault();

    var $form = $(this);
    post_pseudo_form('#send-message', 'robin/' + r.config.robin_room_id + '/message');

    $form.find('[type=text]').val('');
  });
}(r, jQuery, _);
