
//player
var currentID = "";
var volumeLevel = 1;
// Play Audio
function playAudio(id) {
    //Pause any previous playing audio
    pauseAudio();
    // console.log(id)
    //Set the new Audio ID
    try{
    if(currentID != id){
       $(currentID)[0].currentTime = 0;
    }}
    catch (e) {
        }
    currentID = id;
    // console.log("Playing Audio***************************")
    // play the audio
    $(id).trigger("play");
    try{
        $(id)[0].volume = volumeLevel; 
    }
    catch (e) {

    }
}

// Pause Audio
function pauseAudio() {
    $(currentID).trigger("pause");
}


// Resume Audio
function resumeAudio() {
    // console.log("Resume Audio")
    try{
        if ($(currentID).prop("ended") == false || $(currentID).prop("ended") == undefined) {
            $(currentID).trigger("play");
        } else {
            // console.log($(currentID).prop("ended"))
            // console.log(currentID)
        }
    }
    catch (e) {

    }
}

function changeAudio(level) {
    level = level/100
    try{
        $(currentID)[0].volume = level;
    }
    catch (e) {
    }
    volumeLevel = level;
}