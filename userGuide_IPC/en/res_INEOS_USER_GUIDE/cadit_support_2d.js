/*last updated date: 20180523*/
var isPanelOpen = false;
var openEvent = false;
var embedElementCreated = false;
var embedElement;
var lastEventListener;
var isSVG = false;


/*2D display methods*/
var holder = document.getElementById('procedure-holder');//Procedure-holder element
Array.prototype.slice.call(holder.getElementsByClassName('2d-link')).forEach(
    function (el) {
        el.addEventListener('click', load2D);// load2D method called when 2d-link class element is clicked
    });

var isCanvasVisible = true;
var isSvgVisibile = false;

/*
Load2D functionlity
1.get title. 
2.get src 
3.check is panel open and remove panel(no expanded view of document) 
4.Check is image is SVG/JPG ;
4.addContentToSVG method io called*/
function load2D() {
    var title = getSVGTitle(this);
    var src = this.attributes["data-src"].value;
    checkIsSVG(src);
    if (!isPanelOpen) removeNoPanel();
    addContentToSVG(title, src);
}

var tempElement;

function getSVGTitle(e) {
    tempElement = e;
    var res = ($(tempElement).parent().parent().hasClass("fig")) ? $(tempElement).parent().parent().attr("data-title") : $(tempElement).attr("data-title");
    console.log(res);
    return res;
}

function checkIsSVG(src) {
    isSVG = !(src.indexOf(".svg") == -1);
}

function addContentToSVG(title, src) {
    addTitleToSVG(title);
    loadSVG(src);
    showSVGHolder();
    showSVG();
}

function addTitleToSVG(title) {
    document.getElementById("app-figure-title").innerHTML = title;
}

function loadSVG(src) {
    console.log("load " + src);
    if (isSVG) {
        embedElement = createNewEmbed(src);
    } else {
        if (embedElement != null) {
            removeEmbed();
            $("#solo-img").remove();
        }
        var image = document.createElement('img');
        image.setAttribute('id', 'solo-img');
        image.setAttribute('src', src);
        $("#solo-svg").after(image);
    }
    //$('#solo-img').attr('data', src);
}

function createNewEmbed(src) {
    try {
        if ($("#solo-img").length) {
            $("#solo-img").remove();
        }
        var embed = document.createElement('embed');
        embed.setAttribute('id', 'solo-img');
        embed.setAttribute('type', 'image/svg+xml');
        embed.setAttribute('src', src);

        //document.getElementById('container').appendChild(embed);
        $("#solo-svg").after(embed);
        var lastEventListener = function () {
            svgPanZoom(embed, {
                zoomEnabled: true,
                controlIconsEnabled: false
            });
        }
        embed.addEventListener('load', lastEventListener);
        return embed
    } catch (e) {
        console.log(e);
    }
}

function removeEmbed() {
    try {
        // Destroy svgpanzoom
        svgPanZoom(embedElement).destroy()
        // Remove event listener
        embedElement.removeEventListener('load', lastEventListener)
        // Null last event listener
        lastEventListener = null
        // Null reference to embed
        embedElement = null;
    } catch (e) {
        console.log(e);
    }
}

function showSVGHolder() {
    document.getElementById('solo-svg-holder').classList.remove('no-show');
}

function showSVG() {
    isSvgVisibile = true;
    document.getElementById('solo-img').classList.remove('no-show');
    //setTimeout(function(){svgPanZoom("#solo-img")}, 500);
    //var svgElement = svgPanZoom("#solo-img");
}


function closeSVG() {
    if (isPanelOpen) addNoPanel();
    hideSVG();
}

function addNoPanel() {
    isPanelOpen = false;
    document.getElementsByClassName("container")[0].classList.add('no-panel');

}

function hideSVG() {
    if (isSVG) {
        removeEmbed();
    }
    $("#solo-img").remove();
    document.getElementById("solo-svg-holder").classList.add('no-show');
    isSvgVisibile = false;
}


/*Open right panel in container*/
function removeNoPanel() {
    isPanelOpen = true;
    document.getElementsByClassName("container")[0].classList.remove('no-panel');
}

document.getElementById('button-close').onclick = function () {
    closeSVG();
};

/*remove selected class from div contents*/
function removeSelectedClass() {
    Array.prototype.slice.call(holder.getElementsByClassName('selected')).forEach(function (el) {
        el.classList.remove('selected'); //Removing hilight 
    });
}

/*Close Cortona3D*/
$("#button-close-canvas").on("click", closePanel);

function closePanel() {
    if (isCanvasVisible) {
        hideCanvasHolder();
        removeSelectedClass()
        isCanvasVisible = true;
    }
    addNoPanel();
}


/*Help button Pyda 20170831*/
$("button.helpButton").on("click", function () {
    window.open(resFolder + "/" + language_spec + "/help.html", "help window", 'width=800, height=600');
})


$(document).ready(function () {
    try {
        document.getElementById('solo-canvas-holder').classList.add('no-show');
        document.getElementById('solo-svg').classList.add('no-show');
    } catch (e) {
        console.log(e);
    }
});



window.onscroll = function() {myFunction()};


var header = document.getElementById("header");

var sticky = header.offsetTop;


function myFunction() {
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}
