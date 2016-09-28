$(document).ready(function(){ 

	var socket = io.connect("localhost:3000");
	$('#myModal').modal('show');
	$('form').submit(function (evt) {
            evt.preventDefault();
    });
    $('#name').focus();

    $(document).on('click', '#join', function() { 
    	console.log("join button clicked");
    	socket.emit('join', $('#name').val());
    	$('#myModal').modal('hide');
    })

    socket.on('welcome' , function(msg) {

            $("#welcome").text(msg);
        })

    socket.on('available_people', function(people){
    	console.log(people);
    	$('#availableList').empty();
        $.each(people, function(clientid, name){
            if(clientid != ('/#'+socket.id)){
                $('#availableList').append('<li class="list-group-item list-group-item-info" id='+clientid+'><i class="fa fa-user" aria-hidden="true"></i>&nbsp;'+name+'</li>')
            }
        })
    });

	$('#availableList').on('click', 'li', function(){
		var temp = $(this).text();
		console.log(temp);
		$('#requestList').append('<li class="list-group-item list-group-item-info ' + temp.trim()+ '"' + ' id='+this.id+'><i class="fa fa-user" aria-hidden="true"></i>'+temp+'</li>')
	    socket.emit('send_request', this.id);
	})

	socket.on('client1_request', function(name, id){
        $('#requestrecList').append('<li class="list-group-item list-group-item-info" id='+id+'><i class="fa fa-user" aria-hidden="true"></i>'+name+'</li>');
    })


    $('#requestrecList').on('click', 'li', function(){
    	this.remove();
		socket.emit('request_accepted', this.id);
	})

	socket.on('start-chat', function(id1, id2, historys){
      	$('#chats').append('<div id='+id1+"-"+id2+'>'+
				'<p id=peoplechat></p>'+
				'<form class = form-inline>'+
					'<div class="form-group">'+
						'<input type="text" class="form-control" id="message" placeholder="type here">'+
					'</div>'+
					'<button class="btn btn-default send" id='+ id1+"-"+id2+'send'+'>send</button>'+
				'</form>'+
                '<input type ="file", id='+id1+'-'+id2+'file class=fileupload >'+
				'<ul></ul>'+
			'</div>')

      	$('form').submit(function (evt) {
            evt.preventDefault();});

      	$("#"+id1+'-'+id2).find("#peoplechat").append(id1 + " " + id2);

        for(var i = 0; i<historys.length; i++) {

            $('#'+id1+'-'+id2).find('ul').append('<li>' + historys[i].sender + ' : ' + historys[i].message + '</li>');
        }

    })

    $('#chats').on('change', '.fileupload', function(e){
        $('#progressModal').modal('show');

        var file = e.target.files[0];
        var stream = ss.createStream();
 
        // upload a file to the server. 
        ss(socket).emit('uploadFile', stream, {name: 'download.jpg'});
        var blobStream = ss.createBlobReadStream(file);
        var size = 0;
        blobStream.on('data', function(chunk) {
          size += chunk.length;
          $('#progress').append('<p>' + Math.floor(size / file.size * 100) + '%' + '</p>');
          // -> e.g. '42%' 
        });
         
        blobStream.pipe(stream);
        


    })

    $('#chats').on('click', '.send', function(){
    	var id = this.id.substr(0, this.id.indexOf('send'));
    	var msg = $('#chats').find('#'+id).find('#message').val();
         $('#chats').find('#'+id).find('#message').val("");
    	socket.emit('send', id, msg);
    })

    socket.on('chat', function(msg, ids, sender) {
    	$('#'+ids).find('ul').append('<li>' + sender + ' : ' + msg + '</li>');
    });

    socket.on('accept_handshake', function (id){
    	$('#requestList').find("."+id).remove();

    })

    socket.on('disconnected', function(){
    	alert("server is disconnected");
   	})
});