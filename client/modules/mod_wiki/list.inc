<?
/**
  * list.inc
  *
  * The wiki Module
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

$sql = "SELECT * FROM wiki";
$page_info = $portal->dbQuery($sql);
?>
<box width="100%">
	<table width="100%" cellpadding="2" cellspacing="1">
		<td>
			<span class="theader">Pages</span>
			<?while ($row = mysql_fetch_assoc($page_info)){?>
				<tr> 
					<td>
						<a href="?wikiaction=editpage&amp;page=<?=$row['page']?>"><?=$row['page']?></a>
					</td>	
				</tr>
			<?}?>
			<br/>
		</td>
	</table>
</box>
