Cortona3DSolo.use('drawing', {
    element: document.getElementById('solo-svg')
});

// Cortona Setup
Cortona3DSolo.use('core', {
    totalMemory: totalMemoryValue,
    element: document.getElementById('solo-canvas'),
    prefixURL: './' + resFolder + '/Redistributables/',
    features: Cortona3DSolo.app.ENABLE_NAVIGATION_FIT_TO_OBJECT | Cortona3DSolo.app.DRAWING_HOTSPOT_HIGHLIGHT_SOLID
});

/*Check interactiviy exist, then initialize*/
if (propInteractivityName != "") {
    Cortona3DSolo.app.initialize('./' + propInteractivityName);
} else {
    Cortona3DSolo.app.initialize();
}
var m_didSelectHotspotInvoked = false;

var lastElemClicked;

//Move Into React
setTimeout(function () {
    $("#solo-canvas").detach().appendTo("#MainDiv")
    $(".cortona3dsolo-svg").detach().appendTo("#MainDiv")
}, 1000);


// IPC hooks
Cortona3DSolo.expand(Cortona3DSolo.app.ipc, {
    // hooks
    didHoverItem: function (index) {
        var interactivity = Cortona3DSolo.app.ipc.interactivity,
            csn = interactivity.getItemByIndex(index);
        Cortona3DSolo.app.drawing.hoverHotspot(csn);
        Cortona3DSolo.app.ipc.dpl.hoverRow(index);
        Cortona3DSolo.app.drawing.hoverColor = "#518DAB";
        hoverIndex = index;
    },

    didSelectItem: function (index) {
        var interactivity = Cortona3DSolo.app.ipc.interactivity,
            csn = interactivity.getItemByIndex(index);
        // console.log("Selected Item : ")
        // console.log(index);
        setTimeout(function () {
            Cortona3DSolo.app.ipc.selectItem(index);
            //Select Row Alone
            Cortona3DSolo.app.ipc.dpl.selectRowAlone(index);
            // Cortona3DSolo.app.drawing.selectionColor = "#eddbb4";
            Cortona3DSolo.app.drawing.selectionColor = "#C9AD6D";
            // $('#dpl-table > tbody > .selected').show();
            clickAccordian(index);
            try {
                $("#row" + index).get(0).scrollIntoView();
            } catch (e) {
                console.log(e)
            }
        }, 50);
    },

    didSelectSheet: function (sheet) {
        m_viewHistory.push(sheet);
        document.body.classList.toggle('history', m_viewHistory.length > 1);
        m_select.value = sheet.id;
        m_sheet_drawing = sheet.drawing;
        m_sheet_desc = sheet.description;
        document.getElementById('dpl-holder').innerHTML = sheet.dplTable;
        Cortona3DSolo.app.ipc.dpl.setupTable(document.getElementById('dpl-table'));

        //Change columns size
        $('#dpl > #dpl-holder > #dpl-table > colgroup > col:nth-child(3)').attr("width", "33%");
        $('#dpl > #dpl-holder > #dpl-table > colgroup > col:nth-child(4)').attr("width", "33%");
        $('#dpl > #dpl-holder > #dpl-table > colgroup > col:nth-child(6)').attr("width", "25%");
        $('#dpl > #dpl-holder > #dpl-table > thead > tr >  td:nth-child(3)').attr("width", "33%");
        $('#dpl > #dpl-holder > #dpl-table > thead > tr > td:nth-child(4)').attr("width", "33%");
        $('#dpl > #dpl-holder > #dpl-table > thead > tr > td:nth-child(6)').attr("width", "25%");

        //change dpl table header text based on language
        $('#dpl > #dpl-holder > #dpl-table > thead > tr > td:nth-child(6) > pre').text((window.remarksHeader));
        $('#dpl > #dpl-holder > #dpl-table > thead > tr > td:nth-child(5) > pre').text((window.qtyHeader));
        $('#dpl > #dpl-holder > #dpl-table > thead > tr > td:nth-child(4) > pre').text((window.descriptionHeader));
        $('#dpl > #dpl-holder > #dpl-table > thead > tr > td:nth-child(3) > pre').text((window.partNoHeader));
        $('#dpl > #dpl-holder > #dpl-table > thead > tr > td:nth-child(2) > pre').text((window.itemHeader));

        // Display Direction
        const displayDirection = (window.docLanguage === "ar-SA") ? "right" : "left";
        const displayClass = (window.docLanguage === "ar-SA") ? "rtl" : "ltr";
        const displayClassCenter = (window.docLanguage === "ar-SA") ? "rtl-center" : "ltr-center";
        $("td > pre").css({'cssText': 'text-align:' + displayDirection});
        $(".content").css({'cssText': 'text-align:' + displayDirection});
        $("li").addClass(displayClass);
        $("thead > tr > td > pre").addClass(displayClassCenter);
        $("#dpl-table > tbody > tr > td:nth-child(2) > pre,:nth-child(5) > pre").addClass(displayClassCenter);


        if (($(window).width() < 800) && (window.docLanguage === "ar-SA")) {
            $("#TabDiv").css({'cssText': 'margin-right: 10% !important;'});

            $("#MiniDrawerDiv").css({'cssText': 'height: 200% !important;'});

        }

        if (($(window).width() < 800) && (window.docLanguage !== "ar-SA")) {
            $("#TabDiv").css({'cssText': 'margin-left: 10% !important;'});
            $("#MiniDrawerDiv").css({'cssText': 'height: 200% !important;'});
        }

        //Make sure the part no column fit the content
        $("#dpl-table > tbody > tr > td:nth-child(3) > pre").css({'cssText': 'white-space: nowrap; text-align:' + displayDirection});


        //Warning / Safety Remarks
        $('#dpl > #dpl-holder > #dpl-table > tbody > tr').each(function (index, tr) {
            var ixml = Cortona3DSolo.app.ipc.interactivity;
            //Get Row
            var rowelement = $(tr);
            var rowID = $(tr).attr('id');
            var rowInterchange = $('#dpl > #dpl-holder > #dpl-table > tbody > tr#row' + index + ' > td:nth-child(7)');

            if (rowID) {

                //Get Row Index
                var rowIndex = rowID.split("row")[1];
                //console.log(rowID);
                //Get Component Metdata
                var rowData = ixml.getRowByIndex(rowIndex);
                var selectedPartInfo = ixml.getItemInfo(rowData);
                var rowComponentData = selectedPartInfo.metadata["_8D45383FA4614D4EB539FDE4F05B3084"];
                //console.log(rowComponentData);
                if (rowComponentData == -1) {
                    rowelement.addClass("warning-remark");
                } else {
                    // rowelement.removeClass("warning-remark");
                }

                var rowPartNo = selectedPartInfo.part.metadata["_7F38BAE7D4144906A1EC72681DBD0E32"];

                if (rowPartNo) {
                    $(rowInterchange).append("<pre class='interchangeVal'" + index + ">" + rowPartNo + "</pre>");
                } else {
                }
            }
            window.dplRowTotal = window.dplRowTotal + 1;
        });

        // Indent part table
        $('#dpl > #dpl-holder > #dpl-table > tbody > tr').each(function (index, tr) {
            // Cortona3DSolo.app.ipc.interactivity.getItemInfo(1).commands[0].values.Indent;
            var csn = Cortona3DSolo.app.ipc.interactivity.getItemByIndex(index);
            var lineNum = Cortona3DSolo.app.ipc.interactivity.getRowByIndex(index);

            var rowelement = $('#dpl > #dpl-holder > #dpl-table > tbody > tr#row' + index + ' > td:nth-child(4) > *');
            if (lineNum >= 0) {
                var indent = Cortona3DSolo.app.ipc.interactivity.getItemInfo(lineNum).commands[0].values.Indent;
                // rowelement.addClass("indent" + indent);
                // rowelement.text(rowelement.text().replace('•', ''));
                console.log('index-' + index + ' csn-' + csn + ' lineNum-' + lineNum + ' indent-' + indent);
            }
        });

        // Check Drawing exist
        window.tagLastRow = true;
        hidePdfDrawing();
        disable2DBtn();
        // disablePrintBtn();

        if (window.tagLastRow) {
            window.tagLastRow = false;
            window.dplRowTotal = 0;
        }
    },

    // BI 15Jul22: Isolate feature.
    // solve 3d object not isolate. 2 or more row link to the same 3D object
    didChangeItemVisibility: function (isHidden, rowNo) {
        if(!isHidden) {
            window.Cortona3DSolo.app.ipc.toggleItemVisibility(rowNo)
        }
    },
});
Cortona3DSolo.expand(Cortona3DSolo.app, {
    didFinishLoadDocument: function (doc) {

        if (!window.isTCPublish) {
            window.titleData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["TITLE"];
            window.sectionData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_6909F78148EC441F9C885A633128042F"];
            window.docNoData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["TOPIC_ID"];
            window.modelData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_AE0FF824ACAF49E99AC50C8404A2ED97"];
            window.modelYearData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_46CB3D37B61E40B4B945721C1399A139"];
            window.engineData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_9C20F281833A476A874133F435679CBF"];
            window.transmissionData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_012E5F47CFBB4D86B4AE50EF3A1B0706"];
            window.lhdRhdData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_54BC13BF6EE045CBB3C697D494EBA09B"];
            window.bodyData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_00CE3CA4F75C4DB3844BE583D75E6329"];
            window.regionData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_E1EE426BF10F481E875603842A1194F9"];
            window.revisionData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_F5CB2C8BA28A40C98560EFC3EB7A60DD"];
            window.revisionDateData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_5D663E0622A1472891FF6373AE63F50D"];
            window.createdDateData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_E1CD9B386FC44B109121BAC3D3F3D8F6"];
            window.vinToData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_9BF5891E2CA84E5E8A86D3FAD2C98399"];
            window.vinFromData = Cortona3DSolo.app.ipc.interactivity.getProjectMetadata()["_FDC4E19636904C22B22C3C5164282605"];

            // Change date
            if (window.docLanguage == "ar-SA") {
                window.revisionDateData = window.revisionDateData.substr(0, window.revisionDateData.indexOf('T')).replace("-", "/").replace("-", "/");
                window.createdDateData = window.createdDateData.substr(0, window.createdDateData.indexOf('T')).replace("-", "/").replace("-", "/");
            }
        }
        updateBtnProperties();
        window.hideLoading();


        //parts tab
        // waitForEl("#TabDetails", function () {
        if (!window.revisionData) {
            $("#revision-table-row").hide();
        }
        // });

        Cortona3DSolo.app.setDefaultBackgroundColors("#FFFFFF");
        // Cortona3DSolo.app.setHoverColor("#99bcce");
        Cortona3DSolo.app.setHoverColor("#518DAB");
        // Cortona3DSolo.app.setSelectionColor("#eddbb4");
        Cortona3DSolo.app.setSelectionColor("#C9AD6D");
        if (doc.sheets.length) {
            m_select = document.createElement('select');
            m_select.setAttribute('id', "SheetMenu");
            m_select.setAttribute('class', "SelectMenu");
            doc.sheets.forEach(function (sheet, index) {
                var option = document.createElement('option');
                option.setAttribute('value', sheet.id);
                option.setAttribute('key', sheet.id);
                option.appendChild(document.createTextNode(sheet.description));
                m_select.appendChild(option);
            });

            m_select.onchange = function () {
                Cortona3DSolo.app.ipc.setCurrentSheet(this.value, true);
            };

            let selectArray = [];
            $(m_select).children().each(function (i, v) {
                selectArray.push($(this).text());
                window.setSheetMenuTable($(this).text(), $(this).attr('value'));
                window.setSheetMenuOverlay($(this).text(), $(this).attr('value'));
            });

            //document.body.appendChild(m_select);
        }
        // Ignore transparent item
        Cortona3DSolo.app.pickerTransparencyThreshold = 0.2;


        // Print Output
        printOutputHeader();

        //check for language to declare font
        if (window.docLanguage == "ar-SA") {
            document.getElementsByTagName('body')[0].style.fontFamily = "Arial";
            $("#navigation_fly").css({'cssText': 'font-family: Arial !important'});
            $("h1").css({'cssText': 'font-family: Arial !important'});
            $("pre").css({'cssText': 'font-family: Arial !important'});
            $(".tiramisu-proc-item").css({'cssText': 'font-family: Arial !important'});
            $(".ContextMenuItem").css({'cssText': 'font-family: Arial !important'});
        }


        // BI 18Aug22: Login btn and Cart button
        if(window.sessionStorage.getItem("access_token") != null){
            var tokenMsg = window.sessionStorage.getItem("access_token").split(': ')[0]

            console.log('tokenMsg ' +tokenMsg);
            if(tokenMsg == 'Access Token'){
                window.$('#ShoppingCart').show();
                window.$('#LoginPortal').hide();
            } else {
                window.$('#ShoppingCart').hide();
                window.$('#LoginPortal').show();
            }
        } else {
            window.$('#ShoppingCart').hide();
            window.$('#LoginPortal').show();
        }
    },

    firstFrameDidArrive: function () {
        document.body.classList.add('ready');

        // Selected Object on the canvas
        $("canvas").mousedown(function (e) {
            mouseX = e.originalEvent.layerX;
            mouseY = e.originalEvent.layerY;
            pickedObject = Cortona3DSolo.app.pickObject(mouseX, mouseY);
            // Get Clicked part Handle
            if (window.pickedObject && isRotationNeeded) {
                // Set Rotation Center
                Cortona3DSolo.app.setRotationCenterToObjects([window.pickedObject.handle]);
                Cortona3DSolo.app.setRotationCenterToSelectedObjects();
                console.log("Rotation Set")
                // Reset Rotation Needed
                isRotationNeeded = false;
            }
        });

        $(window).resize(function (e) {
            canvasResize();
            updateBtnProperties();
            if (($(window).width() < 800)) {
                $("#MiniDrawerDiv").css({'cssText': 'height: 200% !important;'});
            }

            if (($(window).width() < 800) && (window.docLanguage === "ar-SA")) {
                $("#TabDiv").css({'cssText': 'margin-right: 10% !important;'});
            } else if (($(window).width() > 800) && (window.docLanguage === "ar-SA")) {
                $("#TabDiv").css({'cssText': 'margin-right: unset !important;'});
            } else if (($(window).width() < 800) && (window.docLanguage !== "ar-SA")) {
                $("#TabDiv").css({'cssText': 'margin-left: 10% !important;'});
            } else if (($(window).width() > 800) && (window.docLanguage !== "ar-SA")) {
                $("#TabDiv").css({'cssText': 'margin-left: unset !important;'});
            }

        });


        if (window.displayType !== undefined && window.displayType !== null) {
            if (window.displayType == 0) {
                window.Cortona3DSolo.app.ipc.toggleDrawingDisplayMode(true);
                $('#solo-canvas').attr("style", "display: none !important");
                $('#2DViewBtn').addClass('Mui-selected');
            }
        }

        // Change buttons position dynamically on scroll
        $("#MiniDrawerDiv").scroll(function () {
            var yTransparency = $("#TransparencyBtn").offset().top;
            var yMultiView = $("#MultiViewBtn").offset().top;
            var y3DView = $("#_3dViewBtn").offset().top;
            var yShow2D = $("#2DViewBtn").offset().top;

            $("#showTransparent").css({top: yTransparency});
            $("#showMulti").css({top: yMultiView});
            $("#show3D").css({top: y3DView});
            $("#show2D").css({top: yShow2D});
        });
    }
});


function setTransparencySlider(objectID, objectName) {
    return Cortona3DSolo.app.getObjectsTransparency(objectID);
}

// dpl
Cortona3DSolo.expand(Cortona3DSolo.app.ipc.dpl, {
    didSelectRow: function (index) {
        var csn = Cortona3DSolo.app.ipc.interactivity.getItemByIndex(index);
        console.log(index);
        Cortona3DSolo.app.ipc.selectItem(index);
        Cortona3DSolo.app.ipc.dpl.selectRowAlone(index);
        Cortona3DSolo.app.drawing.selectHotspotAlone(csn);
        // Cortona3DSolo.app.drawing.selectionColor = "#eddbb4";
        Cortona3DSolo.app.drawing.selectionColor = "#C9AD6D";
    },
    didHoverRow: function (index) {
        var csn = Cortona3DSolo.app.ipc.interactivity.getItemByIndex(index);
        Cortona3DSolo.app.ipc.hoverItem(index);
        Cortona3DSolo.app.drawing.hoverHotspot(csn);
        Cortona3DSolo.app.drawing.hoverColor = "#518DAB";
    },
    didSetupTable: function (tableElement) {
        var tableElementObj = $(tableElement);


        tableElementObj.children().each(function (i, v) {
            // if ($(v).prop("tagName").toLowerCase() == "colgroup") {
            // $(v).append("<col width='4%'/>");
            // $(v).children("col:eq(6)").remove();
            //     console.log("col")
            //     console.log(v)
            // }
            //        if ($(v).prop("tagName").toLowerCase() == "thead") {
            //            tableTheadChildRow.append("<td width='4%'><pre></pre></td>");
            //            console.log("thead")
            //            console.log(v)
            //        }
            // $(v).add().children("col:eq(6)").html().addClass('no-display');


            var tableTheadElementObj = $(v);
            var tableTheadChildRow = $(tableTheadElementObj.children());
            // tableTheadChildRow.append("<td width='4%'><pre></pre></td>");
            // tableTheadChildRow.children("td:eq(6)").remove();
        });

    },
    didSetupRow: function (rowElement, index) {
        var ixml = Cortona3DSolo.app.ipc.interactivity;
        // debugVar = rowElement;
        var str = '<td class="no-display"><input type="checkbox" id="chk' + (index) + '" data-index="' + index + '"checked="checked"/></td>';
        var strBtn = (window.docLanguage === "ar-SA") ?
            '<div class="triangleBtnLeft" id="btn' + (index) + '" data-index="' + index + '"/>' : ' <div class="triangleBtnRight" id="btn' + (index) + '" data-index="' + index + '"/>';
        $(rowElement).children("td:eq(0)").html(strBtn);
        $(rowElement).append($(str));
        $('#chk' + (index)).change(function () {
            var currentSelectedRowIndex = parseInt($(this).attr("data-index"));
            Cortona3DSolo.app.ipc.toggleItemVisibility(currentSelectedRowIndex)
        });


        var clickCount = 0;
        $('#btn' + (index)).parent().click(function () {
            if (window.lastElemClicked !== 'btn'.concat(index)) {
                clickCount = 0;
            }
            clickCount++;
            console.log('last item:' + window.lastElemClicked);
            console.log('current item:' + 'btn'.concat(index));

            var currentSelectedRowIndex = parseInt($(this).children('#btn' + (index)).attr("data-index"));


            if (clickCount % 2 == 0) {
                console.log("enter even");
                $('.tr' + index).hide();
                $('#btn' + index).removeClass("transformTriangle transformTriangleInverse");
            } else {
                console.log("enter odd");
                lastClickEl('btn'.concat(index));
                // $('.row-open').hide();
                $('.row-open').remove();
                $('.triangleBtnRight').removeClass("transformTriangle");
                $('.triangleBtnLeft').removeClass("transformTriangleInverse");

                var minQty = $('#row' + index).children("td:eq(4)").text();
                var interchangeValue = $('#row' + index).children("td:eq(6)").text();

                if (interchangeValue) {
                    var content = $('<tr class="tr' + index + ' row-open"><td colspan="2" class="td-accordian hiddenColumn"></td>' +
                        '<td class="td-accordian td-none"><div class="content">' + window.orderQtyLabel + '</div></td><td class="td-accordian td-none">' +
                        '<input class="inputNumber" type="number" min="0" value="' + minQty + '" name="orderQty" id="orderQty_' + index + '"></td>' +
                        '<td colspan="2" class="td-accordian hiddenColumn"></td></tr>' +
                        '<tr class="tr' + index + ' row-open"><td colspan="2" class=" td-accordian hiddenColumn"></td>' +
                        '<td class="td-accordian td-none"><div class="content">' + window.InterchangeableLabel + '</div></td>' +
                        '<td class="interchangeData" id="interchangeable_' + index + '">' + interchangeValue + '</td>' +
                        '<td colspan="2" class=" td-accordian hiddenColumn"></td></tr>' +
                        '<tr class="tr' + index + ' row-open"><td colspan="3" class="td-accordian hiddenColumn"></td>' +
                        '<td class="addCartBtn" id="tdCart_' + index + '"><b><button class="addCartBtn" id="addCart_' + index + '" data-index="' + index + '">' + window.addOrderLabel + '</button></b></td>' +
                        '<td class="hiddenColumn td-accordian exclamationMark"><span id="mark_' + index + '"></span></td><td class="td-accordian hiddenColumn"></td></tr>' +
                        '<tr class="tr' + index + ' row-open"><td colspan="100%" class="td-accordian lastRow"></td></tr>');
                } else {
                    var content = $('<tr class="tr' + index + ' row-open"><td colspan="2" class="td-accordian hiddenColumn"></td>' +
                        '<td class="td-accordian td-none"><div class="content">' + window.orderQtyLabel + '</div></td><td class="td-accordian td-none">' +
                        '<input class="inputNumber" type="number" min="0" value="' + minQty + '" name="orderQty" id="orderQty_' + index + '"></td>' +
                        '<td colspan="2" class="td-accordian hiddenColumn"></td></tr>' +
                        '<tr class="tr' + index + ' row-open"><td colspan="3" class="td-accordian hiddenColumn"></td>' +
                        '<td class="addCartBtn" id="tdCart_' + index + '"><b><button class="addCartBtn" id="addCart_' + index + '" data-index="' + index + '">' + window.addOrderLabel + '</button></b></td>' +
                        '<td class="hiddenColumn td-accordian exclamationMark"><span id="mark_' + index + '"></span></td><td class="td-accordian hiddenColumn"></td></tr>' +
                        '<tr class="tr' + index + ' row-open"><td colspan="100%" class="td-accordian lastRow"></td></tr>');
                }

                $('tr[data-index=' + currentSelectedRowIndex + ']').after(content);
                $('.content').show();
                window.docLanguage === "ar-SA" ? $('#btn' + index).addClass("transformTriangleInverse") : $('#btn' + index).addClass("transformTriangle");


                if (parseInt($("#orderQty_" + index).val()) > parseInt($("#stock_" + index).text())) {
                    // $("#orderQty_" + index).addClass("errorClass");
                    // $('#addCart_' + index).prop( "disabled", true);
                    // $("#addCart_" + index).addClass("disabledClass");
                    // $("#tdCart_" + index).addClass("disabledClass");
                    // $("#mark_" + index).text("!");
                }

                if ($('#stock_' + index).text() == 0) {
                    // $('#orderQty_' + index).prop( "disabled", true);
                    // $('#orderQty_' + index).val("0");
                    // $('#addCart_' + index).prop( "disabled", true);
                    // $('#addCart_' + index).addClass('disabledClass');
                    // $('#tdCart_' + index).addClass('disabledClass');
                    // $("#mark_" + index).text("!");
                } else {
                    // $('#orderQty_' + index).prop( "disabled", false);
                    // $('#addCart_' + index).prop( "disabled", false);
                    // $('#addCart_' + index).removeClass('disabledClass');
                    // $('#tdCart_' + index).removeClass('disabledClass');
                    // $("#mark_" + index).text("");
                }

                $("#orderQty_" + (index)).change(function () {
                    if (parseInt(this.value) > $('#stock_' + index).text()) {
                        // $(this).addClass('errorClass');
                        // $("#mark_" + index).text("!");
                        // $('#addCart_' + index).prop( "disabled", true);
                        // $('#addCart_' + index).addClass('disabledClass');
                        // $('#tdCart_' + index).addClass('disabledClass');
                    } else {
                        // $(this).removeClass('errorClass');
                        // $("#mark_" + index).text("");
                        // $('#addCart_' + index).prop( "disabled", false);
                        // $('#addCart_' + index).removeClass('disabledClass');
                        // $('#tdCart_' + index).removeClass('disabledClass');
                    }
                })

                $('#addCart_' + (index)).click(function () {
                    var currentSelectedRowIndex = parseInt($(this).attr("data-index"));
                    addToRFQ(ixml, currentSelectedRowIndex);//Defined in HTML page
                    $(this).addClass("ordered");
                })

            }

            //change direction for dpl table
            var displayDirection = (window.docLanguage === "ar-SA") ? "right" : "left";
            $(".content").css({'cssText': 'text-align:' + displayDirection});

            function lastClickEl(id) {
                window.lastElemClicked = id;
            }
        });
    },
    didCallContextMenu: function (index, offsetX, offsetY, target) {
        console.log("Call Context Menu")
        console.log(index)
        console.log(offsetX)
        console.log(offsetY)
        var obj = Cortona3DSolo.app.ipc.interactivity.getItemByIndex(index);
        console.log(obj)
        if (obj) {
            var top = $("#dpl-table").offset().top;
            var left = $("#dpl-table").offset().left;
            window.setContextMenuTable(offsetX + left, offsetY + top, obj, index);
        } else {
            Cortona3DSolo.app.restoreObjectProperty(0, Cortona3DSolo.app.PROPERTY_TRANSPARENCY, true);
        }
    },
    // expando
    selectRowAlone: function (index) {
        // if (Cortona3DSolo.app.selectedRow) {
        //     Cortona3DSolo.app.ipc.dpl.selectRow(Cortona3DSolo.app.selectedRow, false);
        // }
        // Cortona3DSolo.app.selectedRow = index;
        // if (index) {
        //     Cortona3DSolo.app.ipc.dpl.selectRow(index);
        // }

        window.$('#dpl-table > tbody > tr').removeClass('selected')
        window.$('#dpl-table > tbody').find('tr#row' +index).addClass('selected')
    }
});

// Drawing
Cortona3DSolo.expand(Cortona3DSolo.app.drawing, {
    // expando
    selectHotspotAlone: function (name) {
        // Cortona3DSolo.app.drawing.selectionColor = "#eddbb4";
        Cortona3DSolo.app.drawing.selectionColor = "#C9AD6D";
        if (this.selectedHotspot) {
            Cortona3DSolo.app.drawing.selectHotspot(this.selectedHotspot, "");
        }
        this.selectedHotspot = name;
        if (name) {
            Cortona3DSolo.app.drawing.selectHotspot(name);
        }
    },

    // hooks
    didHoverHotspot: function (name, hover) {
        var index = hover ? Cortona3DSolo.app.ipc.interactivity.getIndexByItem(name) : -1;
        Cortona3DSolo.app.ipc.hoverItem(index);
        Cortona3DSolo.app.ipc.dpl.hoverRow(index);
        // Cortona3DSolo.app.drawing.hoverColor = "#99bcce";
        Cortona3DSolo.app.drawing.hoverColor = "#518DAB";
    },

    didSelectHotspot: function (name) {
        m_didSelectHotspotInvoked = true;
        var index = Cortona3DSolo.app.ipc.interactivity.getIndexByItem(name);
        Cortona3DSolo.app.ipc.selectItem(index);
        //Select Row Alone
        Cortona3DSolo.app.ipc.dpl.selectRowAlone(index);
        // Select Hotspot Alone
        Cortona3DSolo.app.drawing.selectHotspotAlone(name);
        // Cortona3DSolo.app.drawing.selectionColor = "#eddbb4";
        Cortona3DSolo.app.drawing.selectionColor = "#C9AD6D";
        clickAccordian(index);

    }
});

Cortona3DSolo.app.didCallContextMenu = function (x, y) {
    console.log("Call Context Menu")
    console.log(x)
    console.log(y)
    console.log(hoverIndex)
    var obj = Cortona3DSolo.app.ipc.interactivity.getItemByIndex(hoverIndex);
    console.log(obj)
    if (obj) {
        // Cortona3DSolo.dispatch('app.ipc.didPickObject', obj);
        var top = $("#dpl-table").offset().top;
        var left = $("#dpl-table").offset().left;
        window.setContextMenuTable(x, y, obj, hoverIndex);
    } else {
        Cortona3DSolo.app.restoreObjectProperty(0, Cortona3DSolo.app.PROPERTY_TRANSPARENCY, true);
    }
}

function canvasResize() {
    var width = $("canvas").innerWidth();
    var height = $("canvas").innerHeight();
    Cortona3DSolo.app.resize(width, height);
    console.log("Width: " + width + " Height:" + height)
}

function addToRFQ(ixml, row) {
    var originalRowIndex = ixml.getRowByIndex(row);
    var selectedPartInfo = ixml.getItemInfo(originalRowIndex);
    //console.log(selectedPartInfo);
    console.log(row)
    var quantity = $('#orderQty_' + row.toString()).val();
    var price = $('#price_' + row).text();
    // console.log(price)
    var listOfItems = new Array();
    listOfItems.push({
        "description": selectedPartInfo.part.metadata["DFP"],
        "jobNumber": selectedPartInfo.metadata["ITEM"],
        "part": selectedPartInfo.part.metadata["PNR"],
        "partDescription": selectedPartInfo.part.metadata["DFP"],
        "qty": selectedPartInfo.part.metadata["QNA"],
        "quantity": parseInt(quantity),
        "serialNumber": "",
        "price": parseInt(price),
        "remarks": "Default Remarks"
    });
    console.log(listOfItems);
    try {
        window.addProductWindow(listOfItems[0])
    } catch (e) {
        console.log(e.message);
    }
}

// For Print Output
function printOutputHeader() {
    console.log("print output header")
    // Print Output Header
    $('.Header-Row1').append(window.modelData);
    $('.Header-Row2').append(window.modelYearData + ', ', window.engineData, ', ' + window.transmissionData + ', '
        + window.lhdRhdData + ', ' + window.bodyData);
    $('.Header-Row3').append(window.titleData);

    // Get height and width of canvas
    window.canvasWidth = window.$("canvas").innerWidth();
    window.canvasHeight = window.$("canvas").innerHeight();
}


// Check if there is 2d image in current view
function hasDrawing() {
    var currentSheetId = Cortona3DSolo.app.ipc.getCurrentSheet().id;
    var ipcSvg = Cortona3DSolo.app.ipc.interactivity.getDrawingForIPCView(currentSheetId);
    return ipcSvg;
}

// Hide 2d image section in pdf when there is no 2d
function hidePdfDrawing() {
    var ipcSvg = hasDrawing();
    if (!ipcSvg) {
        $(".image2D").hide();
    } else {
        $(".image2D").show();
    }
}


// Disable show print btn button when 2d image doesn't exist for current view
// function disablePrintBtn(){
//     var ipcSvg = hasDrawing();
//     if(!ipcSvg){
//         $("#PrintBtn").addClass("disabled-button");
//     }else{
//         $("#PrintBtn").removeClass("disabled-button");
//     }
// }

// Disable show 2d button when 2d image doesn't exist for current view
function disable2DBtn() {
    var ipcSvg = hasDrawing();
    if (!ipcSvg || window.displayType == 0) {
        $("#2DViewBtn").addClass("disabled-button");
    } else {
        $("#2DViewBtn").removeClass("disabled-button");
    }
}


//get position of an element
function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {top: _y, left: _x};
}

function updateBtnProperties() {

    var xOffset = $("#MiniDrawerDiv").width();
    var heightBtn = $(".BtnGrp").height();
    var yMultiView = getOffset(document.getElementById('MultiViewBtn')).top;
    var y3DView = getOffset(document.getElementById('_3dViewBtn')).top;
    var yTransparency = getOffset(document.getElementById('TransparencyBtn')).top;
    console.log("y: " + yMultiView);
    console.log("x: " + heightBtn);

    if (window.docLanguage === "ar-SA") {
        console.log("arabic")
        $("#showMulti").css({top: yMultiView, right: xOffset, left: "unset"});
        $("#show3D").css({top: y3DView, right: xOffset, left: "unset"});
        $("#showTransparent").css({top: yTransparency, right: xOffset, left: "unset"});
    } else {
        console.log("other languages")
        $("#showMulti").css({top: yMultiView, left: xOffset});
        $("#show3D").css({top: y3DView, left: xOffset});
        $("#showTransparent").css({top: yTransparency, left: xOffset});
    }

    $("#btnViewMulti").css({height: heightBtn});
    // $("#showTransparent > div").css({height: heightBtn});
}

function clickAccordian(index) {
    try {
        $('.tr' + index).hide();
        var btnId = 'btn'.concat(index);
        $('#' + btnId).click();
    } catch (e) {
        console.log(e)
    }
}




