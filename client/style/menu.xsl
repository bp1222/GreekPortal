<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" indent="yes"/>

	<xsl:template match="*|@*|processing-instruction()|comment()">
		<xsl:copy>
			<xsl:apply-templates select="*|@*|text()|processing-instruction()|comment()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="Menu/caption">
		<xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="MenuItem/caption">
		<xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="MenuBar">
		<div class="menuBar">
			<xsl:for-each select='Menu'>
				<xsl:apply-templates select='.' mode='bar'/>
			</xsl:for-each>
		</div>
		<xsl:apply-templates select='descendant::Menu'/>
	</xsl:template>

	<xsl:template match="MenuBar/Menu" mode='bar'>
	    <xsl:choose>
			<xsl:when test='count(MenuItem) > 0'>
				<a class="menuButton" href="">
					<xsl:attribute name='onclick'>
						return buttonClick(event, '<xsl:value-of select='generate-id()'/>');
					</xsl:attribute>
					<xsl:attribute name='onmouseover'>
						buttonMouseover(event, '<xsl:value-of select='generate-id()'/>');
					</xsl:attribute>
					<xsl:apply-templates select='caption'/>
				</a>
			</xsl:when>
			<xsl:otherwise>
				<a class="menuButton">
					<xsl:attribute name='href'><xsl:value-of select='@href'/></xsl:attribute>
					<xsl:apply-templates select='caption'/>
				</a>
			</xsl:otherwise>
	    </xsl:choose>
	</xsl:template>

	<xsl:template match="Menu/Menu" mode='bar'>
		<xsl:if test='count(MenuItem) > 0'>
			<a class="menuItem" href="">
				<xsl:attribute name='onclick'>return false;</xsl:attribute>
				<xsl:attribute name='onmouseover'>menuItemMouseover(event, '<xsl:value-of select='generate-id()'/>');</xsl:attribute>
				<span class="menuItemText"><xsl:apply-templates select='caption'/></span>
				<span class="menuItemArrow">&#9654;</span>
			</a>
		</xsl:if>
	</xsl:template>

	<xsl:template match="Menu">
		<div class="menu" onmouseover="menuMouseover(event)">
			<xsl:attribute name='id'><xsl:value-of select='generate-id()'/></xsl:attribute>
			<xsl:apply-templates select='MenuItem|Menu' mode='bar'/>
		</div>
	</xsl:template>

	<xsl:template match="MenuItem" mode='bar'>
		<a class="menuItem">
			<xsl:attribute name='href'><xsl:value-of select='@href'/></xsl:attribute>
	        <xsl:attribute name='onclick'>pleaseWait();</xsl:attribute>
			<span class="menuItemText">
				<xsl:apply-templates select='caption'/>
			</span>
		</a>
	</xsl:template>

</xsl:stylesheet>
