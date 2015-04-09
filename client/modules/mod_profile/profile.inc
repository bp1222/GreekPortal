<?
/**
  * profile.php 
  * 
  * Profile module
  *
  * @author		David Walker (azrail@csh.rit.edu)
  */

include ("userstruct.inc");
global $portal;

$user_info = $portal->getUser($username);

if ($_REQUEST['submit'])
{
	$sql = "UPDATE users SET ";
	foreach ($userstruct["info"] as $key=>$val)
	{
		$sql .= "$val = '".$portal->escapeString($_REQUEST[$val])."', ";
	}
	$sql = substr($sql, 0, strlen($sql) - 2);
	$sql .= " WHERE username = '".$portal->escapeString($username)."'";

	$portal->dbQuery($sql);
?>
<box>
	Updated Profile
</box>
<?
	return;
}

?>
<box>
	<form method="post" action="?action=MODIFY">
		<table>
<?
			foreach ($userstruct["info"] as $key=>$val)
			{
				echo "<tr>\n";
					echo "<td>$key</td>\n";
					if ($edit)
						echo "<td><input type='text' name='$val' value='".$user_info[$val]."'/></td>\n";
					else
						echo "<td>".$user_info[$val]."</td>\n";
				echo "</tr>\n";
			}
			if ($edit)
				echo "<input type='submit' name='submit' value='Update'/>";
				echo "<input type='hidden' name='member' value='$username'/>";
?>
		</table>
	</form>
</box>
