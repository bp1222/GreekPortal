<?
/**
  * profile.php 
  * 
  * Profile module
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

function printMembers() 
{
	global $portal;
	
	$result = $portal->dbQuery("SELECT * FROM users");

		while ($row = mysql_fetch_assoc($result))
			echo "<tr><td><a href='profile.php?action=VIEW&amp;member=".$row['username']."'>".$row['username']."</a></td></tr>";
}

?>
<box>
	<table>
		<th>Member List</th>
<?
		printMembers()
?>
	</table>
</box>
