/**
 * TrimPath Spreadsheet. Release 1.0.14.
 * Copyright (C) 2005 Metaha.
 * 
 * This program is free software; you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed WITHOUT ANY WARRANTY; without even the 
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */
var TrimPath;

(function() { // Using a closure to keep global namespace clean.
    var theMath     = Math;
    var theIsNaN    = isNaN;
    var theParseInt = parseInt;

    if (TrimPath == null)
        TrimPath = new Object();
    if (TrimPath.TEST == null)
        TrimPath.TEST = new Object(); // For exposing to testing only.

    //////////////////////////////////////////////////////////////////////////////
    // This file depends on spreadsheet_engine.js.  It holds all UI related code
    // and dependencies on a DOM/DHTML environment.
    //
    // Coding/design note: we've tried mightily to not hold onto any DOM 
    // objects or nodes as state in our code due to IE's infamous memory leak.  
    // See http://trimpath.com/project/wiki/InelegantJavaScript
    //
    var log = function(msg) {
        if (document != null) {
            var log = document.getElementById("TrimPath_log");
            if (log) {
                log.appendChild(document.createTextNode(msg));
                log.appendChild(document.createElement("BR"));
            }
        }
    }

    var makeEventHandler = function(handler) {
        return function(evt) {
            evt = (evt) ? evt : ((window.event) ? window.event : null);
            if (evt) {
                var target = (evt.target) ? evt.target : evt.srcElement;
                return handler(evt, target);
            }
        }
    }

    var spreadsheet = TrimPath.spreadsheet = {
        ERROR                    : TrimPath.spreadsheetEngine.ERROR,
        DEFAULT_ROW_HEADER_WIDTH : "30px",

        initDocument : function(doc) {
            if (doc == null)
                doc = document;
            var tables = doc.body.getElementsByTagName("TABLE");    
            for (var i = 0; i < tables.length; i++)
                if (isClass(tables[i], "spreadsheet"))
                    spreadsheet.decorateSpreadsheet(tables[i], doc);
        },
        decorateSpreadsheet : function(tableBody, doc) {
            if (doc == null)
                doc = document;
            if (tableBody.id == null ||
                tableBody.id.length <= 0)
                tableBody.id = genId("spreadsheet");

            var filterForFirstColumn = function(node) { // Keeps the first td/th of each tr.
                if (node.nodeType != 1)
                    return true;
                if ((node.tagName == "COL") &&
                    (node.parentNode == tableBody ||           // Mozilla has TABLE.COL structure.
                     node.parentNode.parentNode == tableBody)) // IE has TABLE.COLGROUP.COL structure.
                    return isFirstChild(node);
                if ((node.parentNode.parentNode.parentNode == tableBody) &&
                    (node.tagName == "TD" || node.tagName == "TH"))
                    return isFirstChild(node);
                return true;
            }

            var filterForTHEAD = function(node) { // Keeps thead, col, colgroup, but not tbody and tfoot.
                if (node.nodeType != 1)
                    return true;
                if ((node.parentNode == tableBody) &&
                    (node.tagName == "TBODY" ||
                     node.tagName == "TFOOT"))
                    return false;
                return true;
            }

            // Categorize the parents of tableBody.
            var parents = { spreadsheetEditor : null, spreadsheetScroll : null, spreadsheetBars : null };
            categorizeParents(tableBody, parents);

            with (parents) {
                if (spreadsheetBars != null) {
                    if (spreadsheetBars.id == null ||
                        spreadsheetBars.id.length <= 0)
                        spreadsheetBars.id = tableBody.id + "_spreadsheetBars";

                    // Add row & column headers to tableBody, if not already.
                    if (tableBody.rows[0] != null && 
                        tableBody.rows[0].cells[0] != null &&
                        !isBarItem(tableBody.rows[0].cells[0])) { 
                        // Prepend a new row for column headers.
                        var row = doc.createElement("TR");
                        row.id = tableBody.id + "_spreadsheetBar";
                        for (var cell, i = 0; i < tableBody.rows[0].cells.length + 1; i++) {
                            cell = doc.createElement("TH");
                            cell.className = "spreadsheetBarItem";
                            cell.innerHTML = (i <= 0) ? "&nbsp;" : TrimPath.spreadsheetEngine.columnLabelString(i);
                            row.appendChild(cell);
                        }
                        
                        var thead = tableBody.getElementsByTagName("THEAD")[0];
                        if (thead == null) {
                            thead = doc.createElement("THEAD");
                            tableBody.insertBefore(thead, (tableBody.rows[0] != null ? tableBody.rows[0].parentNode : tableBody.firstChild)); 
                        }
                        thead.insertBefore(row, thead.firstChild); 

                        // Prepend row headers to each row.
                        for (var cell, i = 1; i < tableBody.rows.length; i++) {
                            cell = doc.createElement("TH");
                            cell.className = "spreadsheetBarItem";
                            cell.innerHTML = i;
                            cell = tableBody.rows[i].insertBefore(cell, tableBody.rows[i].cells[0]);
                        }
                        
                        // Prepend one colgroup/col element that covers the new row headers.
                        var cols = tableBody.getElementsByTagName("COL");
                        if (cols != null &&
                            cols.length > 0) {
                            var col = doc.createElement("COL");
                            col.className = "spreadsheetBarItem";
                            col.setAttribute("width", spreadsheet.DEFAULT_ROW_HEADER_WIDTH);
                            cols[0].parentNode.insertBefore(col, cols[0]);
                        }
                    }

                    // Copy a truncated tableBody to be the spreadsheetBarLeft.
                    var spreadsheetBarLeft = doc.getElementById(spreadsheetBars.id + "_spreadsheetBarLeft");
                    if (spreadsheetBarLeft == null) {
                        spreadsheetBarLeft           = copyNodeTree(tableBody, filterForFirstColumn, doc);
                        spreadsheetBarLeft.id        = spreadsheetBars.id + "_spreadsheetBarLeft";
                        spreadsheetBarLeft.className = "spreadsheetBarLeft";
                        spreadsheetBarLeft.width     = "";                          // Let browser calculate smallest width.

                        for (var i = 0; i < tableBody.rows.length; i++)             // Synchronize row heights.
                            spreadsheetBarLeft.rows[i].style.height = tableBody.rows[i].clientHeight;

                        spreadsheetBars.appendChild(spreadsheetBarLeft);
                    }
   
                    for (var i = 1; i < spreadsheetBarLeft.rows.length; i++)
                        spreadsheetBarLeft.rows[i].onmousedown = rowResizer.start;

                    // Copy a truncated tableBody to be the spreadsheetBarTop.
                    var spreadsheetBarTop = doc.getElementById(spreadsheetBars.id + "_spreadsheetBarTop");
                    if (spreadsheetBarTop == null) {
                        spreadsheetBarTop           = copyNodeTree(tableBody, filterForTHEAD, doc);
                        spreadsheetBarTop.id        = spreadsheetBars.id + "_spreadsheetBarTop";
                        spreadsheetBarTop.className = "spreadsheetBarTop";
                        spreadsheetBars.appendChild(spreadsheetBarTop);
                    }

                    for (var cells = spreadsheetBarTop.rows[0].cells, i = 1; i < cells.length; i++)
                        cells[i].onmousedown = columnResizer.start;

                    // Copy a truncated tableBody to be the spreadsheetBarCorner.
                    var spreadsheetBarCorner = doc.getElementById(spreadsheetBars.id + "_spreadsheetBarCorner");
                    if (spreadsheetBarCorner == null) {
                        spreadsheetBarCorner = copyNodeTree(tableBody, 
                            function(node) { return filterForFirstColumn(node) && filterForTHEAD(node); }, 
                            doc);
                        spreadsheetBarCorner.id        = spreadsheetBars.id + "_spreadsheetBarCorner";
                        spreadsheetBarCorner.className = "spreadsheetBarCorner";
                        spreadsheetBarCorner.width     = "";
                        spreadsheetBars.appendChild(spreadsheetBarCorner);
                    }

                    for (var i = 0; i < tableBody.rows.length; i++)             // Hidden so that underlying tableBody bars
                        tableBody.rows[i].cells[0].style.visiblity = "hidden";  // don't show during resizing columns/rows.
                    tableBody.rows[0].style.visibility = "hidden"; 
                }

                if (spreadsheetScroll != null) {
                    if (spreadsheetScroll.id == null ||
                        spreadsheetScroll.id.length <= 0)
                        spreadsheetScroll.id = tableBody.id + "_spreadsheetScroll";
                    spreadsheetScroll.onscroll = spreadsheetScroll.onresize = makeBarAdjustor(tableBody.id);
                    spreadsheetScroll.onscroll();
                }

                if (spreadsheetEditor != null) {
                    if (spreadsheetEditor.id == null ||
                        spreadsheetEditor.id.length <= 0)
                        spreadsheetEditor.id = tableBody.id + "_spreadsheetEditor";

                    // Populate the controls.
                    var controls = doc.getElementById(spreadsheetEditor.id + "_spreadsheetControls");
                    if (controls == null) {
                        controls           = doc.createElement("DIV");
                        controls.id        = spreadsheetEditor.id + "_spreadsheetControls";
                        controls.className = "spreadsheetControls";
                        // Adding as a sibling, because adding as a child of spreadsheetEditor
                        // makes the controls scroll for some reason.
                        spreadsheetEditor.insertBefore(controls, spreadsheetEditor.firstChild);
                    }
                    controls.innerHTML = '<span class="spreadsheetLocation" id="' + controls.id + '_loc"></span>' +
                        '<label class="spreadsheetFormulaLabel" for=' + controls.id + '_formula">fx</label>' +
                        '<input class="spreadsheetFormula" name="' + 
                            controls.id + '_formula" id="' + 
                            controls.id + '_formula" size="50" onkeydown="return TrimPath.spreadsheet.formulaKeyDown(event)"/>' +
                        '<span class="spreadsheetStyle spreadsheetStyleFont">' +
                            '<a href="#fontWeight:bold"  onclick="return TrimPath.spreadsheet.styleToggle(event)"><b>B</b></a>' +
                            '<a href="#fontStyle:italic" onclick="return TrimPath.spreadsheet.styleToggle(event)"><i>I</i></a>' +
                            '<a href="#textDecoration:underline" onclick="return TrimPath.spreadsheet.styleToggle(event)"><span style="text-decoration: underline;">U</span></a>' +
                        '</span>' + 
                        '<span class="spreadsheetStyle spreadsheetStyleAlign">' +
                            '<a href="#textAlign:left"   class="spreadsheetStyleAlignLeft"   onclick="return TrimPath.spreadsheet.styleToggle(event)">&lt;&lt;</a>' +
                            '<a href="#textAlign:center" class="spreadsheetStyleAlignCenter" onclick="return TrimPath.spreadsheet.styleToggle(event)">==</a>' +
                            '<a href="#textAlign:right"  class="spreadsheetStyleAlignRight"  onclick="return TrimPath.spreadsheet.styleToggle(event)">&gt;&gt;</a>' +
                        '</span>';

                    // Register onclick for tableBody td elements.
                    for (var r = 0; r < tableBody.rows.length; r++) {
                        var tr = tableBody.rows[r];                       
                        for (var c = 0; c < tr.cells.length; c++) {
                            var td = tr.cells[c];
                            if (!isBarItem(td)) 
                                td.onclick = cellOnClick;
                        }
                    }
                }
            }

            if (!isClass(tableBody, "spreadsheetCalcOff"))
                TrimPath.spreadsheet.calc(tableBody);
        },
        undecorateSpreadsheet : function(tableBody, doc) {
            if (doc == null)
                doc = document;
            if (tableBody != null &&
                tableBody.id != null) {
                if (doc.getElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarCorner") != null) {
                    for (var ths = tableBody.getElementsByTagName("TH"), i = ths.length - 1; i >= 0; i--)
                        if (isBarItem(ths[i]))
                            ths[i].parentNode.removeChild(ths[i]);
                    var cols = tableBody.getElementsByTagName("COL");
                    cols[0].parentNode.removeChild(cols[0]);
                }
                removeElementById(tableBody.id + "_spreadsheetBar", doc);
                removeElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarTop", doc);
                removeElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarLeft", doc);
                removeElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarCorner", doc);
                removeElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls", doc);
            }
        },
        cellEdit : function(tableBody, row, col, td, labelLocation, inputFormula) { // The row and col are 1-based.
            if (tableBody != null) {                   // This method points the controls to a new cell.
                if (td == null)
                    td = getTd(tableBody, row, col);
                if (td != null) {
                    if (labelLocation == null)
                        labelLocation = document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_loc");
                    if (inputFormula == null)
                        inputFormula = document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_formula");
                    TrimPath.spreadsheet.cellEditDone(tableBody, labelLocation, inputFormula);
                    if (labelLocation != null)
                        labelLocation.innerHTML = TrimPath.spreadsheetEngine.columnLabelString(col) + row;
                    if (inputFormula != null) {
                        var v = td.getAttribute("formula");
                        if (v == null ||
                            v.length <= 0)
                            v = td.innerHTML;
                        inputFormula.value = v;
                        inputFormula.select();
                        inputFormula.focus();
                    }

                    setActive(tableBody, td);
                }
            }
        },
        cellEditDone : function(tableBody, labelLocation, inputFormula, bClearActive) { 
            // Any changes to the input controls are stored back into the table, with a recalc.
            if (labelLocation == null)
                labelLocation = document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_loc");
            if (inputFormula == null)
                inputFormula = document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_formula");
            if (labelLocation != null &&
                inputFormula != null) {
                var loc = TrimPath.spreadsheetEngine.parseLocation(labelLocation.innerHTML);
                if (loc != null) {
                    var td = getTd(tableBody, loc[0], loc[1]);
                    if (td != null) {
                        var recalc = false;
                        var v = inputFormula.value;
                        if (v.length > 0) {
                            if (v.charAt(0) == '=') {
                                if (v != td.getAttribute("formula")) {
                                    recalc = true;
                                    td.innerHTML = "";
                                    td.setAttribute("formula", v);
                                }
                            } else {
                                if (v != td.innerHTML) {
                                    recalc = true;
                                    td.innerHTML = v;
                                    td.removeAttribute("formula");
                                }
                            }
                        } else {
                            if (td.innerHTML.length > 0 ||
                                td.getAttribute("formula") != null) {
                                recalc = true;
                                td.innerHTML = "";
                                td.removeAttribute("formula");
                            }
                        }

                        if (bClearActive != false) // Treats null == true.
                            clearActive(tableBody, td);

                        if (recalc && !isClass(tableBody, "spreadsheetCalcOff"))
                            TrimPath.spreadsheet.calc(tableBody);
                    }
                }
            }
        },
        cellEditAbandon : function(tableBody, labelLocation, inputFormula) { 
            if (labelLocation == null)
                labelLocation = document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_loc");
            if (inputFormula == null)
                inputFormula = document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_formula");
            if (labelLocation != null &&
                inputFormula != null) {
                var loc = TrimPath.spreadsheetEngine.parseLocation(labelLocation.innerHTML);
                if (loc != null)
                    clearActive(tableBody, getTd(tableBody, loc[0], loc[1]));
                labelLocation.innerHTML = "";
                inputFormula.value      = "";
            }
        },
        formulaKeyDown : makeEventHandler(function(evt, inputFormula) {
            var tableBody = document.getElementById(inputFormula.id.split('_')[0]);
            if (tableBody != null) {
                if (evt.keyCode == 27) { // ESC key.
                    TrimPath.spreadsheet.cellEditAbandon(tableBody, null, inputFormula);
                    return false;
                }
                if (evt.keyCode == 13) { // ENTER key.
                    TrimPath.spreadsheet.cellEditDone(tableBody, null, inputFormula, false);
                    return false;
                }
            }
            return true;
        }),
        styleToggle : makeEventHandler(function(evtIgnored, aLink, tableBody, td, action) {
            aLink = getParent(aLink, "A");
            if (tableBody == null) 
                tableBody = document.getElementById(getParent(aLink, "DIV").id.split("_")[0]);
            if (tableBody != null) {
                if (td == null) {
                    var loc = TrimPath.spreadsheetEngine.parseLocation(document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_loc").innerHTML);
                    if (loc != null)
                        td = getTd(tableBody, loc[0], loc[1]);
                }
                if (td != null) {
                    if (action == null) 
                        action = aLink.href.split('#')[1]; // Example: fontWeight:bold.
                    if (action != null &&
                        action.length > 0) {
                        var actionSplit = action.split(':');
                        if (td.style[actionSplit[0]] != actionSplit[1])
                            td.style[actionSplit[0]] = actionSplit[1];
                        else
                            td.style[actionSplit[0]] = "";
                    }
                }
            }
            return false;
        }),
        context : {},
        calc : function(tableBody, fuel) {
            return TrimPath.spreadsheetEngine.calc(new TableCellProvider(tableBody.id), TrimPath.spreadsheet.context, fuel);
        },
        showFormulas : function(tableBody) {
            for (var i = 0; i < tableBody.rows.length; i++) {
                for (var tr = tableBody.rows[i], j = 0; j < tr.cells.length; j++) {
                    var formula = tr.cells[j].getAttribute("formula");
                    if (formula != null &&
                        formula != "")
                        tr.cells[j].innerHTML = formula;
                }
            }
        }
    }

    var cellOnClick = makeEventHandler(function(evtIgnored, target) {
        var td = getParent(target, "TD");
        if (td != null) {
            var loc = getTdLocation(td);
            var tableBody = getParent(td, "TABLE");
            if (tableBody != null && loc != null) {
                var labelLocation = document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_loc");
                var inputFormula  = document.getElementById(tableBody.id + "_spreadsheetEditor_spreadsheetControls_formula");
                if (labelLocation != null &&
                    labelLocation.innerHTML.length > 0 &&
                    inputFormula != null &&
                    inputFormula.value.length > 0 &&
                    inputFormula.value.charAt(0) == '=') {
                    if ("=([:,*/+-".indexOf(inputFormula.value.charAt(inputFormula.value.length - 1)) >= 0) {
                        // Append cell location to currently edited formula based on mouse click.
                        inputFormula.value += TrimPath.spreadsheetEngine.columnLabelString(loc[1]) + loc[0];
                        inputFormula.select(); // TODO: We should actually move the caret to the end.
                        inputFormula.focus();  //       But, don't know how to do that cross-browser yet.
                        return false;
                    }
                }
                TrimPath.spreadsheet.cellEdit(getParent(td, "TABLE"), loc[0], loc[1], td, labelLocation, inputFormula);
            }
        }
    });

    var dragInfo = {};

    var makeBarResizer = function(xyDimension, clientAttr, thIndexGetter, thPreviousGetter, 
                                  barItemsGetter, firstTHGetter, barItemSizeGetter, barItemSizeSetter, 
                                  tableSizeGetter, tableSizeSetter) {
        var barResizer = {
            start : makeEventHandler(function(evt, target) {
                var thEl = getParent(target, "TH");
                if (thEl != null) {
                    var barTable = getParent(thEl, "TABLE");
                    if (barTable != null) {
                        var tableBody = document.getElementById(barTable.id.split("_")[0]);
                        if (tableBody != null) {
                            var scrollOffsetXY = [ 0, 0 ];
                            var spreadsheetScroll = document.getElementById(tableBody.id + "_spreadsheetScroll");
                            if (spreadsheetScroll != null)
                                scrollOffsetXY = [ spreadsheetScroll.scrollLeft, spreadsheetScroll.scrollTop ];

                            var thPageXY, edgeDelta, eventPageXY = findEventPageXY(evt, scrollOffsetXY);
                            while (thEl != null && thIndexGetter(thEl) > 0) {
                                thPageXY = findElementPageXY(thEl);
                                edgeDelta = thPageXY[xyDimension] + thEl[clientAttr] - eventPageXY[xyDimension];
                                if (theMath.abs(edgeDelta) <= 3)
                                    break;
                                thEl = thPreviousGetter(thEl);
                            }
                            if (thEl != null && thIndexGetter(thEl) > 0) {
                                TrimPath.spreadsheet.cellEditDone(tableBody);
                                dragInfo = { barTable       : barTable,                                   // TODO: IE mem leak here?
                                             barItems       : barItemsGetter(barTable),                   // TODO: IE mem leak here?
                                             barPageXY      : findElementPageXY(firstTHGetter(barTable)), // The pageXY of the first non-corner TH.
                                             edgeDelta      : edgeDelta,
                                             startIndex     : thIndexGetter(thEl),
                                             startSizes     : [],
                                             scrollOffsetXY : scrollOffsetXY };
                                for (var i = 0; i < dragInfo.barItems.length; i++) {
                                    dragInfo.startSizes[i] = theParseInt(barItemSizeGetter(dragInfo.barItems[i]));
                                    if (theIsNaN(dragInfo.startSizes[i]))
                                        return;
                                }
                                document.onmousemove = barResizer.drag;
                                document.onmouseup   = barResizer.stop;
                                return false;
                            }
                        }
                    }
                }
            }),
            drag : makeEventHandler(function(evt, target) {
                if (dragInfo.barTable != null) {
                    var newSizes = dragInfo.startSizes.slice(0); // Make a copy.
                    var v = findEventPageXY(evt, dragInfo.scrollOffsetXY)[xyDimension] - dragInfo.barPageXY[xyDimension] + dragInfo.edgeDelta;
                    if (v > 0) {
                        for (var sizeTotal = 0, i = 1; i < dragInfo.startIndex; i++) {
                            if ((sizeTotal + newSizes[i]) > v) 
                                newSizes[i] = theMath.max(v - sizeTotal, 3);           // A non-zero minimum size saves many headaches.
                            sizeTotal += newSizes[i];
                        }
                        newSizes[dragInfo.startIndex] = theMath.max(v - sizeTotal, 3); // A non-zero minimum size saves many headaches.
                    }
                    for (var sizeTotal = 0, i = 1; i < newSizes.length; i++) {
                        sizeTotal += newSizes[i];
                        barItemSizeSetter(dragInfo.barItems[i], newSizes[i] + "px");
                    }
                    tableSizeSetter(dragInfo.barTable, sizeTotal + "px"); 
                    return false;
                }
            }),
            stop : makeEventHandler(function(evt, target) {
                if (dragInfo.barTable != null) {
                    var tableBody = document.getElementById(dragInfo.barTable.id.split("_")[0]);
                    if (tableBody != null) {
                        var redecorate = false;
                        var srcItems = barItemsGetter(dragInfo.barTable);
                        var dstItems = barItemsGetter(tableBody);
                        for (var i = 1; i < srcItems.length && i < dstItems.length; i++) {
                            var size = barItemSizeGetter(srcItems[i]);
                            if (size != barItemSizeGetter(dstItems[i])) {
                                barItemSizeSetter(dstItems[i], size);
                                redecorate = true;
                            }
                        }
                        tableSizeSetter(tableBody, tableSizeGetter(dragInfo.barTable) + "px");

                        if (redecorate) {
                            TrimPath.spreadsheet.undecorateSpreadsheet(tableBody);
                            TrimPath.spreadsheet.decorateSpreadsheet(tableBody);
                        }
                    }
                }
                dragInfo = {};
                document.onmousemove = document.onmouseup = null;
                return false;
            })
        }
        return barResizer;
    }

    var columnResizer = makeBarResizer(0, "clientWidth", 
        function(th) { return th.cellIndex; }, 
        function(th) { return th.parentNode.cells[th.cellIndex - 1]; }, 
        function(barTable) { return barTable.getElementsByTagName("COL"); },
        function(barTable) { return barTable.rows[0].cells[1]; },
        function(barItem)    { return barItem.getAttribute("width"); },
        function(barItem, v) { barItem.setAttribute("width", v); },
        function(barTable)    { return barTable.getAttribute("width"); },
        function(barTable, v) { barTable.setAttribute("width", v); });

    var rowResizer = makeBarResizer(1, "clientHeight", 
        function(th) { return th.parentNode.rowIndex; }, 
        function(th) { return th.parentNode.parentNode.parentNode.rows[th.parentNode.rowIndex - 1].cells[0]; }, 
        function(barTable) { return barTable.rows; },
        function(barTable) { return barTable.rows[1].cells[0]; },
        function(barItem)    { var height = barItem.style.height;
                               return (height != null && height != "") ? height : barItem.clientHeight + "px"; },
        function(barItem, v) { barItem.style.height = v; },
        function(el)    { return -1; },
        function(el, v) { });

    var dumpCoords = function(str, evt, target) {
        var evtPageXY = findEventPageXY(evt, [0, 0]);
        log(str + ": " +target.tagName + ": " + target.className + " evtPageXY: " + evtPageXY[0] + ", " + evtPageXY[1]);
    }

    var findEventPageXY = function(evt, scrollOffsetXY) { 
        if (evt.offsetX || evt.offsetY) {
            var targetPageXY = findElementPageXY((evt.target) ? evt.target : evt.srcElement);
            return [ evt.offsetX + targetPageXY[0], evt.offsetY + targetPageXY[1] ];
        }
        if (scrollOffsetXY == null) // The scrollOffsetXY hack is because Mozilla's pageXY doesn't handle scrolled divs.
            scrollOffsetXY = [0, 0];
        if (evt.pageX || evt.pageY)
            return [ evt.pageX + scrollOffsetXY[0], evt.pageY + scrollOffsetXY[1]];
        return [ evt.clientX + document.body.scrollLeft, evt.clientY + document.body.scrollTop ];
    }

    var findElementPageXY = function(obj) { // From ppk quirksmode.org.
    	var point = [0, 0];
    	if (obj.offsetParent) {
    		while (obj.offsetParent) {
    			point[0] += obj.offsetLeft;
                point[1] += obj.offsetTop;
    			obj = obj.offsetParent;
    		}
    	} else if (obj.x)
    		return [ obj.x, obj.y ];
    	return point;
    }

    var setActive = function(tableBody, td) {
        if (tableBody != null &&
            td != null) {
            td.className += (td.className.length <= 0 ? "spreadsheetCellActive" : " spreadsheetCellActive");
            if (document.getElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarCorner") != null) {
                var barItem = document.getElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarLeft").rows[td.parentNode.rowIndex].cells[0];
                barItem.className += (barItem.className <= 0 ? "spreadsheetBarItemSelected" : " spreadsheetBarItemSelected");
                var barItem = document.getElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarTop").rows[0].cells[td.cellIndex];
                barItem.className += (barItem.className <= 0 ? "spreadsheetBarItemSelected" : " spreadsheetBarItemSelected");
            }
        }
    }

    var clearActive = function(tableBody, td) {
        if (tableBody != null &&
            td != null) {
            td.className = td.className.replace(/\s*spreadsheetCellActive/g, "");
            if (document.getElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarCorner") != null) {
                var barItem = document.getElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarLeft").rows[td.parentNode.rowIndex].cells[0];
                barItem.className = barItem.className.replace(/\s*spreadsheetBarItemSelected/g, "");
                var barItem = document.getElementById(tableBody.id + "_spreadsheetBars_spreadsheetBarTop").rows[0].cells[td.cellIndex];
                barItem.className = barItem.className.replace(/\s*spreadsheetBarItemSelected/g, "");
            }
        }
    }

    var getIndexTr = function(tableBody, row) {          // The row is 1-based.
        if (isBarItem(tableBody.rows[0].cells[0]))
            row++;
        return row - 1;                                  // A indexTr is 0-based.
    }

    var getIndexTd = function(tableBody, indexTr, col) { // The col is 1-based.
        var tr = tableBody.rows[indexTr];                // A indexTr is 0-based.
        if (tr != null &&
            isBarItem(tr.cells[0]))
            col++;
        return col - 1;                                  // A indexTd is 0-based.
    }

    var getTd = function(tableBody, row, col, indexTr, indexTd) { // The row and col are 1-based.
        if (indexTr == null)                                      // The indexTr and indexTd are 0-based.
            indexTr = getIndexTr(tableBody, row);
        var tr = tableBody.rows[indexTr];
        if (tr != null) {
            if (indexTd == null)
                indexTd = getIndexTd(tableBody, indexTr, col);
            return tr.cells[indexTd];
        }
        return null;        
    }

    var getTdLocation = function(td) {
        var col = td.cellIndex + 1;
        if (isBarItem(td.parentNode.cells[0]))
            col--;
        var row = td.parentNode.rowIndex + 1;
        if (isBarItem(getParent(td, "TABLE").rows[0].cells[0]))
            row--;
        return [ row, col ]; // The row and col are 1-based.
    }

    var TableCellProvider = function(tableBodyId) {
        this.tableBodyId = tableBodyId;
        this.cells       = {};
    }

    TableCellProvider.prototype.getCell = function(row, col) {
        if (typeof(col) == "string")
            col = TrimPath.spreadsheetEngine.columnLabelIndex(col);
        var key  = row + "," + col;
        var cell = this.cells[key];
        if (cell == null) {
            var tableBody = document.getElementById(this.tableBodyId);
            if (tableBody != null) {
                var td = getTd(tableBody, row, col);
                if (td != null)
                    cell = this.cells[key] = new TableCell(tableBody, row, col);
            }
        }
        return cell;
    }

    TableCellProvider.prototype.getNumberOfColumns = function(row) {
        var tableBody = document.getElementById(this.tableBodyId);
        if (tableBody != null) {
            var tr = tableBody.rows[getIndexTr(tableBody, row)];
            if (tr != null) {
                if (isBarItem(tr.cells[0]))
                    return tr.cells.length - 1;
                return tr.cells.length;
            }
        }
        return 0;
    }

    TableCellProvider.prototype.toString = function() {
        var tableBody = document.getElementById(this.tableBodyId);
        for (var result = "", i = 0; i < tableBody.rows.length; i++)
            result += tableBody.rows[i].innerHTML.replace(/\n/g, "") + "\n";
        return result;
    }

    var EMPTY_VALUE = {};

    var TableCell = function(tableBody, row, col) {
        this.tableBodyId = tableBody.id;
        this.row = row;
        this.col = col;
        this.indexTr = getIndexTr(tableBody, row);
        this.indexTd = getIndexTd(tableBody, this.indexTr, col);
        this.value = EMPTY_VALUE; // Cache of value, where "real" value is a string in the TD.innerHTML.
    }
    TableCell.prototype = new TrimPath.spreadsheetEngine.Cell();
    TableCell.prototype.getTd = function() { return getTd(document.getElementById(this.tableBodyId), this.row, this.col, this.indexTr, this.indexTd); }

    TableCell.prototype.setValue = function(v, e) { 
        this.error = e; 
        this.value = v;
        this.getTd().innerHTML = (v != null ? v : ""); 
    }
    TableCell.prototype.getValue = function() { 
        var v = this.value;
        if (v === EMPTY_VALUE && this.getFormula() == null) {
            v = this.getTd().innerHTML; 
            v = this.value = (v.length > 0 ? TrimPath.spreadsheetEngine.parseFormulaStatic(v) : null); 
        }
        return (v === EMPTY_VALUE ? null : v);
    }

    TableCell.prototype.getFormat = function()  { return this.getTd().getAttribute("format"); };
    TableCell.prototype.setFormat = function(v) { this.getTd().setAttribute("format", v); };

    TableCell.prototype.getFormulaFunc = function()  { return this.formulaFunc; };
    TableCell.prototype.setFormulaFunc = function(v) { this.formulaFunc = v; };

    TableCell.prototype.getFormula = function()  { return this.getTd().getAttribute("formula"); };
    TableCell.prototype.setFormula = function(v) { 
        if (v != null &&
            v.length > 0) 
            this.getTd().setAttribute("formula", v); 
        else 
            this.getTd().removeAttribute("formula");
    }

    var isBarItem = function(el) {
        return el != null &&
               el.className != null &&
               el.className.search(/(^|\\s)spreadsheetBarItem(\\s|$)/) >= 0;
    }

    var isClass = function(el, className) {
        return el != null &&
               el.className != null &&
               el.className.search('(^|\\s)' + className + '(\\s|$)') >= 0; // TODO: Might want to cache the regexp.
    }

    var copyNodeTree = function(src, filterFunc, nodeFactory) { // Copies ELEMENTS, their attributes, and TEXT nodes.
        if (nodeFactory == null)
            nodeFactory = document;
        var dst = null;
        if (filterFunc == null ||
            filterFunc(src) == true) {
            if (src.nodeType == 1) { // ELEMENT_NODE
                dst = nodeFactory.createElement(src.tagName);
                for (var i = 0; i < src.attributes.length; i++) {
                    var val = src.getAttribute(src.attributes[i].name);
                    if (val != null && 
                        val != "")
                        dst.setAttribute(src.attributes[i].name, val);
                }
                for (var i = 0; i < src.childNodes.length; i++) {
                    var dstChild = copyNodeTree(src.childNodes[i], filterFunc, nodeFactory);
                    if (dstChild != null)
                        dst.appendChild(dstChild);
                }
            } else if (src.nodeType == 3) // TEXT_NODE
                dst = nodeFactory.createTextNode(src.data);
        }
        return dst;
    }

    var isFirstChild = function(node) {
        while (node.previousSibling != null &&
               node.previousSibling.nodeType != 1)
            node = node.previousSibling;
        return node.previousSibling == null;
    }

    var getParent = function(node, tagName) {
        while (node != null && 
               node.tagName != tagName)
            node = node.parentNode;
        return node;
    }

    var categorizeParents = function(node, parentClasses) {
        while (node != null && node != document.documentElement) {
            for (var name in parentClasses)
                if (isClass(node, name)) {
                    parentClasses[name] = node;
                    break;
                }
            node = node.parentNode;
        }
    }

    var removeElementById = function(id, doc) {
        if (doc == null)
            doc = document;
        var el = doc.getElementById(id);
        if (el != null) 
            el.parentNode.removeChild(el);
    }

    var genId = function(prefix) {
        if (prefix == null)
            prefix = "id";
        return prefix + new Date().getTime() + "-" + theMath.floor(theMath.random() * 1000000);
    }

    var makeBarAdjustor = function(tableBodyId) { // Returns an event handler for onscroll and onresize.
        var spreadsheetScrollId = tableBodyId + "_spreadsheetScroll";
        return function() { // The evt is ignored.
            var spreadsheetScroll = document.getElementById(spreadsheetScrollId);
            if (spreadsheetScroll != null) {
                var spreadsheetBarCorner = document.getElementById(tableBodyId + "_spreadsheetBars_spreadsheetBarCorner");
                var spreadsheetBarLeft   = document.getElementById(tableBodyId + "_spreadsheetBars_spreadsheetBarLeft");
                var spreadsheetBarTop    = document.getElementById(tableBodyId + "_spreadsheetBars_spreadsheetBarTop");

                if (spreadsheetBarTop != null)
                    spreadsheetBarTop.style.top = spreadsheetScroll.scrollTop;
                if (spreadsheetBarLeft != null)
                    spreadsheetBarLeft.style.left = spreadsheetScroll.scrollLeft;
                if (spreadsheetBarCorner != null) {
                    spreadsheetBarCorner.style.top  = spreadsheetScroll.scrollTop;
                    spreadsheetBarCorner.style.left = spreadsheetScroll.scrollLeft;
                }
            }
        }
    }

    TrimPath.spreadsheet.toCompactSource = function(node) {
        var result = "";
        if (node.nodeType == 1) { // ELEMENT_NODE
            if ((node.id != null        && node.id.indexOf("spreadsheetBar") >= 0) ||
                (node.className != null && node.className.indexOf("spreadsheetBar") >= 0))
                return "";
            result += "<" + node.tagName;
            for (var i = 0, hasClass = false; i < node.attributes.length; i++) {
                var key = node.attributes[i].name;
                var val = node.getAttribute(key);
                if (val != null && 
                    val != "") {
                    if (key == "contentEditable" && val == "inherit")
                        continue; // IE hack.
                    if (key == "class") {
                        hasClass = true;
                        val = val.replace("spreadsheetCellActive", "");
                    }
                    if (typeof(val) == "string")
                        result += " " + key + '="' + val.replace(/"/g, "'") + '"';
                    else if (key == "style" && val.cssText != "")
                        result += ' style="' + val.cssText + '"';
                }
            }
            if (node.tagName == "TABLE" && !hasClass) // IE hack, where class doesn't appear in attributes.
                result += ' class="spreadsheet"';
            if (node.tagName == "COL")                // IE hack, which doesn't like <COL..></COL>.
                result += '/>';
            else {
                result += ">";
                var childResult = "";
                for (var i = 0; i < node.childNodes.length; i++)
                    childResult += TrimPath.spreadsheet.toCompactSource(node.childNodes[i]);
                result += childResult;
                result += "</" + node.tagName + ">";
            }
        } else if (node.nodeType == 3) // TEXT_NODE
            result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
        return result;
    }

    TrimPath.spreadsheet.toPrettySource = function(node, prefix) {
        if (prefix == null)
            prefix = "";
        var result = "";
        if (node.nodeType == 1) { // ELEMENT_NODE
            if ((node.id != null        && node.id.indexOf("spreadsheetBar") >= 0) ||
                (node.className != null && node.className.indexOf("spreadsheetBar") >= 0))
                return "";
            result += "\n" + prefix + "<" + node.tagName;
            for (var i = 0; i < node.attributes.length; i++) {
                var key = node.attributes[i].name;
                var val = node.getAttribute(key);
                if (val != null && 
                    val != "") {
                    if (key == "contentEditable" && val == "inherit")
                        continue; // IE hack.
                    if (typeof(val) == "string")
                        result += " " + key + '="' + val.replace(/"/g, "'") + '"';
                    else if (key == "style" && val.cssText != "")
                        result += ' style="' + val.cssText + '"';
                }
            }
            if (node.childNodes.length <= 0)
                result += "/>";
            else {
                result += ">";
                var childResult = "";
                for (var i = 0; i < node.childNodes.length; i++)
                    childResult += TrimPath.spreadsheet.toPrettySource(node.childNodes[i], prefix + "  ");
                result += childResult;
                if (childResult.indexOf('\n') >= 0)
                    result += "\n" + prefix;
                result += "</" + node.tagName + ">";
            }
        } else if (node.nodeType == 3) // TEXT_NODE
            result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
        return result;
    }
}) ();
