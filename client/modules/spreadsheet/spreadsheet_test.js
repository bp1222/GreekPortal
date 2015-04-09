function testSpreadsheet1() {
    assertEquals("2 times 3 plus 5 is 11", 11, 2*3 + 5);
    
    assertNotNull(TrimPath);
    assertNotNull(TrimPath.spreadsheetEngine);
    assertNotNull(TrimPath.spreadsheetEngine.recalc);
    assertNotNull(TrimPath.spreadsheet);
    assertNotNull(TrimPath.spreadsheet.initDocument);
    assertNotNull(TrimPath.spreadsheet.initDocumentTable);

    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(1), "A");
    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(26), "Z");
    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(26 + 1), "AA");
    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(26 + 2), "AB");
    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(26 + 26), "AZ");
    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(26 * 2 + 1), "BA");
    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(26 * 2 + 2), "BB");
    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(26 * 2 + 3), "BC");
    assertEquals(TrimPath.spreadsheetEngine.columnLabelString(26 * 2 + 26), "BZ");

    for (var i = 1; i <= 676; i++) {
        var str = TrimPath.spreadsheetEngine.columnLabelString(i);
        var ind = TrimPath.spreadsheetEngine.columnLabelIndex(str);
        assertEquals(i + ": " + str + " " + ind, i, ind);
    }

    assertEquals(TrimPath.spreadsheetEngine.standardFunctions.SUM([1,2,3,4,5,6]), 21);
    assertEquals(TrimPath.spreadsheetEngine.standardFunctions.AVERAGE([1,2,3,4,5,6]), 21/6);
    assertEquals(TrimPath.spreadsheetEngine.standardFunctions.COUNT([1,2,3,4,5,6]), 6);
    assertEquals(TrimPath.spreadsheetEngine.standardFunctions.MAX([1,2,3,4,5,6, -1]), 6);
    assertEquals(TrimPath.spreadsheetEngine.standardFunctions.MIN([1,2,3,4,5,6, -1]), -1);
    assertEquals(TrimPath.spreadsheetEngine.standardFunctions.SUM([1,2,3,4,null,5,6]), 21);
    assertEquals(TrimPath.spreadsheetEngine.standardFunctions.AVERAGE([1,2,3,4,null,5,6]), 21/6);
    assertEquals(TrimPath.spreadsheetEngine.standardFunctions.COUNT([1,2,3,4,null,5,6]), 6);

    assertEquals(TrimPath.spreadsheetEngine.parseFormulaStatic("123.0"), 123.0);
    assertEquals(TrimPath.spreadsheetEngine.parseFormulaStatic("123"), 123);
    assertEquals(TrimPath.spreadsheetEngine.parseFormulaStatic("-123.0"), -123.0);
    assertEquals(TrimPath.spreadsheetEngine.parseFormulaStatic("-123"), -123);
    assertEquals(TrimPath.spreadsheetEngine.parseFormulaStatic("0.0"), 0);
    assertEquals(TrimPath.spreadsheetEngine.parseFormulaStatic("hello"), "hello");
    assertEquals(TrimPath.spreadsheetEngine.parseFormulaStatic("hello world"), "hello world");
    assertEquals(TrimPath.spreadsheetEngine.parseFormulaStatic("'hello world"), "hello world");

    var x, dependencies;
    dependencies = {};
    assertEquals(x = TrimPath.TEST.parseFormula("A1", dependencies), "(getCell((1),'A').getValue())");
    assertNotNull(dependencies["1,1"]);
    assertTrue(dependencies["1,2"] == null);
    dependencies = {};
    assertEquals(x = TrimPath.TEST.parseFormula("B2", dependencies), "(getCell((2),'B').getValue())");
    assertTrue(dependencies["1,1"] == null);
    assertNotNull(dependencies["1,2"]);
    dependencies = {};
    assertEquals(x = TrimPath.TEST.parseFormula("A1+B2", dependencies), "(getCell((1),'A').getValue())+(getCell((2),'B').getValue())");
    assertNotNull(dependencies["1,1"]);
    assertNotNull(dependencies["2,2"]);
    assertTrue(dependencies["1,2"] == null);

    dependencies = {};
    assertEquals(x = TrimPath.TEST.parseFormula("A1:A3", dependencies), "[(getCell((1),'A').getValue()),(getCell((2),'A').getValue()),(getCell((3),'A').getValue())]");
    dependencies = {};
    assertEquals(x = TrimPath.TEST.parseFormula("A1:B1", dependencies), "[(getCell((1),'A').getValue()),(getCell((1),'B').getValue())]");
    dependencies = {};
    assertEquals(x = TrimPath.TEST.parseFormula("A1:B2", dependencies), "[(getCell((1),'A').getValue()),(getCell((1),'B').getValue())," +
                                                       "(getCell((2),'A').getValue()),(getCell((2),'B').getValue())]");

    var TestCell = function(row, col, formula) {
        this.row = row; this.col = col; this.formula = formula;
    }
    TestCell.prototype = new TrimPath.spreadsheetEngine.Cell();
    assertNotNull(TestCell.prototype);
    assertTrue(TestCell.prototype instanceof TrimPath.spreadsheetEngine.Cell);
    assertTrue("getError", TestCell.prototype.getError instanceof Function);
    assertTrue("getValue", TestCell.prototype.getValue instanceof Function);
    assertTrue("setValue", TestCell.prototype.setValue instanceof Function);
    assertTrue("getFormulaFunc", TestCell.prototype.getFormulaFunc instanceof Function);
    assertTrue("setFormulaFunc", TestCell.prototype.setFormulaFunc instanceof Function);
    assertTrue("getFormula", TestCell.prototype.getFormula instanceof Function);
    assertTrue("setFormula", TestCell.prototype.setFormula instanceof Function);

    var TestCellProvider = function(cells) {
        for (var r in cells) {
            var cols = cells[r];
            for (var c in cols) {
                cols[c] = new TestCell(r, c, cols[c]);
                assertTrue("super is Cell", cols[c] instanceof TrimPath.spreadsheetEngine.Cell);
                // debug("cols[c].getValue: " + typeof(cols[c].getValue));
                // debug("cols[c].getFormula: " + typeof(cols[c].getFormula));
            }
        }
        this.getCell = function(row, col) {
            // debug("getCell: " + row + ", " + col);
            if (typeof(col) == "string")
                col = TrimPath.spreadsheetEngine.columnLabelIndex(col);
            var cols = cells[row - 1];
            if (cols == null)
                return null;
            return cols[col - 1];
        }
        this.getNumberOfColumns = function(row) {
            if (row == null)
                row = 1;
            var cols = cells[row - 1];
            if (cols == null)
                return 0;
            return cols.length;
        }
        this.toString = function() {
            return this.emit("toString");
        }
        this.emit = function(funcName) {
            if (funcName == null)
                funcName = "getValue"
            var out = [];
            for (var r = 0; r < cells.length; r++) {
                out.push("[" + (r+1) + ": ");
                var cols = cells[r];
                for (var c = 0; c < cols.length; c++) {
                    out.push("(" + (c+1) + ": ");
                    if (cols[c] != null)
                        out.push(cols[c][funcName]());
                    out.push(" ), ");
                }
                out.push(" ], \n");
            }
            return out.join("");
        }
    }

    var cp = new TestCellProvider([ [ "=1+2",   "123", ],
                                    [ "hello",  "'hello world" ],
                                    [ "",       null ] 
                                  ]);
    function checkEdges(cp) {
        assertEquals(cp.getNumberOfColumns(),  2);
        assertEquals(cp.getNumberOfColumns(0), 0);
        assertEquals(cp.getNumberOfColumns(1), 2);
        assertEquals(cp.getNumberOfColumns(2), 2);
        assertEquals(cp.getNumberOfColumns(3), 2);
        assertEquals(cp.getNumberOfColumns(4), 0);
        assertNotNull(cp.getCell(1,1)); assertNotNull(cp.getCell(1,2)); assertTrue(cp.getCell(1,3) == null);
        assertNotNull(cp.getCell(3,1)); assertNotNull(cp.getCell(3,2)); assertTrue(cp.getCell(3,3) == null);
        assertTrue(cp.getCell(4,1) == null);
        debug("checked edges");
    }
    checkEdges(cp);

    function forAllCells(cp, func) {
        var r = 1, c = 1;
        while (true) {
            var cell = cp.getCell(r,c);
            if (cell == null)
                return;
            func(r, c, cell);
            if (c >= cp.getNumberOfColumns(r)) {
                c = 1;
                r++;           
            } else
                c++;
        }
    }
    function assertValuesCleared(cp) {
        forAllCells(cp, function(r, c, cell) { assertTrue("assertValuesCleared: " + r + ", " + c, cell.getValue() == null); });
    }
    assertValuesCleared(cp);

    var result = TrimPath.spreadsheetEngine.calc(cp);
    assertNull(result);
    assertTrue(cp.getCell(1,1).getValue() == 3);
    assertTrue(cp.getCell(1,2).getValue() == 123);
    assertTrue(cp.getCell(2,1).getValue() == "hello");
    assertTrue(cp.getCell(2,2).getValue() == "hello world");
    assertTrue(cp.getCell(3,1).getValue() == "");
    assertTrue(cp.getCell(3,2).getValue() == null);

    debug(cp.toString());

    //////////////////////////////////////////////

    function clearValues(cp) {
        forAllCells(cp, function(r, c, cell) { cell.setValue(null, null); });
    }
    clearValues(cp);
    assertValuesCleared(cp);
    
    var i = 1;
    var calcCont = TrimPath.spreadsheetEngine.calc(cp, null, 2);
    while (calcCont != null) {
        debug("calcCont: " + i);
        calcCont = calcCont(2);
        i++;
    }
    assertTrue("calcCont", i > 2);
    assertTrue(cp.getCell(1,1).getValue() == 3);
    debug("calcCont.done: " + i);

    clearValues(cp);
    assertValuesCleared(cp);
    
    var i = 1;
    var calcCont = TrimPath.spreadsheetEngine.calc(cp, null, 4);
    while (calcCont != null) {
        debug("calcCont: " + i);
        calcCont = calcCont(4);
        i++;
    }
    assertTrue("calcCont", i > 1);
    assertTrue(cp.getCell(1,1).getValue() == 3);
    debug("calcCont.done: " + i);

    debug(cp.toString());

    //////////////////////////////////////////////

    clearValues(cp);
    cp.getCell(2,1).setFormula("=getCell(1,2).getValue()");
    TrimPath.spreadsheetEngine.calc(cp);
    debug(cp.toString());
    assertEquals(cp.getCell(1,2).getValue(), cp.getCell(2,1).getValue());
    assertTrue(cp.getCell(1,1).getValue() == 3);

    clearValues(cp);
    cp.getCell(2,1).setFormula("=A1+B1");
    cp.getCell(3,1).setFormula("=SUM(A1:B1)");
    TrimPath.spreadsheetEngine.calc(cp);
    debug(cp.toString());
    assertEquals(cp.getCell(1,1).getValue() + cp.getCell(1,2).getValue(), cp.getCell(2,1).getValue());
    assertEquals(cp.getCell(1,1).getValue() + cp.getCell(1,2).getValue(), cp.getCell(3,1).getValue());
    assertEquals(cp.getCell(1,1).getFormula(), x = cp.getCell(1,1).getFormulaFunc().formula);
    debug(x);
    assertEquals(cp.getCell(3,1).getFormula(), x = cp.getCell(3,1).getFormulaFunc().formula);
    debug(x);

    x = cp.getCell(3,1).getValue();
    cp.getCell(3,1).setFormula("=AVERAGE(A1:B1)");
    cp.getCell(3,1).setValue(null, null);
    TrimPath.spreadsheetEngine.calc(cp);
    debug(cp);
    assertTrue(x != cp.getCell(3,1).getValue());
    assertEquals((cp.getCell(1,1).getValue() + cp.getCell(1,2).getValue()) / 2, cp.getCell(3,1).getValue());

    x = cp.getCell(3,1).getValue();
    cp.getCell(3,1).setFormula("=MAX(A1:B1)");
    cp.getCell(3,1).setValue(null, null);
    TrimPath.spreadsheetEngine.calc(cp);
    debug(cp);
    assertTrue(x != cp.getCell(3,1).getValue());
    assertEquals(cp.getCell(1,2).getValue(), cp.getCell(3,1).getValue());

    x = cp.getCell(3,1).getValue();
    cp.getCell(3,1).setFormula("=MIN(A1:B1)");
    cp.getCell(3,1).setValue(null, null);
    TrimPath.spreadsheetEngine.calc(cp);
    debug(cp);
    assertTrue(x != cp.getCell(3,1).getValue());
    assertEquals(cp.getCell(1,1).getValue(), cp.getCell(3,1).getValue());

    // Testing forward references.
    var cp2 = new TestCellProvider([ [ "=A2+1",  "" ], 
                                     [ "=A3+10", "" ],
                                     [ "=B3",    "100" ] 
                                   ]);
    TrimPath.spreadsheetEngine.calc(cp2);
    debug(cp2);
    assertEquals(cp2.getCell(1,1).getValue(), 111);

    // Testing cyclic references.
    var cp2 = new TestCellProvider([ [ "=A2+1",  "cycle at B3" ], 
                                     [ "=A3+10", "" ],
                                     [ "=B3",    "=A1" ] 
                                   ]);
    TrimPath.spreadsheetEngine.calc(cp2);
    debug(cp2);
    assertTrue(cp2.getCell(1,1).getValue().indexOf(TrimPath.spreadsheetEngine.ERROR) >= 0);
    assertTrue(cp2.getCell(2,1).getValue().indexOf(TrimPath.spreadsheetEngine.ERROR) >= 0);
    assertTrue(cp2.getCell(3,1).getValue().indexOf(TrimPath.spreadsheetEngine.ERROR) >= 0);
    assertTrue(cp2.getCell(3,2).getValue().indexOf(TrimPath.spreadsheetEngine.ERROR) >= 0);

    var cp2 = new TestCellProvider([ [ "a1",  "b1" ], 
                                     [ "=A2+A1", "" ],
                                   ]);
    TrimPath.spreadsheetEngine.calc(cp2);
    debug(cp2);
    assertTrue(cp2.getCell(1,1).getValue().indexOf(TrimPath.spreadsheetEngine.ERROR) < 0);
    assertTrue(cp2.getCell(1,2).getValue().indexOf(TrimPath.spreadsheetEngine.ERROR) < 0);
    assertTrue(cp2.getCell(2,1).getValue().indexOf(TrimPath.spreadsheetEngine.ERROR) >= 0);
    assertTrue(cp2.getCell(2,2).getValue().indexOf(TrimPath.spreadsheetEngine.ERROR) < 0);
}
