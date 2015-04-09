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

(function(safeEval) { // Using a closure to keep global namespace clean.
    var theNumber     = Number;
    var theParseInt   = parseInt;
    var theParseFloat = parseFloat;
    var theIsNaN      = isNaN;

    if (TrimPath == null)
        TrimPath = new Object();
    if (TrimPath.TEST == null)
        TrimPath.TEST = new Object(); // For exposing to testing only.

    //////////////////////////////////////////////////////////////////////////////
    // The spreadsheetEngine should be DOM/DHTML independent, handling only
    // formula recalculations only, not UI.
    //
    var eng = TrimPath.spreadsheetEngine = {
        ERROR : new String("#VALUE!"),
        standardFunctions : {
            AVERAGE : function(values) { return eng.standardFunctions.SUM(values) / eng.standardFunctions.COUNT(values); },
            COUNT : function(values) { return fold(values, COUNT2, 0); },
            SUM : function(values) { return fold(values, SUM2, 0); },
            MAX : function(values) { return fold(values, MAX2, theNumber.MIN_VALUE); },
            MIN : function(values) { return fold(values, MIN2, theNumber.MAX_VALUE); }
        },
        calc : function(cellProvider, context, startFuel) {
            // Returns null if all done with a complete calc() run.
            // Else, returns a non-null continuation function if we ran out of fuel.  
            // The continuation function can then be later invoked with more fuel value.
            // The fuelStart is either null (which forces a complete calc() to the finish) 
            // or is an integer > 0 to slice up long calc() runs.  A fuelStart number
            // is roughly matches the number of cells to visit per calc() run.
            var calcState = { 
                cellProvider : cellProvider, 
                context      : (context != null ? context : {}),
                row          : 1, 
                col          : 1, 
                done         : false,
                stack        : [],
                calcMore : function(moreFuel) {
                    calcState.fuel = moreFuel;
                    return calcLoop(calcState);
                }
            };
            return calcState.calcMore(startFuel);
        },
        rewriteMovedFormulas : function(cells, atRow, atCol, deltaRows, deltaCols) { // TODO.
        },
        Cell : function() {} // Prototype setup is later.
    }

    var calcLoop = function(calcState) {
        with (calcState) {
            if (done == true)
                return null;
            while (fuel == null || fuel > 0) {
                if (stack.length > 0) {
                    var workFunc = stack.pop();
                    if (workFunc != null)
                        workFunc(calcState);
                } else {
                    if (visitCell(calcState, row, col) == true) {
                        done = true;
                        return null;
                    }
    
                    if (col >= cellProvider.getNumberOfColumns(row)) {
                        row = row + 1;
                        col = 1;
                    } else
                        col = col + 1; // Sweep through columns first.
                }
                
                if (fuel != null)
                    fuel -= 1;
            }
        }
        return calcState.calcMore;
    }

    var visitCell = function(calcState, r, c) { // Returns true if done with all cells.
        with (calcState) {
            var cell = cellProvider.getCell(r, c);
            if (cell == null)
                return true;

            var value = cell.getValue();
            if (value == null) {
                var formula = cell.getFormula();
                if (formula != null) {
                    var firstChar = formula.charAt(0);
                    if (firstChar == '=') {
                        var formulaFunc = cell.getFormulaFunc();
                        if (formulaFunc == null ||
                            formulaFunc.formula != formula) {
                            formulaFunc = null;
                            try {
                                var dependencies = {};
                                var body = parseFormula(formula.substring(1), dependencies);
                                formulaFunc = safeEval("var TrimPath_spreadsheet_formula = " +
                                    "function(__CELL_PROVIDER, __CONTEXT, __STD_FUNCS) { " +
                                      "with (__CELL_PROVIDER) { with (__STD_FUNCS) { " +
                                      "with (__CONTEXT) { return (" + body + "); } } } }; TrimPath_spreadsheet_formula");
                                formulaFunc.formula      = formula;
                                formulaFunc.dependencies = dependencies;
                                cell.setFormulaFunc(formulaFunc);
                            } catch (e) {
                                cell.setValue(eng.ERROR, e);
                            }
                        }
                        if (formulaFunc != null) {
                            stack.push(makeFormulaEval(r, c));

                            // Push the cell's dependencies, first checking for any cycles. 
                            var dependencies = formulaFunc.dependencies;
                            for (var k in dependencies) {
                                if (checkCycles(stack, dependencies[k][0], dependencies[k][1]) == true) {
                                    cell.setValue(eng.ERROR, "cycle detected");
                                    stack.pop();
                                    return false;
                                }
                            }
                            for (var k in dependencies)
                                stack.push(makeCellVisit(dependencies[k][0], dependencies[k][1]));
                        }
                    } else
                        cell.setValue(parseFormulaStatic(formula));
                }
            }
        }
        return false;
    }

    var makeCellVisit = function(row, col) {
        var func = function(calcState) { return visitCell(calcState, row, col); };
        func.row = row;
        func.col = col;
        return func;
    }

    var makeFormulaEval = function(row, col) {
        var func = function(calcState) {
            var cell = calcState.cellProvider.getCell(row, col);
            if (cell != null) {
                var formulaFunc = cell.getFormulaFunc();
                if (formulaFunc != null) {
                    try {
                        cell.setValue(formulaFunc(calcState.cellProvider, calcState.context, eng.standardFunctions));
                    } catch (e) {
                        cell.setValue(eng.ERROR, e);
                    }
                }
            }
        }
        func.row = row;
        func.col = col;
        return func;
    }

    // Parse formula (without "=" prefix) like "123+SUM(A1:A6)/D5" into JavaScript expression string.
    var parseFormula = TrimPath.TEST.parseFormula = function(formula, dependencies) { 
        var arrayReferencesFixed = formula.replace(/\$?([A-Z]+)\$?([0-9]+):\$?([A-Z]+)\$?([0-9]+)/g,
            function(ignored, startColStr, startRowStr, endColStr, endRowStr) {
                var res = [];
                var startCol = columnLabelIndex(startColStr);
                var startRow = theParseInt(startRowStr);
                var endCol   = columnLabelIndex(endColStr);
                var endRow   = theParseInt(endRowStr);
                for (var r = startRow; r <= endRow; r++)
                    for (var c = startCol; c <= endCol; c++)
                        res.push(columnLabelString(c) + r);
                return "[" + res.join(",") + "]";
            }
        );
        var result = arrayReferencesFixed.replace(/\$?([A-Z]+)\$?([0-9]+)/g, 
            function(ignored, colStr, rowStr) {
                if (dependencies != null) 
                    dependencies[colStr + rowStr] = [theParseInt(rowStr), columnLabelIndex(colStr)]; 
                return "(getCell((" + rowStr + "),'" + colStr + "').getValue())";
            }
        );
        return result;
    }

    // Parse static formula value like "123.0" or "hello" or "'hello world" into JavaScript value.
    var parseFormulaStatic = eng.parseFormulaStatic = function(formula) { 
        var value = theParseFloat(formula);
        if (theIsNaN(value))
            value = theParseInt(formula);
        if (theIsNaN(value))
            value = (formula.charAt(0) == "'" ? formula.substring(1) : formula);
        return value;
    }

    var checkCycles = function(stack, row, col) {
        for (var i = 0; i < stack.length; i++) {
            var item = stack[i];
            if (item.row != null && item.col != null &&
                item.row == row  && item.col == col)
                return true;
        }
        return false;
    }

    var fold = function(arr, funcOfTwoArgs, result) {
        for (var i = 0; i < arr.length; i++)
            result = funcOfTwoArgs(result, arr[i]);
        return result;
    }

    var SUM2   = function(x, y) { return x + y; }
    var MAX2   = function(x, y) { return x > y ? x : y; }
    var MIN2   = function(x, y) { return x < y ? x : y; }
    var COUNT2 = function(x, y) { return (y != null) ? x + 1 : x; }

    // Cells don't know their coordinates, to make shifting easier.
    //
    eng.Cell.prototype.getError = function()     { return this.error; };
    eng.Cell.prototype.getValue = function()     { return this.value; };
    eng.Cell.prototype.setValue = function(v, e) { this.value = v; this.error = e; };

    eng.Cell.prototype.getFormat      = function()  { return this.format; };      // Like "#,###.##".  The format != style.
    eng.Cell.prototype.setFormat      = function(v) { this.format = v; };
    eng.Cell.prototype.getFormula     = function()  { return this.formula; };     // Like "=1+2+3" or "'hello" or "1234.5"
    eng.Cell.prototype.setFormula     = function(v) { this.formula = v; };
    eng.Cell.prototype.getFormulaFunc = function()  { return this.formulaFunc; };
    eng.Cell.prototype.setFormulaFunc = function(v) { this.formulaFunc = v; };

    eng.Cell.prototype.toString = function() { return "Cell:[" + this.getFormula() + ": " + this.getValue() + ": " + this.getError() + "]"; }

    var columnLabelString = eng.columnLabelString = function(index) {
        // The index is 1 based.  Convert 1 to A, 2 to B, 25 to Y, 26 to Z, 27 to AA, 28 to AB.
        // TODO: Got a bug when index > 676.  675==YZ.  676==YZ.  677== AAA, which skips ZA series.
        //       In the spirit of billg, who needs more than 676 columns anyways?
        var b = (index - 1).toString(26).toUpperCase();   // Radix is 26.
        var c = [];
        for (var i = 0; i < b.length; i++) {
            var x = b.charCodeAt(i);
            if (i <= 0 && b.length > 1)                   // Leftmost digit is special, where 1 is A.
                x = x - 1;
            if (x <= 57)                                  // x <= '9'.
                c.push(String.fromCharCode(x - 48 + 65)); // x - '0' + 'A'.
            else
                c.push(String.fromCharCode(x + 10));
        }
        return c.join("");
    }

    var columnLabelIndex = eng.columnLabelIndex = function(str) {
        // Converts A to 1, B to 2, Z to 26, AA to 27.
        var num = 0;
        for (var i = 0; i < str.length; i++) {
            var digit = str.charCodeAt(i) - 65 + 1;       // 65 == 'A'.
            num = (num * 26) + digit;
        }
        return num;
    }

    var parseLocation = eng.parseLocation = function(locStr) { // With input of "A1", "B4", "F20",
        if (locStr != null &&                                  // will return [1,1], [4,2], [20,6].
            locStr.length > 0) {
            for (var firstNum = 0; firstNum < locStr.length; firstNum++)
                if (locStr.charCodeAt(firstNum) <= 57) // 57 == '9'
                    break;
            return [ theParseInt(locStr.substring(firstNum)),
                     columnLabelIndex(locStr.substring(0, firstNum)) ];
        }
        return null;
    }
}) (function(str) { return eval(str); }); // The safeEval occurs only in outer, global scope.
