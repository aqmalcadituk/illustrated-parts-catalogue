var typeMessage = ["NOTE", "CAUTION", "WARNING"];
var isPanelOpen = false;
var openEvent = false;
var m_played = false,
    m_range = document.getElementById('toolbar-range-input'),
    m_rangeSelection = document.getElementById('toolbar-range-selection'),
    m_locked = false;
var max_range_value = 0;
var procedureDiv = document.getElementById('procedure');
var publishOptions;


showElement(m_rangeSelection, m_locked);

function showElement(el, show) {
    el.style.display = show ? '' : 'none';
}

function isElementVisible(node, holder) {
    var top = holder.scrollTop,
        left = holder.scrollLeft,
        x, y, n;
    for (n = node, x = 0; n != holder; n = n.offsetParent) x += n.offsetLeft;
    for (n = node, y = 0; n != holder; n = n.offsetParent) y += n.offsetTop;
    var w = node.offsetWidth,
        h = node.offsetHeight,
        W = holder.clientWidth,
        H = holder.clientHeight;
    return !(y < top || y + h > top + H) || (x < left || x + w > left + W);
}

function setPlayRangeToCurrentStep() {
    var procedure = Cortona3DSolo.app.procedure;
    procedure.setPlayRange("%%CURRENT_STEP%%", null, procedure.RANGE_FLAGS_REQUEST_NOTIFICATION | procedure.RANGE_FLAGS_DO_NOT_RECALCULATE_POSITION);
    var startTime = procedure.getPlayableRangeStartTime(),
        stoptTime = procedure.getPlayableRangeStopTime(),
        procedureDuration = m_range.max - m_range.min;
    m_rangeSelection.style.width = Math.round((stoptTime - startTime) * 100 / procedureDuration) + "%";
    m_rangeSelection.style.left = Math.round((startTime - m_range.min) * 100 / procedureDuration) + "%";
    m_range.min = startTime;//Pyda 20170818
    m_range.value = startTime;
    m_range.max = stoptTime;//Pyda 20170818*/
}

/*Using Cortona3DSolo drawing*/
Cortona3DSolo.use('drawing', {
    element: document.getElementById('solo-svg'),
    hotspotSelectionColor: "#FF8888"
});

/*Using Cortona3DSolo core for 3D animation*/
Cortona3DSolo.use('core', {
    totalMemory: 384,
    element: document.getElementById('solo-canvas'),
    prefixURL: resFolder + '/',
    features: Cortona3DSolo.app.ENABLE_NAVIGATION_FIT_TO_OBJECT
});

/*Check interactiviy exist, then initialize*/
if (propInteractivityName != "") {
    Cortona3DSolo.app.initialize('./' + propInteractivityName);
} else {
    Cortona3DSolo.app.initialize();
}


document.getElementById('button-playback').onclick = function () {
    Cortona3DSolo.app.procedure[m_played ? 'pause' : 'play'].call();
};
document.getElementById('button-stop').onclick = function () {
    Cortona3DSolo.app.procedure.stop();
};
document.getElementById('button-back').onclick = function () {
    var procedure = Cortona3DSolo.app.procedure;
    if (!m_locked) {
        procedure.stop();
        procedure.setPlayRange();
        procedure.backward();
        setPlayRangeToCurrentStep();
    } else {
        procedure.backward();
    }

};
document.getElementById('button-next').onclick = function () {
    var procedure = Cortona3DSolo.app.procedure;
    if (!m_locked) {
        procedure.stop();
        procedure.setPlayRange();
        procedure.forward();
        setPlayRangeToCurrentStep();
    } else {
        procedure.forward();
    }
};
/*
Lock method is removed.Pyda 20170821
document.getElementById('button-lock').onclick = function () {
    m_locked = !m_locked;

    if (m_locked) {
        setPlayRangeToCurrentStep();
        this.textContent = "Unlock";
    } else {
        Cortona3DSolo.app.procedure.setPlayRange(null, null, Cortona3DSolo.app.procedure.RANGE_FLAGS_DO_NOT_RECALCULATE_POSITION);
        this.textContent = "Lock";
    }
    showElement(m_rangeSelection, m_locked);
};*/

document.getElementById('button-event').onclick = function () {
    closeEventBox();
};


Cortona3DSolo.expand(Cortona3DSolo.app, {
    didFinishLoadDocument: function (doc) {
        m_range.min = 0;
        m_range.max = doc.duration;
        max_range_value = doc.duration;//Pyda 20170818
        m_range.step = (m_range.max - m_range.min) / 1000;
        m_range.value = 0;
        m_range.onchange = m_range.oninput = function () {
            Cortona3DSolo.app.procedure.setPlayPosition(this.value, true);
        };

        var holder = document.getElementById('procedure-holder');
        //holder.innerHTML = doc.comments;
        publishOptions = Cortona3DSolo.app.getOptions();

        applyChangesUI();


        function applyChangesUI() {
            if (publishOptions.Background3DColor) {//Setting background color from publish options.
                Cortona3DSolo.app.setDefaultBackgroundColors(publishOptions.Background3DColor);
            }
            if (publishOptions.HighlightedStepColor) {//Setting selected step background color from publish options.
                Cortona3DSolo.app.setDefaultBackgroundColors(publishOptions.Background3DColor);
            }
            if (publishOptions.ShowFreezeCheckbox && publishOptions.ShowFreezeCheckbox == "No") {
                $("#freeze-viewpoint").hide();
            }
            if (publishOptions.ShowFreezeCheckbox && publishOptions.ShowPrevNextButtons == "No") {
                $("#button-back").hide();
                $("#button-next").hide();
            }
            if (publishOptions.ShowFreezeCheckbox && publishOptions.ShowSmoothControl == "No") {
                $("#toolbar-range").hide();
            }
            if (publishOptions.ShowFreezeCheckbox && publishOptions.ShowSpeedSelection == "No") {
                $("#procedure-speed").hide();
            }
        }


        function clickHandler() {
            if (isSvgVisibile) {//Pyda 20170831
                closeSVG()
            }
            if (isCanvasVisible) {
                if (!isPanelOpen) removeNoPanel();
                if ($('#solo-canvas-holder').hasClass('no-show')) {//Pyda 20170818
                    $('#solo-canvas-holder').removeClass('no-show');
                }
                var procedure = Cortona3DSolo.app.procedure;
                procedure.stop();
                procedure.setPlayRange();
                var id = this.id;
                id = id.substr(5);
                m_locked = task_id == id ? true : false;//Checking it is main task id or not.Pyda 20170818
                procedure.seekToSubstep(id);
                if (!m_locked) {//Setting range 
                    setPlayRangeToCurrentStep(); //test for set range Pyda 20170818
                } else {
                    m_range.min = 0;
                    m_range_max = max_range_value;
                    m_range.value = 0;
                }
                $('#button-playback').click();//Pyda 20170908
            }
        }

        function clickHandlerItem() {
            if (isCanvasVisible) {
                if (!isPanelOpen) removeNoPanel();
                if ($('#solo-canvas-holder').hasClass('no-show')) {//Pyda 20170818
                    $('#solo-canvas-holder').removeClass('no-show');
                }
                var interactivity = Cortona3DSolo.app.procedure.interactivity;
                var docid = this.id;
                Cortona3DSolo.app.attnObjects(interactivity.getObjectNamesByDocId(docid));
            }
        }

        Array.prototype.slice.call(procedureDiv.getElementsByClassName('link3d')).forEach(//Pyda 20170911
            function (el) {
                el.addEventListener('click', clickHandler);
            });

        Array.prototype.slice.call(holder.getElementsByClassName('doc-item')).forEach(
            function (el) {
                el.addEventListener('click', clickHandlerItem);
            });
    },

    firstFrameDidArrive: function () {
        document.body.classList.add('ready');
        if (m_locked) {
            setPlayRangeToCurrentStep();
        }
    },

    /*Click on DocId*/
    attnObjects: function (defs) {
        var interactivity = Cortona3DSolo.app.procedure.interactivity;
        var handles = defs.map(function (def) {
            return Cortona3DSolo.app.getObjectWithName(def);
        });
        // Cortona3DSolo.app.fitSceneInView(true);//Pyda 20170613
        Cortona3DSolo.app.fitObjectsInView(handles, true);
        handles.forEach(function (handle) {
            Cortona3DSolo.app.setObjectPropertyf(handle, Cortona3DSolo.app.PROPERTY_DIFFUSE_COLOR,
                true, 1, 1, 0);
            setTimeout(function () {
                Cortona3DSolo.app.restoreObjectProperty(0, Cortona3DSolo.app.PROPERTY_DIFFUSE_COLOR,
                    true);
            }, 2000);
        });
    }
});


Cortona3DSolo.expand(Cortona3DSolo.app.procedure, {
    /*Change in player state*/
    didChangePlayerState: function (position, state) {
        m_played = !!(state & 1);
        document.getElementById('button-playback').textContent = m_played ? pause_button_text : play_button_text;//Pyda 20170913
        document.getElementById("button-playback").title = m_played ? pause_button_title : play_button_title;//Pyda 20170913
        m_range.value = position;
        if (state === 0x100) { // stop
        }
    },
    /*New Events*/
    didFireEvent: function (type, id, title, info) {
        openEventBox(id);
    },

    /*Enter in new step*/
    didEnterSubstepWithName: function (substepid) {
        var holder = document.getElementById('procedure-holder');
        removeSelectedClass()
        var interactivity = Cortona3DSolo.app.procedure.interactivity;
        if (interactivity) {
            var current = interactivity.getProcedureItemInfo(substepid);
            var a = [];
            while (current) {
                var node = document.getElementById(current.id);
                if (node) {
                    a.push(node);
                    node.classList.add('selected');//Highlight HTML;
                }
                current = interactivity.getProcedureItemInfo(current.parent);//Looking for Parent Substep
            }

            if (!isElementVisible(a[a.length - 1], holder)) a[a.length - 1].scrollIntoView(true);
            if (!isElementVisible(a[0], holder)) a[0].scrollIntoView(false);
        }
    }
});

/*Cortona3D options*/

//Freeze Camera
function freezeCamera(check) {
    Cortona3DSolo.app.procedure.freezeCamera(check);
}

//Set Speeed Animation
function setSpeedAnimation(ratio) {
    Cortona3DSolo.app.procedure.setPlaybackSpeed(ratio);
}


/*Message box methods*/
function openEventBox(id) {
    var eventObject = Cortona3DSolo.app.procedure.interactivity.getProcedureItemInfo(id);//Pyda 20180516
    var type = (eventObject.eventType == "WARNING" || eventObject.eventType == "CAUTION" || eventObject.eventType == "DANGER" || eventObject.eventType == "NOTICE" || eventObject.eventType == "NOTE") ? eventObject.eventType.toLowerCase() : "other";
    eventTypeName = type;
    var description = Cortona3DSolo.app.procedure.interactivity.getProcedureItemInfo(id).description;//Pyda 20180516
    addAlertTypeClass(type);
    addAlertTypeToCaption(eventObject.eventType, eventObject)
    addAlertContentToBody(eventObject.eventType, eventObject);//Pyda 20180516
    displayEventBox();
}

function addAlertTypeClass(type) {
    var typeObject = document.getElementById("alert-message-type");
    typeObject.className = "alert-message-type-" + type;
}

function addAlertTypeToCaption(type, obj) {
    if (eventTypeName != "other") {
        document.getElementById("alert-message-caption").innerHTML = type;
    } else {
        var eventobj = obj.description;
        document.getElementById("alert-message-caption").innerHTML = $("#" + eventobj).children()[0].innerHTML
    }

}

function addAlertContentToBody(type, id) {
    if (eventTypeName != "other") {
        var contentId = type.toLowerCase() + "_" + id.description;
        document.getElementById("alert-message-body").innerHTML = ($("#" + contentId).length == 0) ? id.description : document.getElementById(contentId).innerHTML;
    } else {
        var eventobj = id.description;
        document.getElementById("alert-message-body").innerHTML = $("#" + eventobj).children()[1].innerHTML
    }

}

function displayEventBox() {
    changeStyleEventBox();
    document.getElementById("eventBox").classList.remove('no-show');
    document.getElementById('button-playback').click();
    openEvent = true;
}

function changeStyleEventBox() {
    var sol = document.getElementById("solo-canvas-holder");
    var box = document.getElementById("eventBox");
    var ht = sol.offsetHeight - box.offsetHeight;
    box.style.top = ht / 2 + "px";
}

function closeEventBox() {
    openEvent = false;
    document.getElementById("eventBox").classList.add('no-show');
    document.getElementById('button-playback').click();
}

/*End of Message box methods*/

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
4.pauseAnimation3D is called
5.hideCanvasHolder() is called
6.addContentToSVG method io called*/
function load2D() {
    var title = getSVGTitle(this);
    var src = this.attributes["data-src"].value;
    if (!isPanelOpen) removeNoPanel();
    pauseAnimation3D();
    hideCanvasHolder();
    addContentToSVG(title, src);
}

var tempElement;

function getSVGTitle(e) {
    tempElement = e;
    var res = ($(tempElement).parent().parent().hasClass("fig")) ? $(tempElement).parent().parent().attr("data-title") : $(tempElement).attr("data-title");
    console.log(res);
    return res;
}

/*if animation played, pause animation*/
function pauseAnimation3D() {
    if (m_played && propInteractivityName !== "") {
        document.getElementById('button-playback').click();
    }
}

/*Hide canvasholder*/
function hideCanvasHolder() {
    isCanvasVisible = false;
    document.getElementById('solo-canvas-holder').classList.add('no-show');
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
    Cortona3DSolo.app.drawing.load(src);
}

function showSVGHolder() {
    document.getElementById('solo-svg-holder').classList.remove('no-show');
}

function showSVG() {
    isSvgVisibile = true;
    Cortona3DSolo.app.drawing.show();
}


function closeSVG() {
    if (isPanelOpen) addNoPanel();
    hideSVG();
    showCanvasHolder();
}

function addNoPanel() {
    isPanelOpen = false;
    document.getElementsByClassName("container")[0].classList.add('no-panel');

}

function hideSVG() {
    document.getElementById("solo-svg-holder").children[1].style.visibility = "hidden";
    document.getElementById("solo-svg-holder").classList.add('no-show');
    isSvgVisibile = false;
}

function showCanvasHolder() {
    document.getElementById('solo-canvas-holder').classList.remove('no-show');
    isCanvasVisible = true;
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

/*End of Close Cortona3D*/

/*Toolbar buttons*/

//Freeze Viewpoint
$('#vpfreeze').change(function () {
    freezeCamera(this.checked);
});

//Select Speed
$('#speed-selector').change(function () {
    setSpeedAnimation(this.value);
});

/*Help button Pyda 20170831*/
$("button.helpButton").on("click", function () {
    window.open(resFolder + "/" + language_spec + "/help.html", "help window", 'width=800, height=600');
})


$(document).ready(function () {
    if (publishOptions && publishOptions.HighlightedStepColor) {
        console.log("t");
    }
});
