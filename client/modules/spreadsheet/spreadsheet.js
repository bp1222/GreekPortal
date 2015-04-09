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

(function () { // Anonymous function to keep global namespace clean.
	var basePath  = "";
	for (var i = 0, scripts = document.getElementsByTagName("script"); i < scripts.length; i++)
        if (scripts[i].src.match("spreadsheet.js")) { 
            basePath = scripts[i].src.replace("spreadsheet.js", "");
            break;
        }

	document.write('<' + 'script language="javascript" src="' + basePath + 'spreadsheet_engine.js"></' + 'script>');
	document.write('<' + 'script language="javascript" src="' + basePath + 'spreadsheet_ui.js"></' + 'script>');
}) ();
