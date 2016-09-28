$(document).ready(function(){  
        var socket = io.connect("localhost:3000");
        
        var temp;
        var registerDialog = document.querySelector('#registerModal');
        var onlineDialog = document.querySelector('#onlinePeopleModal');
        var requestDialog = document.querySelector('#chatRequest');
        registerDialog.showModal();
        $('form').submit(function (evt) {
            evt.preventDefault();
        });
        $('#name').focus();

        registerDialog.querySelector('.close').addEventListener('click', function() {
            var name = $('#name').val();
            var pass = $('#password').val();
            var phone = $('#phone').val();
            var email= $('#email').val();
            if(name != "") {

                socket.emit('join', name, pass, phone, email);
            }
            else {
                alert("Please enter a name")
            }
            registerDialog.close();
        })

        document.getElementById('msgBtn').addEventListener('click', function(){
            var msg = $('#message').val();
            if(msg != "") {
                socket.emit('send', msg);
                $('#message').val("");
                $('#chat').append ('<div class="mdl-card__supporting-text">'+ person + " : " + msg + '</div>');
            }

        })

        socket.on('welcome' , function(msg) {

            $("#welcome").text(msg);
        })

        socket.on('chat', function(person, msg) {
            $('#chat').append ('<div class="mdl-card__supporting-text">'+ person + " : " + msg + '</div>');
        })

        socket.on('available_people', function(people){

            var onlineDialog = document.querySelector('#onlinePeopleModal');
            onlineDialog.showModal();
            $.each(people, function(clientid, name){
                console.log("client id : " + clientid + "socket : " + socket.id)
                if(clientid != ('/#'+socket.id)){
                     $('#onlineList').append('<li class="mdl-list__item" id='+clientid+'><span class="mdl-list__item-primary-content"><i class="material-icons mdl-list__item-icon">person</i>'+name+'</span></li>')
                }
            })
            

        })

        $('#onlineList').on('click', 'li', function(){
            onlineDialog.close();
            socket.emit('send_request', this.id);
        })

        socket.on('client1_request', function(name, id){
            onlineDialog.close();
            requestDialog.showModal();
            $('#requestFrom').text("Chat request from "+name+'. Accept?');
            $('#requestfromid').val(id);
        })

        requestDialog.querySelector('#Yes').addEventListener('click', function() {
            socket.emit('request_accepted', $('#requestfromid').val());
            console.log("ugsdg : " + $('#requestfromid').val())
            requestDialog.close();
        })

        requestDialog.querySelector('#No').addEventListener('click', function() {
            onlineDialog.showModal();
            requestDialog.close();
            
        });

        socket.on('disconnect', function(){
            alert("server not connected");
        })

        socket.on('start-chat', function(id1, id2){
            $('#people-in-chat').append('<span class="mdl-chip"><span class="mdl-chip__text">'+id1+'</span></span>')
            $('#people-in-chat').append('<span class="mdl-chip"><span class="mdl-chip__text">'+id2+'</span></span>')

        })

    });