<?xml version="1.0" encoding="ISO-8859-1"?>
<!--
/**
  * errors.xsl
  * 
  * XSL error 
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" indent="yes"/>

	<xsl:template match="Error">
		<div id="Error">
			<table border='0' cellspacing='0' cellpadding='0' align='center'>
				<tr>
					<td bgcolor='#993232'>
						System Error:
						<xsl:if test='count(ErrorNumber)>0'>
							<xsl:apply-templates select='ErrorNumber'/>
						</xsl:if>
					</td>
				</tr>
				
				<tr>
					<td align="left" valign='top' 
					 width='100%' nowrap='TRUE' bgcolor="#558555">
						<xsl:if test='count(Message)>0'>
							<xsl:apply-templates select='Message'/>
						</xsl:if>
						<br/>
						<xsl:if test='count(File)>0'>
							<xsl:apply-templates select='File'/>
						</xsl:if>
						:
						<xsl:if test='count(Line)>0'>
							<xsl:apply-templates select='Line'/>
						</xsl:if>
					</td>
				</tr>
			</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
