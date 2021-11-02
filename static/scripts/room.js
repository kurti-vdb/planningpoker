
let socket = io({ transports: ['websocket'], upgrade: false });

// Incoming socket events

socket.on("connect", function () {
    socket.emit('join', user);
    console.log("User " + user.name + " connected: " + Date());
});

socket.on('update', function (users) {
    populateUsers(users);
});

socket.on('show-vote-results', function (votes) {
    showVoteResults(votes);
});

socket.on("disconnect", function (user) {
    console.log("User " + user.name + " disconnected: " + Date());
});

socket.on("next-voting", function (users) {
    deselectCard();
    $(".cards, .show-result-btn").show();
    $(".vote-results, .next-voting-btn").hide();
});

$(window).on('beforeunload', function () {
    socket.disconnect();
})

function populateUsers(users) {

    $('.people').empty();

    for (var i = 0; i < users.length; i++) {
        if (users[i].voted === true) {
            $('.people').append(`<li class="person">
                <img src="/images/avatars/${users[i].avatar}" alt="${users[i].name}" />
                <div class="name"><span class="fa fa-" aria-hidden="true"></span> ${users[i].name}</div>
                <span class="time">${users[i].role}</span>
                <span class="location">${users[i].city}</span>
                <span class="voted"></span>
                <span class="vote-value">${users[i].vote}<span>             
            </li>`);
        }
        else {
            $('.people').append(`<li class="person">
                <img src="/images/avatars/${users[i].avatar}" alt="${users[i].name}" />
                <div class="name"><span class="fa fa-" aria-hidden="true"></span> ${users[i].name}</div>
                <span class="time">${users[i].role}</span>
                <span class="location">${users[i].city}</span>
                <span class="not-voted"></span>                        
            </li>`);
        }

    }
}

var chart = null;

function showVoteResults(votes) {

    let response = prepareVotesForChart(votes)

    // Chart
    var ctx = document.getElementById('chart').getContext('2d');

    if (chart || chart instanceof Chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: response[0],
            datasets: [
                {
                    label: "Votes",
                    backgroundColor: ["#003459", "#00A8E8", "#eee", "#007EA7", "#00171F"],
                    data: response[1]
                }
            ]
        },
        options: {
            legend: {
                display: true,
                position: "right",
                responsive: true,
                maintainAspectRatio: false
            }
        }
    });

    $(".cards, .show-result-btn, .voted").hide();
    $(".vote-results, .next-voting-btn, .vote-value").show();
}


function prepareVotesForChart(arr) {

    let a = [];
    let b = [];
    let prev;

    let votes = arr.map(a => a.vote);

    votes.sort();
    for (var i = 0; i < votes.length; i++) {
        if (votes[i] !== prev) {
            a.push(votes[i]);
            b.push(1);
        }
        else {
            b[b.length - 1]++;
        }
        prev = votes[i];
    }

    return [a, b];
}

function deselectCard() {
    $(".cardFace").each(function () {
        $(this).removeClass('selected');
    });
}

// Outgoing socket events

$(".cardFace").click(function () {

    deselectCard();

    $(this).toggleClass("selected");

    let uid = $("#user").data("uid");
    let vote = $(this).data("vote-value");

    socket.emit('vote', { uid: uid, vote: vote });
});

$("#stop-voting").click(function () {
    socket.emit('stop-voting');
});

$(".next-voting-btn").click(function () {
    socket.emit('next-voting');
});



