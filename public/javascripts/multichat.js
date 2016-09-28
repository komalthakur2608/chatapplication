$(document).ready(function(){ 

	var socket = io.connect("localhost:3001");
	$('#myModal').modal('show');
	$('form').submit(function (evt) {
            evt.preventDefault();
    });
    $('#name').focus();

    $(document).on('click', '#join', function() { 
    	console.log("join button clicked");
    	socket.emit('join', $('#name').val(), $('#password').val());
    })

    socket.on('welcome' , function(msg) {
            $('#myModal').modal('hide');
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
        var ext = file.name.split('.')[1];
        var stream = ss.createStream();
 
        // upload a file to the server. 
        var blobStream = ss.createBlobReadStream(file);
        var size = 0;
        ss(socket).emit('uploadFile', stream, {name: this.id+Date.now()+'.'+ext}, this.id);
        blobStream.on('data', function(chunk) {
            size += chunk.length;
            var percentComplete = Math.floor(size / file.size * 100) + '%';
            $('.progress-bar').width(percentComplete);
            $('#progress').text(percentComplete + " complete");
            if(percentComplete == '100%') {
               setTimeout(function(){}, 3000);
                $('#progressModal').modal('hide');
            }
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

    socket.on('disconnected', function(id){
    	alert("server is disconnected + " + id);
        if(document.getElementById('id').length > 0) {
            alert(exists);
            document.getElementById('id').remove();
        }
        
   	})

    socket.on('fileDownload', function(name, ids, sender){
        var id = ids.replace('file', '');

        $('#'+id).find('ul').append('<li>' + sender + ' : '+ '<a href ='+ name+ '><img src = "images/download.png" width = "50px" alt = "download image" /></a></li>');    
    })

    socket.on('invalidlogin', function(){
        $('#invalid').text('invalid username or password');
        $('#name').val("");
        $('password').val("");
    })

    $(document).on('click', '#signup', function() { 
        $('#myModal').modal('hide');
        $('#signupModal').modal('show');
    })

    $(document).on('click', '#signupbtn', function() { 
        socket.emit('signup', $('#signupname').val(), $('#signuppassword').val());
    })

    socket.on('signupSuccess', function(){
        $('#myModal').modal('show');
        $('#signupModal').modal('hide');
    })

    socket.on('signupFail', function(){
        $('#failsignup').text('Username already exists');
    })

});