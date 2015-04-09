<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" indent="yes"/>

	<xsl:template match="body">
	    <xsl:call-template name='body'/>
	</xsl:template>
	
	<xsl:template name="body">
		<script type="text/javascript" src="javaScript/jquery.js"/>
		<script type="text/javascript" src="javaScript/menu.js"/>
		<script type="text/javascript" src="javaScript/util.js"/>
		<body topmargin="0" leftmargin="0" marginheight="0" marginwidth="0">
			<link rel="stylesheet" type="text/css" href="style/portal.css"/>
			<link rel="stylesheet" type="text/css" href="style/menu.css"/>
			<div id="container">
				<div id="header">
					<img src="images/t_01.gif"/>
					<img src="images/t_02.gif"/>
				</div>

				<div id="menuBar">
					<xsl:apply-templates select='MenuBar'/>
				</div>

				<!-- Not needed yet, however good to have around
				  - Displays a waiting bar
				<span id='wait_msg' style='display:none'>
						<font color='white'>Please Wait...</font>
						<img src="images/wait.gif" style='vertical-align:middle' align='center'/>
				</span>
				-->
				
				<div id="mainContent">
						<xsl:apply-templates select="node()[not(self::MenuBar)][not(self::SideBar)]|@*|text()|processing-instruction()|comment()"/>
				</div>

<!-- Taking out footer, may add later
				<div id="footer">
					<xsl:text disable-output-escaping="yes">
						&#xA9; 2006-2007 David Walker
					</xsl:text>
					<br/>
					The site is under heavy development and probably has little functionality at this time.
					<br/>
					This site currently works with Firefox 1.5 and up.  Other browers may not work right yet.
				</div>
-->

			</div>
		</body>
	</xsl:template>

</xsl:stylesheet>
