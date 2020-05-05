module.exports = function (io) {

    let votes = [];
    let chatters = [];

    io.on("connection", function (socket) {

        socket.on("join", function (user) {

            socket.user = user;
            socket.join(user.uuid); // Private channel per user
            user.socketID = socket.id;

            votes.push({ uid: user.uid, vote: null })
            chatters.push(user);
            updateClients();

            console.log("User " + socket.user.username + " connected from Join event: " + Date());
        });

        socket.on('vote', function (data) {

            let indexVotes = votes.findIndex(el => el.uid === data.uid);
            let indexUsers = chatters.findIndex(el => el.uid === data.uid);

            if (data.vote != undefined) {
                votes[indexVotes].vote = data.vote;
                chatters[indexUsers].voted = true;
                chatters[indexUsers].vote = data.vote;
            }
            else {
                votes[indexVotes].vote = null;
                chatters[indexUsers].voted = false;
                chatters[indexUsers].vote = null;
            }

            updateClients();
        });

        socket.on('stop-voting', function () {
            io.sockets.emit("show-vote-results", votes);
        });

        socket.on('next-voting', function () {

            // 1. Reset all votes
            //votes = [];
            votes.forEach(function (obj) {
                obj.vote = null;
            });

            // 2. Set all votes on null in users array
            chatters.forEach(function (user) {
                user.voted = false;
                user.vote = null;
            });

            // 3. update clients
            io.sockets.emit("next-voting"); //toggle cards
            updateClients();
        });

        socket.on("updateUser", function (user) {
            socket.user = user;
            index = chatters.findIndex((obj) => obj.username == user.username);
            chatters[index] = user;
            //updateClients();
            updateChatter(user);
            console.log("User " + socket.user.username + " updated: " + Date());
        });

        socket.on("connect", function () {
            console.log("User: " + socket.user.username + " connected by connection event.");
        });

        socket.on("disconnect", function () {

            console.log("User " + socket.user.username + " disconnected from disconnect event: " + Date());

            // Remove user
            for (var i = 0; i < chatters.length; i++) {
                if (chatters[i] == socket.user) {
                    chatters.splice(i, 1);
                }
            }

            // Remove vote
            votes = votes.filter(function (vote) {
                return vote.uid !== socket.user.uid;
            });

            updateClients();
        });


        function updateClients() {
            io.sockets.emit("update", chatters);
            console.log("clients updated.");
        }


        // Update chatter
        function updateChatter(user) {
            io.sockets.emit("updateUser", user);
        }
    });
};
