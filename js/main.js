$(document).ready(function() {
    //MAIN METHOD--------------------------------------------------------------------------------------

    //var apollo = [...] information about apollo missions was imported in html
    console.log("DOM loaded");
    var curQ;   //current question number we are on (zero based indexing)
    var NASACorrect;    //current number of correct answers NASA player has guessed
    var USSRCorrect;    //current number of correct answers NASA player has guessed
    var is2Player;
    var curPlayer;
    initialize();
    $("#1Player").on("click", start1Player);
    $("#2Player").on("click", start2Player);
    $("#result button").on("click", reset);
    $("#answers").on("click", ".option", guess);
    $("#answers").on("mouseenter",".option", hoverOnOption);
    $("#answers").on("mouseleave",".option", hoverOffOption);
    document.addEventListener("animationComplete", setupNextQ);
    $(".minipatch").on("mouseenter", hoverOnMission);
    $(".minipatch").on("mouseleave", hoverOffMission);

    //EVENT LISTENERS----------------------------------------------------------------------------------

    //Start 1 Player game
    function start1Player() {
        $("#NASAScore h2").first().html("Score");
        $("#USSRScore").hide();
        $("#USSRMover").css("visibility","hidden");
        is2Player = false;
        startGame();
    };

    //Start 2 Player game
    function start2Player() {
        $("#NASAScore h2").first().html("NASA Score");
        $("#USSRScore").show();
        $("#USSRMover").css("visibility","visible");
        is2Player = true;
        startGame();
    };

    //Reset after game end
    function reset() {
       initialize(); 
    };

    //Guess an answer
    function guess(event) {
        if (!is2Player || curPlayer == "USSR") {
            removeOpt(curQ);
        }
        if($(event.target).html() == apollo[curQ].mission) {    //correct answer
            //we use eval so we can build code to execute using the curPlayer
            //string instead of an if statement
            (eval(curPlayer + "Correct++"));
            $("#" + curPlayer + "Correct").html(eval(curPlayer + "Correct"));
            animateShip(true, curPlayer, eval(curPlayer + "Correct"));
        } else {    //incorrect answer
            // var event = new Event("animationComplete");
            animateShip(false, curPlayer, eval(curPlayer + "Correct"));
            // document.dispatchEvent(event);
        }
        //setting up for the next question will be handled by an event handler listening for the
        //animationComplete event because we want to make sure the game does not proceed until the
        //animation if there is one finishes
    };

    //borders options when hovered over
    function hoverOnOption(event) {
        $(event.target).css("border-color","white");

    };
    //unborders options when unhovered over
    function hoverOffOption(event) {
        $(event.target).css("border-color","transparent");
    };

    function setupNextQ() {
        if (!is2Player || curPlayer=="USSR") {
            curQ++;
            if (curQ < apollo.length) { //game is not over yet. Load next question
                loadQ(curQ);
            } else {    //game is over
                endGame();
            }
        }
        if (is2Player) {
            switchPlayer();
        }
    }

    function hoverOnMission(event) {
        var missionIndex = findMissionIndex($(event.target.parentElement.lastElementChild).html());
        console.log("Hovered over " + apollo[missionIndex].name);
        $("#missionInfo .nameText").html(apollo[missionIndex].name);
        $("#missionInfo .launchText").html("Launch Date: " + apollo[missionIndex].launch);
        $("#missionInfo .missionText").html("Mission: " + apollo[missionIndex].mission);
        $("#missionInfo .resultText").html("Result: " + apollo[missionIndex].result);
        $("#missionInfo").show();
        if ($(event.target.parentElement.parentElement).attr("id") == "row1") {
            $("#missionInfo").css("top","55%");
        } else {
            $("#missionInfo").css("top","5%");
        }
    };
    function hoverOffMission() {
        $("#missionInfo").hide();
    };

    //HELPER METHODS------------------------------------------------------------------------------------

    //initialize a new game on page load or game reset
    function initialize() {
        curQ = 0;
        NASACorrect = 0;
        USSRCorrect = 0;
        curPlayer = "NASA";
        $("#NASACorrect").html(NASACorrect);
        $("#USSRCorrect").html(USSRCorrect);
        $("#play").hide();
        $("#result").hide();
        $("#missions").hide();
        $("#missionInfo").hide();
        $("#interface").show();
        $("#start").show();
        //locate movers to Ship0
        $("#NASAMover").css("left",$("#NASA0").css("left"));
        $("#NASAMover").css("top",$("#NASA0").css("top"));
        $("#NASAMover").css("transform",$("#NASA0").css("transform"));
        $("#USSRMover").css("left",$("#USSR0").css("left"));
        $("#USSRMover").css("top",$("#USSR0").css("top"));
        $("#USSRMover").css("transform",$("#USSR0").css("transform"));
    };

    //starts the game with all common elements no matter how many players there are
    function startGame() {
        $("#start").hide();
        $("#play").show();
        loadQ(curQ);    //load current question
        //load answer options
        var order = randomize(apollo);
        order.forEach(function(cur,ii) {
            $("#answers").append("<div class=\"option\">" + apollo[cur.index].mission + "</div>");
        });
    };

    //returns a random array of indices of the same length that is provided
    //e.g. for an array of length 4, might return (1,0,3,2)
    function randomize(array) {
        var order = [];
        for (var ii = 0; ii < array.length; ii++) {
            order.push({index:ii, priority:Math.random()});
        }
        order.sort( function(a,b) {
            return a.priority - b.priority;
        });
        return order;
    }

    //loads the question at the specified index
    function loadQ(question) {
        $("#play .patch").attr("src",apollo[question].patch);
        $("#play .nameText").html(apollo[question].name);
        $("#play .launchText").html(apollo[question].launch);
    };

    //remove option for the provided question index
    function removeOpt(question) {
        var options = $(".option");
        for (var ii = 0; ii < options.length; ii++) {
            if ($(options[ii]).html() == apollo[question].mission) {
                $(options[ii]).remove();
                return;
            }
        }
    }

    function findMissionIndex(name) {
        for (var ii = 0; ii < apollo.length; ii++) {
            if (name == apollo[ii].name) {
                return ii;
            }
        }
        console.log("Could not find mission index for " + name);
    }

    //animate ship to move to new position
    //this is an asynchronous function!
    //owner is either NASA or USSR, ship is the ship number of the new position
    function animateShip(isCorrect, owner, ship) {
        //if incorrect then ship will be current position because xCorrect was never incremented.
        //If correct then ship will be next position.
        $("#interface").hide();
        var lastId = "#" + owner + (ship-1);
        var id = "#" + owner + ship;    //move to next position
        var moverId = "#" + owner + "Mover";
        var top = $(id).css("top");
        var left = $(id).css("left");
        var finalPosition = {"top":top, "left":left};
        var duration = 2000;    //animation duration
        var numSteps = duration/13; //each frame lasts about 13 ms
        var transformF = $(id).css("transform");
        if (isCorrect) {
            //transform will have the form "matrix(a,b,c,d,e,f)"
            var transformI = $(lastId).css("transform");
            var angleF = extractAngle(transformF);  //final angle
            var angleI = extractAngle(transformI);  //initial angle
            var anglePerStep = (angleF-angleI)/numSteps;
        } else {    //!isCorrect
            var angleI = extractAngle(transformF); //final angle = initial angle if incorrect
            var anglePerStep = 360/numSteps;    //spin a circle
        }
        var step = 0;
        //jQuery does not support transform in animations! We have to set the transform manually each step
        $(moverId).animate(finalPosition,{"duration":duration, 
            progress: function(now,fx) {
                    step++;
                    $(moverId).css("transform","rotate(" + (angleI + anglePerStep * step) + "deg");
                    //a positive rotation angle corresponds to a clockwise rotation (blech) so we have to
                    //multiply by -1 in the transform
            }, 
            complete: function() {
                $(moverId).css("transform",transformF);    //make sure rotation is correct
                $("#interface").show();
                var event = new Event("animationComplete");
                document.dispatchEvent(event);
        }});
    }

    //convert a transform css attribute to a rotation angle
    function extractAngle(matrix) {
        //parameter will either be "none" or "matrix(cos,sin,-sin,cos,0,0)"
        if (matrix == "none") {
            return 0;
        } else {
            var matArray = eval("[" + matrix.substring(7,matrix.length-1) + "]");
            //console.log("matArray" + matArray);
            //matArray is the transformation array
            if (matArray[0] >= 0) { //cos is + or 0
                if (matArray[1] >= 0) { //sin is + or 0
                    //quadrant 1
                    return Math.acos(matArray[0])*180/Math.PI;
                } else {    //sin is -
                    //quadrant 4
                    return -1*Math.acos(matArray[0])*180/Math.PI;
                }
            } else {    //cos is -
                if (matArray[1] >=0) {  //sin is + or 0
                    //quadrant 2
                    return Math.acos(matArray[0])*180/Math.PI;
                } else {
                    //quadrant 3
                    return -1*Math.acos(matArray[0])*180/Math.PI;
                }
            }
        }
    }

    function endGame() {
        $("#interface").hide();
        $("#missions").show();
        evaluateResults();
        $("#result").show();
    };

    //evaluates and the score and updates result h2 with an appropriate message
    function evaluateResults() {
        if (!is2Player) {   //one player game
            if (NASACorrect == 12) {    //got 100%
                $("#result h2").html("Congratulations! You made it to the moon and back.");
            } else {
                $("#result h2").html("Grounded until you brush up on your history!")
            }
        } else {    //two player game
            if (NASACorrect == USSRCorrect) {
                $("#result h2").html("Tie game. Ready for a rematch?");
            } else if (NASACorrect > USSRCorrect) {
                $("#result h2").html("The Americans are victorious in the space race! Yeehaw!");
            } else {    //NASACorrect < USSRCorrect
                var russian = "&#1044&#1072 &#1079&#1076&#1088&#1072&#1074&#1089&#1090&#1074&#1091&#1077&#1090 CCCP!";
                $("#result h2").html(russian);
            }
        }
    }

    //looks at curPlayer and toggles it between NASA and USSR
    function switchPlayer() {
        if (curPlayer == "NASA") {
            curPlayer = "USSR";
        } else {    //curPlayer == "USSR"
            curPlayer = "NASA";
        }
    }

    //JS Loaded----------------------------------------------------------------------------------------
    console.log("JS Loaded");
});