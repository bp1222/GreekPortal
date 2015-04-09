<?xml version="1.0" encoding="ISO-8859-1"?>
<!--
/**
  * portal.xsl
  * 
  * This file has the main stylesheet for the XML of the portal
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" indent="yes"/>

	<xsl:template match="*|@*|processing-instruction()|comment()">
		<xsl:copy>
			<xsl:apply-templates select="*|@*|text()|processing-instruction()|comment()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="Error">
		<!-- Make it pretty here -->
	</xsl:template>

	<xsl:template match="box">
		<xsl:call-template name='box'/>
	</xsl:template>
	
	<xsl:template name="box">
		<table  rder='0' cellspacing='0' cellpadding='0' align='center'>
			<xsl:for-each select="@*">
				<xsl:copy/>
			</xsl:for-each>

			<xsl:variable name='o' select='generate-id(child::box[1])'/>
		
			<span class="text">
				<xsl:apply-templates select=
				 'child::node()[not(self::caption) 
				 and 
				 generate-id(following-sibling::box[1])=$o]'/>
			</span>
		</table>

	</xsl:template>

</xsl:stylesheet>

